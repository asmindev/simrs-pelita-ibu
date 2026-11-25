<?php

namespace App\Services;

use App\Enums\StockLocationUsage;
use App\Enums\StockMoveType;
use App\Models\Dispensing;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\PrescriptionItem;
use App\Models\StockLocation;
use App\Models\StockMovement;
use App\Models\StockQuant;
use App\Models\StockReturn;
use App\Models\StockValuationLayer;
use App\Models\User;
use Database\Seeders\StockLocationSeeder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PharmacyStockService
{
    /**
     * Ensure standard Odoo-style locations exist and return them keyed by code.
     *
     * @return array<string, StockLocation>
     */
    public function ensureDefaultLocations(): array
    {
        return StockLocationSeeder::ensureDefaults();
    }

    /**
     * Create a new drug batch with initial inbound stock move, quant, and valuation layer.
     *
     * @param  array{
     *     drug_id: int,
     *     batch_number: string,
     *     expiry_date: string,
     *     initial_quantity: int,
     *     buy_price?: int|null,
     *     stock_location_id?: int|null,
     *     origin?: string|null,
     *     reason?: string|null
     * }  $data
     */
    public function createBatchWithInboundMove(array $data, User $user): DrugBatch
    {
        return DB::transaction(function () use ($data, $user): DrugBatch {
            $locations = $this->ensureDefaultLocations();
            $vendorsLocation = $locations[StockLocation::CODE_VENDORS];
            $destination = $this->resolveInternalLocation($data['stock_location_id'] ?? null, $locations);

            $qty = (int) $data['initial_quantity'];
            $buyPrice = (int) ($data['buy_price'] ?? 0);

            $batch = DrugBatch::create([
                'drug_id' => (int) $data['drug_id'],
                'batch_number' => $data['batch_number'],
                'expiry_date' => $data['expiry_date'],
                'initial_quantity' => $qty,
                'current_quantity' => $qty,
                'buy_price' => $buyPrice,
                'is_active' => true,
            ]);

            StockQuant::query()->create([
                'stock_location_id' => $destination->id,
                'drug_id' => $batch->drug_id,
                'drug_batch_id' => $batch->id,
                'quantity' => $qty,
            ]);

            $referenceNumber = $this->generateReferenceNumber(StockMoveType::In);
            $totalValue = $qty * $buyPrice;
            $reason = isset($data['reason']) && trim($data['reason']) !== ''
                ? trim($data['reason'])
                : 'Penerimaan stok awal batch baru.';

            $movement = StockMovement::create([
                'reference_number' => $referenceNumber,
                'drug_id' => $batch->drug_id,
                'drug_batch_id' => $batch->id,
                'source_location_id' => $vendorsLocation->id,
                'destination_location_id' => $destination->id,
                'type' => StockMoveType::In->value,
                'quantity' => $qty,
                'balance_before' => 0,
                'balance_after' => $qty,
                'unit_cost' => $buyPrice,
                'total_value' => $totalValue,
                'origin' => $data['origin'] ?? null,
                'state' => 'done',
                'reason' => $reason,
                'user_id' => $user->id,
            ]);

            StockValuationLayer::create([
                'drug_id' => $batch->drug_id,
                'drug_batch_id' => $batch->id,
                'stock_movement_id' => $movement->id,
                'stock_location_id' => $destination->id,
                'quantity' => $qty,
                'remaining_qty' => $qty,
                'unit_cost' => $buyPrice,
                'value' => $totalValue,
                'remaining_value' => $totalValue,
                'reference' => $referenceNumber,
                'description' => $reason,
                'user_id' => $user->id,
            ]);

            return $batch;
        });
    }

    /**
     * Execute an Odoo 17-style stock move (in, out, transfer, adjustment) immediately as 'done'.
     *
     * @param  array{
     *     type: string,
     *     drug_id: int,
     *     drug_batch_id?: int|null,
     *     source_location_id?: int|null,
     *     destination_location_id?: int|null,
     *     quantity?: int|null,
     *     new_quantity?: int|null,
     *     unit_cost?: int|null,
     *     origin?: string|null,
     *     reason: string
     * }  $data
     * @return Collection<int, StockMovement>
     *
     * @throws ValidationException
     */
    public function recordStockMove(array $data, User $user): Collection
    {
        $type = StockMoveType::from($data['type']);
        $reason = trim($data['reason']);

        if ($reason === '') {
            throw ValidationException::withMessages([
                'reason' => 'Alasan atau keterangan pergerakan stok wajib diisi.',
            ]);
        }

        return match ($type) {
            StockMoveType::In => $this->executeInboundMove($data, $reason, $user),
            StockMoveType::Out => $this->executeOutboundMove($data, $reason, $user),
            StockMoveType::Transfer => $this->executeInternalTransfer($data, $reason, $user),
            StockMoveType::Adjustment, StockMoveType::Opname => $this->executeAdjustmentFromMove($data, $reason, $user),
            default => throw ValidationException::withMessages([
                'type' => 'Tipe pergerakan stok tidak didukung pada transaksi manual.',
            ]),
        };
    }

    /**
     * Dispense a prescription item using FEFO allocation with row locking and SVL consumption.
     *
     * @return Collection<int, Dispensing>
     *
     * @throws ValidationException
     */
    public function dispenseItem(PrescriptionItem $item, User $user, ?string $notes = null): Collection
    {
        return DB::transaction(function () use ($item, $user, $notes): Collection {
            $remainingNeeded = $item->quantity - $item->dispensed_quantity;

            if ($remainingNeeded <= 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Item obat {$item->drug->name} sudah selesai di-dispense.",
                ]);
            }

            $locations = $this->ensureDefaultLocations();
            $defaultWarehouse = $locations[StockLocation::CODE_DEFAULT_WAREHOUSE];
            $customersLocation = $locations[StockLocation::CODE_CUSTOMERS];

            $this->syncMissingQuantsForDrug($item->drug_id, $defaultWarehouse);

            /** @var EloquentCollection<int, StockQuant> $quants */
            $quants = StockQuant::query()
                ->select('stock_quants.*')
                ->join('drug_batches', 'drug_batches.id', '=', 'stock_quants.drug_batch_id')
                ->join('stock_locations', 'stock_locations.id', '=', 'stock_quants.stock_location_id')
                ->where('stock_quants.drug_id', $item->drug_id)
                ->where('stock_quants.quantity', '>', 0)
                ->where('stock_locations.usage', StockLocationUsage::Internal->value)
                ->where('stock_locations.is_active', true)
                ->where('stock_locations.code', '!=', StockLocation::CODE_QUARANTINE)
                ->where('drug_batches.is_active', true)
                ->whereDate('drug_batches.expiry_date', '>=', Carbon::today())
                ->orderBy('drug_batches.expiry_date', 'asc')
                ->orderByDesc('stock_locations.is_default_warehouse')
                ->orderBy('stock_quants.id', 'asc')
                ->lockForUpdate()
                ->get();

            $totalAvailable = $quants->sum('quantity');

            if ($totalAvailable < $remainingNeeded) {
                throw ValidationException::withMessages([
                    'stock' => "Stok obat {$item->drug->name} tidak mencukupi (tersedia: {$totalAvailable}, dibutuhkan: {$remainingNeeded}).",
                ]);
            }

            $createdDispensings = collect();
            $allocatedTotal = 0;
            $prescriptionNumber = $item->prescription->prescription_number;

            foreach ($quants as $quant) {
                if ($remainingNeeded <= 0) {
                    break;
                }

                /** @var DrugBatch $batch */
                $batch = DrugBatch::query()->where('id', $quant->drug_batch_id)->lockForUpdate()->firstOrFail();

                $take = min($quant->quantity, $remainingNeeded);
                $balanceBefore = $quant->quantity;
                $balanceAfter = $balanceBefore - $take;

                $quant->update(['quantity' => $balanceAfter]);
                $this->syncBatchQuantityFromQuants($batch);

                $dispensing = Dispensing::create([
                    'prescription_id' => $item->prescription_id,
                    'prescription_item_id' => $item->id,
                    'drug_batch_id' => $batch->id,
                    'quantity' => $take,
                    'dispensed_by' => $user->id,
                    'dispensed_at' => now(),
                    'notes' => $notes,
                ]);

                $referenceNumber = $this->generateReferenceNumber(StockMoveType::Dispensing);
                $reason = "Penyerahan resep #{$prescriptionNumber}";

                $movement = StockMovement::create([
                    'reference_number' => $referenceNumber,
                    'drug_id' => $item->drug_id,
                    'drug_batch_id' => $batch->id,
                    'source_location_id' => $quant->stock_location_id,
                    'destination_location_id' => $customersLocation->id,
                    'type' => StockMoveType::Dispensing->value,
                    'quantity' => -$take,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                    'unit_cost' => $batch->buy_price,
                    'total_value' => -($take * $batch->buy_price),
                    'reference_type' => Dispensing::class,
                    'reference_id' => $dispensing->id,
                    'origin' => $prescriptionNumber,
                    'state' => 'done',
                    'reason' => $reason,
                    'user_id' => $user->id,
                ]);

                $this->consumeValuationLayers(
                    batch: $batch,
                    quantityToConsume: $take,
                    movement: $movement,
                    locationId: $quant->stock_location_id,
                    user: $user,
                    reference: $referenceNumber,
                    description: $reason,
                );

                $createdDispensings->push($dispensing);
                $allocatedTotal += $take;
                $remainingNeeded -= $take;
            }

            $item->update([
                'dispensed_quantity' => $item->dispensed_quantity + $allocatedTotal,
                'status' => 'dispensed',
            ]);

            return $createdDispensings;
        });
    }

    /**
     * Adjust stock for a batch at a specific internal location with audit & valuation trail.
     *
     * @throws ValidationException
     */
    public function adjustStock(
        DrugBatch $batch,
        int $newQuantity,
        string $reason,
        User $user,
        ?StockLocation $location = null,
    ): StockMovement {
        if ($newQuantity < 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Stok obat tidak boleh bernilai negatif.',
            ]);
        }

        if (trim($reason) === '') {
            throw ValidationException::withMessages([
                'reason' => 'Alasan penyesuaian stok wajib diisi.',
            ]);
        }

        return DB::transaction(function () use ($batch, $newQuantity, $reason, $user, $location): StockMovement {
            $locations = $this->ensureDefaultLocations();
            $defaultWarehouse = $locations[StockLocation::CODE_DEFAULT_WAREHOUSE];
            $lossLocation = $locations[StockLocation::CODE_INVENTORY_LOSS];

            /** @var DrugBatch $lockedBatch */
            $lockedBatch = DrugBatch::query()->where('id', $batch->id)->lockForUpdate()->firstOrFail();

            $this->syncMissingQuantsForBatch($lockedBatch, $defaultWarehouse);

            $targetLocation = $this->resolveAdjustmentLocation($lockedBatch, $location, $defaultWarehouse);

            /** @var StockQuant $quant */
            $quant = StockQuant::query()
                ->where('stock_location_id', $targetLocation->id)
                ->where('drug_id', $lockedBatch->drug_id)
                ->where('drug_batch_id', $lockedBatch->id)
                ->lockForUpdate()
                ->firstOrCreate(
                    [
                        'stock_location_id' => $targetLocation->id,
                        'drug_id' => $lockedBatch->drug_id,
                        'drug_batch_id' => $lockedBatch->id,
                    ],
                    ['quantity' => 0],
                );

            $balanceBefore = $quant->quantity;
            $delta = $newQuantity - $balanceBefore;
            $balanceAfter = $newQuantity;

            $quant->update(['quantity' => $balanceAfter]);
            $this->syncBatchQuantityFromQuants($lockedBatch);

            $sourceLocationId = $delta >= 0 ? $lossLocation->id : $targetLocation->id;
            $destinationLocationId = $delta >= 0 ? $targetLocation->id : $lossLocation->id;
            $referenceNumber = $this->generateReferenceNumber(StockMoveType::Adjustment);
            $unitCost = $lockedBatch->buy_price;

            $movement = StockMovement::create([
                'reference_number' => $referenceNumber,
                'drug_id' => $lockedBatch->drug_id,
                'drug_batch_id' => $lockedBatch->id,
                'source_location_id' => $sourceLocationId,
                'destination_location_id' => $destinationLocationId,
                'type' => StockMoveType::Adjustment->value,
                'quantity' => $delta,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'unit_cost' => $unitCost,
                'total_value' => $delta * $unitCost,
                'state' => 'done',
                'reason' => $reason,
                'user_id' => $user->id,
            ]);

            if ($delta > 0) {
                StockValuationLayer::create([
                    'drug_id' => $lockedBatch->drug_id,
                    'drug_batch_id' => $lockedBatch->id,
                    'stock_movement_id' => $movement->id,
                    'stock_location_id' => $targetLocation->id,
                    'quantity' => $delta,
                    'remaining_qty' => $delta,
                    'unit_cost' => $unitCost,
                    'value' => $delta * $unitCost,
                    'remaining_value' => $delta * $unitCost,
                    'reference' => $referenceNumber,
                    'description' => $reason,
                    'user_id' => $user->id,
                ]);
            } elseif ($delta < 0) {
                $this->consumeValuationLayers(
                    batch: $lockedBatch,
                    quantityToConsume: abs($delta),
                    movement: $movement,
                    locationId: $targetLocation->id,
                    user: $user,
                    reference: $referenceNumber,
                    description: $reason,
                );
            }

            return $movement;
        });
    }

    /**
     * Return a dispensed drug back to batch stock with valuation restoration.
     *
     * @throws ValidationException
     */
    public function returnDispensed(Dispensing $dispensing, int $quantity, string $reason, User $user): StockReturn
    {
        if ($quantity <= 0 || $quantity > $dispensing->quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Jumlah retur tidak valid (maksimal {$dispensing->quantity}).",
            ]);
        }

        if (trim($reason) === '') {
            throw ValidationException::withMessages([
                'reason' => 'Alasan retur wajib diisi.',
            ]);
        }

        return DB::transaction(function () use ($dispensing, $quantity, $reason, $user): StockReturn {
            $locations = $this->ensureDefaultLocations();
            $defaultWarehouse = $locations[StockLocation::CODE_DEFAULT_WAREHOUSE];
            $customersLocation = $locations[StockLocation::CODE_CUSTOMERS];

            /** @var DrugBatch $lockedBatch */
            $lockedBatch = DrugBatch::query()->where('id', $dispensing->drug_batch_id)->lockForUpdate()->firstOrFail();

            $this->syncMissingQuantsForBatch($lockedBatch, $defaultWarehouse);

            // Return to the location where dispensing happened if known, otherwise default warehouse
            $originalDispenseMove = StockMovement::query()
                ->where('reference_type', Dispensing::class)
                ->where('reference_id', $dispensing->id)
                ->first();

            $returnLocationId = $originalDispenseMove?->source_location_id ?? $defaultWarehouse->id;

            /** @var StockQuant $quant */
            $quant = StockQuant::query()
                ->where('stock_location_id', $returnLocationId)
                ->where('drug_id', $lockedBatch->drug_id)
                ->where('drug_batch_id', $lockedBatch->id)
                ->lockForUpdate()
                ->firstOrCreate(
                    [
                        'stock_location_id' => $returnLocationId,
                        'drug_id' => $lockedBatch->drug_id,
                        'drug_batch_id' => $lockedBatch->id,
                    ],
                    ['quantity' => 0],
                );

            $balanceBefore = $quant->quantity;
            $balanceAfter = $balanceBefore + $quantity;

            $quant->update(['quantity' => $balanceAfter]);
            $this->syncBatchQuantityFromQuants($lockedBatch);

            $stockReturn = StockReturn::create([
                'prescription_id' => $dispensing->prescription_id,
                'prescription_item_id' => $dispensing->prescription_item_id,
                'drug_batch_id' => $lockedBatch->id,
                'quantity' => $quantity,
                'return_reason' => $reason,
                'returned_by' => $user->id,
                'returned_at' => now(),
            ]);

            $referenceNumber = $this->generateReferenceNumber(StockMoveType::Return);
            $unitCost = $lockedBatch->buy_price;
            $totalValue = $quantity * $unitCost;

            $movement = StockMovement::create([
                'reference_number' => $referenceNumber,
                'drug_id' => $lockedBatch->drug_id,
                'drug_batch_id' => $lockedBatch->id,
                'source_location_id' => $customersLocation->id,
                'destination_location_id' => $returnLocationId,
                'type' => StockMoveType::Return->value,
                'quantity' => $quantity,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'unit_cost' => $unitCost,
                'total_value' => $totalValue,
                'reference_type' => StockReturn::class,
                'reference_id' => $stockReturn->id,
                'origin' => $dispensing->prescription?->prescription_number,
                'state' => 'done',
                'reason' => $reason,
                'user_id' => $user->id,
            ]);

            StockValuationLayer::create([
                'drug_id' => $lockedBatch->drug_id,
                'drug_batch_id' => $lockedBatch->id,
                'stock_movement_id' => $movement->id,
                'stock_location_id' => $returnLocationId,
                'quantity' => $quantity,
                'remaining_qty' => $quantity,
                'unit_cost' => $unitCost,
                'value' => $totalValue,
                'remaining_value' => $totalValue,
                'reference' => $referenceNumber,
                'description' => $reason,
                'user_id' => $user->id,
            ]);

            $item = $dispensing->prescriptionItem;
            $newItemDispensed = max(0, $item->dispensed_quantity - $quantity);
            $item->update([
                'dispensed_quantity' => $newItemDispensed,
                'status' => $newItemDispensed >= $item->quantity ? 'dispensed' : 'pending',
            ]);

            return $stockReturn;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return Collection<int, StockMovement>
     *
     * @throws ValidationException
     */
    private function executeInboundMove(array $data, string $reason, User $user): Collection
    {
        $qty = (int) ($data['quantity'] ?? 0);

        if ($qty <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Kuantitas penerimaan stok harus lebih dari 0.',
            ]);
        }

        return DB::transaction(function () use ($data, $qty, $reason, $user): Collection {
            $locations = $this->ensureDefaultLocations();
            $defaultWarehouse = $locations[StockLocation::CODE_DEFAULT_WAREHOUSE];
            $vendorsLocation = $locations[StockLocation::CODE_VENDORS];

            $source = $this->resolveLocationById($data['source_location_id'] ?? null, $vendorsLocation);
            $destination = $this->resolveInternalLocation($data['destination_location_id'] ?? null, $locations);

            if (empty($data['drug_batch_id'])) {
                throw ValidationException::withMessages([
                    'drug_batch_id' => 'Pilih batch obat tujuan penerimaan stok.',
                ]);
            }

            /** @var DrugBatch $batch */
            $batch = DrugBatch::query()
                ->where('id', (int) $data['drug_batch_id'])
                ->where('drug_id', (int) $data['drug_id'])
                ->lockForUpdate()
                ->first();

            if (! $batch) {
                throw ValidationException::withMessages([
                    'drug_batch_id' => 'Batch obat tidak ditemukan untuk obat yang dipilih.',
                ]);
            }

            $this->syncMissingQuantsForBatch($batch, $defaultWarehouse);

            /** @var StockQuant $quant */
            $quant = StockQuant::query()
                ->where('stock_location_id', $destination->id)
                ->where('drug_id', $batch->drug_id)
                ->where('drug_batch_id', $batch->id)
                ->lockForUpdate()
                ->firstOrCreate(
                    [
                        'stock_location_id' => $destination->id,
                        'drug_id' => $batch->drug_id,
                        'drug_batch_id' => $batch->id,
                    ],
                    ['quantity' => 0],
                );

            $balanceBefore = $quant->quantity;
            $balanceAfter = $balanceBefore + $qty;

            $quant->update(['quantity' => $balanceAfter]);
            $this->syncBatchQuantityFromQuants($batch);

            $unitCost = isset($data['unit_cost']) && $data['unit_cost'] !== null
                ? (int) $data['unit_cost']
                : $batch->buy_price;
            $totalValue = $qty * $unitCost;
            $referenceNumber = $this->generateReferenceNumber(StockMoveType::In);

            $movement = StockMovement::create([
                'reference_number' => $referenceNumber,
                'drug_id' => $batch->drug_id,
                'drug_batch_id' => $batch->id,
                'source_location_id' => $source->id,
                'destination_location_id' => $destination->id,
                'type' => StockMoveType::In->value,
                'quantity' => $qty,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'unit_cost' => $unitCost,
                'total_value' => $totalValue,
                'origin' => $data['origin'] ?? null,
                'state' => 'done',
                'reason' => $reason,
                'user_id' => $user->id,
            ]);

            StockValuationLayer::create([
                'drug_id' => $batch->drug_id,
                'drug_batch_id' => $batch->id,
                'stock_movement_id' => $movement->id,
                'stock_location_id' => $destination->id,
                'quantity' => $qty,
                'remaining_qty' => $qty,
                'unit_cost' => $unitCost,
                'value' => $totalValue,
                'remaining_value' => $totalValue,
                'reference' => $referenceNumber,
                'description' => $reason,
                'user_id' => $user->id,
            ]);

            return collect([$movement]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return Collection<int, StockMovement>
     *
     * @throws ValidationException
     */
    private function executeOutboundMove(array $data, string $reason, User $user): Collection
    {
        $qty = (int) ($data['quantity'] ?? 0);

        if ($qty <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Kuantitas pengeluaran stok harus lebih dari 0.',
            ]);
        }

        return DB::transaction(function () use ($data, $qty, $reason, $user): Collection {
            $locations = $this->ensureDefaultLocations();
            $defaultWarehouse = $locations[StockLocation::CODE_DEFAULT_WAREHOUSE];
            $customersLocation = $locations[StockLocation::CODE_CUSTOMERS];

            $source = $this->resolveInternalLocation($data['source_location_id'] ?? null, $locations);
            $destination = $this->resolveLocationById($data['destination_location_id'] ?? null, $customersLocation);

            if ($destination->usage === StockLocationUsage::Internal) {
                throw ValidationException::withMessages([
                    'destination_location_id' => 'Pengeluaran stok harus menuju lokasi eksternal/loss. Gunakan Transfer untuk antar lokasi internal.',
                ]);
            }

            $allowExpired = $destination->usage === StockLocationUsage::Inventory;
            $drugId = (int) $data['drug_id'];
            $this->syncMissingQuantsForDrug($drugId, $defaultWarehouse);

            $quants = $this->lockCandidateQuants(
                drugId: $drugId,
                sourceLocationId: $source->id,
                batchId: ! empty($data['drug_batch_id']) ? (int) $data['drug_batch_id'] : null,
                allowExpired: $allowExpired,
            );

            $totalAvailable = $quants->sum('quantity');

            if ($totalAvailable < $qty) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok di {$source->name} tidak mencukupi (tersedia: {$totalAvailable}, diminta: {$qty}).",
                ]);
            }

            $movements = collect();
            $remaining = $qty;

            foreach ($quants as $quant) {
                if ($remaining <= 0) {
                    break;
                }

                /** @var DrugBatch $batch */
                $batch = DrugBatch::query()->where('id', $quant->drug_batch_id)->lockForUpdate()->firstOrFail();

                $take = min($quant->quantity, $remaining);
                $balanceBefore = $quant->quantity;
                $balanceAfter = $balanceBefore - $take;

                $quant->update(['quantity' => $balanceAfter]);
                $this->syncBatchQuantityFromQuants($batch);

                $referenceNumber = $this->generateReferenceNumber(StockMoveType::Out);

                $movement = StockMovement::create([
                    'reference_number' => $referenceNumber,
                    'drug_id' => $drugId,
                    'drug_batch_id' => $batch->id,
                    'source_location_id' => $source->id,
                    'destination_location_id' => $destination->id,
                    'type' => StockMoveType::Out->value,
                    'quantity' => -$take,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                    'unit_cost' => $batch->buy_price,
                    'total_value' => -($take * $batch->buy_price),
                    'origin' => $data['origin'] ?? null,
                    'state' => 'done',
                    'reason' => $reason,
                    'user_id' => $user->id,
                ]);

                $this->consumeValuationLayers(
                    batch: $batch,
                    quantityToConsume: $take,
                    movement: $movement,
                    locationId: $source->id,
                    user: $user,
                    reference: $referenceNumber,
                    description: $reason,
                );

                $movements->push($movement);
                $remaining -= $take;
            }

            return $movements;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return Collection<int, StockMovement>
     *
     * @throws ValidationException
     */
    private function executeInternalTransfer(array $data, string $reason, User $user): Collection
    {
        $qty = (int) ($data['quantity'] ?? 0);

        if ($qty <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Kuantitas transfer stok harus lebih dari 0.',
            ]);
        }

        return DB::transaction(function () use ($data, $qty, $reason, $user): Collection {
            $locations = $this->ensureDefaultLocations();
            $defaultWarehouse = $locations[StockLocation::CODE_DEFAULT_WAREHOUSE];

            $source = $this->resolveInternalLocation($data['source_location_id'] ?? null, $locations);
            $destination = $this->resolveInternalLocation($data['destination_location_id'] ?? null, $locations);

            if ($source->id === $destination->id) {
                throw ValidationException::withMessages([
                    'destination_location_id' => 'Lokasi tujuan transfer harus berbeda dengan lokasi asal.',
                ]);
            }

            $allowExpired = $destination->code === StockLocation::CODE_QUARANTINE;
            $drugId = (int) $data['drug_id'];
            $this->syncMissingQuantsForDrug($drugId, $defaultWarehouse);

            $quants = $this->lockCandidateQuants(
                drugId: $drugId,
                sourceLocationId: $source->id,
                batchId: ! empty($data['drug_batch_id']) ? (int) $data['drug_batch_id'] : null,
                allowExpired: $allowExpired,
            );

            $totalAvailable = $quants->sum('quantity');

            if ($totalAvailable < $qty) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok di {$source->name} tidak mencukupi untuk transfer (tersedia: {$totalAvailable}, diminta: {$qty}).",
                ]);
            }

            $movements = collect();
            $remaining = $qty;

            foreach ($quants as $sourceQuant) {
                if ($remaining <= 0) {
                    break;
                }

                /** @var DrugBatch $batch */
                $batch = DrugBatch::query()->where('id', $sourceQuant->drug_batch_id)->lockForUpdate()->firstOrFail();

                $take = min($sourceQuant->quantity, $remaining);
                $sourceBefore = $sourceQuant->quantity;
                $sourceAfter = $sourceBefore - $take;

                $sourceQuant->update(['quantity' => $sourceAfter]);

                /** @var StockQuant $destQuant */
                $destQuant = StockQuant::query()
                    ->where('stock_location_id', $destination->id)
                    ->where('drug_id', $drugId)
                    ->where('drug_batch_id', $batch->id)
                    ->lockForUpdate()
                    ->firstOrCreate(
                        [
                            'stock_location_id' => $destination->id,
                            'drug_id' => $drugId,
                            'drug_batch_id' => $batch->id,
                        ],
                        ['quantity' => 0],
                    );

                $destQuant->update(['quantity' => $destQuant->quantity + $take]);
                $this->syncBatchQuantityFromQuants($batch);

                $referenceNumber = $this->generateReferenceNumber(StockMoveType::Transfer);
                $unitCost = $batch->buy_price;

                $movement = StockMovement::create([
                    'reference_number' => $referenceNumber,
                    'drug_id' => $drugId,
                    'drug_batch_id' => $batch->id,
                    'source_location_id' => $source->id,
                    'destination_location_id' => $destination->id,
                    'type' => StockMoveType::Transfer->value,
                    'quantity' => $take,
                    'balance_before' => $sourceBefore,
                    'balance_after' => $sourceAfter,
                    'unit_cost' => $unitCost,
                    'total_value' => $take * $unitCost,
                    'origin' => $data['origin'] ?? null,
                    'state' => 'done',
                    'reason' => $reason,
                    'user_id' => $user->id,
                ]);

                $movements->push($movement);
                $remaining -= $take;
            }

            return $movements;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return Collection<int, StockMovement>
     *
     * @throws ValidationException
     */
    private function executeAdjustmentFromMove(array $data, string $reason, User $user): Collection
    {
        if (empty($data['drug_batch_id'])) {
            throw ValidationException::withMessages([
                'drug_batch_id' => 'Batch obat wajib dipilih untuk penyesuaian stok.',
            ]);
        }

        if (! isset($data['new_quantity']) || (int) $data['new_quantity'] < 0) {
            throw ValidationException::withMessages([
                'new_quantity' => 'Stok fisik baru tidak boleh bernilai negatif.',
            ]);
        }

        /** @var DrugBatch $batch */
        $batch = DrugBatch::query()
            ->where('id', (int) $data['drug_batch_id'])
            ->where('drug_id', (int) $data['drug_id'])
            ->firstOrFail();

        $locations = $this->ensureDefaultLocations();
        $location = ! empty($data['destination_location_id'])
            ? $this->resolveInternalLocation((int) $data['destination_location_id'], $locations)
            : $this->resolveInternalLocation($data['source_location_id'] ?? null, $locations);

        $movement = $this->adjustStock($batch, (int) $data['new_quantity'], $reason, $user, $location);

        return collect([$movement]);
    }

    /**
     * Consume inbound valuation layers in FIFO order for a specific batch (Specific Batch / FEFO costing).
     */
    private function consumeValuationLayers(
        DrugBatch $batch,
        int $quantityToConsume,
        StockMovement $movement,
        int $locationId,
        User $user,
        string $reference,
        string $description,
    ): StockValuationLayer {
        /** @var EloquentCollection<int, StockValuationLayer> $inboundLayers */
        $inboundLayers = StockValuationLayer::query()
            ->where('drug_batch_id', $batch->id)
            ->where('remaining_qty', '>', 0)
            ->orderBy('id', 'asc')
            ->lockForUpdate()
            ->get();

        $remainingToTake = $quantityToConsume;
        $totalConsumedCost = 0;

        foreach ($inboundLayers as $layer) {
            if ($remainingToTake <= 0) {
                break;
            }

            $take = min($layer->remaining_qty, $remainingToTake);
            $newRemainingQty = $layer->remaining_qty - $take;
            $consumedCost = $take * $layer->unit_cost;

            $layer->update([
                'remaining_qty' => $newRemainingQty,
                'remaining_value' => $newRemainingQty * $layer->unit_cost,
            ]);

            $totalConsumedCost += $consumedCost;
            $remainingToTake -= $take;
        }

        // Fallback to batch buy_price if batch stock predates SVL tracking (e.g., seeded/factory batches)
        if ($remainingToTake > 0) {
            $totalConsumedCost += $remainingToTake * $batch->buy_price;
        }

        $effectiveUnitCost = $quantityToConsume > 0
            ? (int) round($totalConsumedCost / $quantityToConsume)
            : $batch->buy_price;

        $movement->update([
            'unit_cost' => $effectiveUnitCost,
            'total_value' => -$totalConsumedCost,
        ]);

        return StockValuationLayer::create([
            'drug_id' => $batch->drug_id,
            'drug_batch_id' => $batch->id,
            'stock_movement_id' => $movement->id,
            'stock_location_id' => $locationId,
            'quantity' => -$quantityToConsume,
            'remaining_qty' => 0,
            'unit_cost' => $effectiveUnitCost,
            'value' => -$totalConsumedCost,
            'remaining_value' => 0,
            'reference' => $reference,
            'description' => $description,
            'user_id' => $user->id,
        ]);
    }

    /**
     * Lock candidate stock quants for outbound or transfer operations in FEFO order.
     *
     * @return EloquentCollection<int, StockQuant>
     */
    private function lockCandidateQuants(
        int $drugId,
        int $sourceLocationId,
        ?int $batchId = null,
        bool $allowExpired = false,
    ): EloquentCollection {
        return StockQuant::query()
            ->select('stock_quants.*')
            ->join('drug_batches', 'drug_batches.id', '=', 'stock_quants.drug_batch_id')
            ->where('stock_quants.drug_id', $drugId)
            ->where('stock_quants.stock_location_id', $sourceLocationId)
            ->where('stock_quants.quantity', '>', 0)
            ->where('drug_batches.is_active', true)
            ->when($batchId !== null, fn ($q) => $q->where('stock_quants.drug_batch_id', $batchId))
            ->when(! $allowExpired, fn ($q) => $q->whereDate('drug_batches.expiry_date', '>=', Carbon::today()))
            ->orderBy('drug_batches.expiry_date', 'asc')
            ->orderBy('stock_quants.id', 'asc')
            ->lockForUpdate()
            ->get();
    }

    /**
     * Sync missing stock_quants for all active batches of a drug (backward compatibility for factory/seeded batches).
     */
    private function syncMissingQuantsForDrug(int $drugId, StockLocation $defaultWarehouse): void
    {
        $batches = DrugBatch::query()
            ->where('drug_id', $drugId)
            ->where('current_quantity', '>', 0)
            ->get();

        foreach ($batches as $batch) {
            $this->syncMissingQuantsForBatch($batch, $defaultWarehouse);
        }
    }

    /**
     * Ensure a batch with positive quantity has a quant record if none exists yet.
     */
    private function syncMissingQuantsForBatch(DrugBatch $batch, StockLocation $defaultWarehouse): void
    {
        if ($batch->current_quantity <= 0) {
            return;
        }

        $hasAnyQuant = StockQuant::query()
            ->where('drug_batch_id', $batch->id)
            ->exists();

        if (! $hasAnyQuant) {
            StockQuant::query()->create([
                'stock_location_id' => $defaultWarehouse->id,
                'drug_id' => $batch->drug_id,
                'drug_batch_id' => $batch->id,
                'quantity' => $batch->current_quantity,
            ]);
        }
    }

    /**
     * Keep drug_batches.current_quantity synchronized as the sum of internal location quants.
     */
    private function syncBatchQuantityFromQuants(DrugBatch $batch): void
    {
        $totalInternal = (int) StockQuant::query()
            ->join('stock_locations', 'stock_locations.id', '=', 'stock_quants.stock_location_id')
            ->where('stock_quants.drug_batch_id', $batch->id)
            ->where('stock_locations.usage', StockLocationUsage::Internal->value)
            ->sum('stock_quants.quantity');

        $batch->update(['current_quantity' => max(0, $totalInternal)]);
    }

    /**
     * @param  array<string, StockLocation>  $locations
     *
     * @throws ValidationException
     */
    private function resolveInternalLocation(?int $locationId, array $locations): StockLocation
    {
        if ($locationId === null) {
            return $locations[StockLocation::CODE_DEFAULT_WAREHOUSE];
        }

        /** @var StockLocation|null $location */
        $location = StockLocation::query()
            ->where('id', $locationId)
            ->where('usage', StockLocationUsage::Internal->value)
            ->where('is_active', true)
            ->first();

        if (! $location) {
            throw ValidationException::withMessages([
                'stock_location_id' => 'Lokasi internal farmasi tidak valid atau tidak aktif.',
            ]);
        }

        return $location;
    }

    private function resolveLocationById(?int $locationId, StockLocation $fallback): StockLocation
    {
        if ($locationId === null) {
            return $fallback;
        }

        return StockLocation::query()->where('id', $locationId)->first() ?? $fallback;
    }

    private function resolveAdjustmentLocation(
        DrugBatch $batch,
        ?StockLocation $requested,
        StockLocation $defaultWarehouse,
    ): StockLocation {
        if ($requested !== null) {
            return $requested;
        }

        /** @var StockQuant|null $existingQuant */
        $existingQuant = StockQuant::query()
            ->where('drug_batch_id', $batch->id)
            ->orderByDesc('quantity')
            ->first();

        if ($existingQuant !== null) {
            return $existingQuant->location;
        }

        return $defaultWarehouse;
    }

    private function generateReferenceNumber(StockMoveType $type): string
    {
        $prefix = $type->referencePrefix();
        $today = Carbon::today()->format('Ymd');
        $pattern = "{$prefix}/{$today}-%";

        $count = StockMovement::query()
            ->where('reference_number', 'like', $pattern)
            ->count() + 1;

        return sprintf('%s/%s-%04d', $prefix, $today, $count);
    }
}
