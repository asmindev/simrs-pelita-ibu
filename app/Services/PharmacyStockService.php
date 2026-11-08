<?php

namespace App\Services;

use App\Models\Dispensing;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\PrescriptionItem;
use App\Models\StockMovement;
use App\Models\StockReturn;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PharmacyStockService
{
    /**
     * Dispense a prescription item using FEFO allocation with row locking.
     *
     * @return \Illuminate\Support\Collection<int, Dispensing>
     *
     * @throws ValidationException
     */
    public function dispenseItem(PrescriptionItem $item, User $user, ?string $notes = null): \Illuminate\Support\Collection
    {
        return DB::transaction(function () use ($item, $user, $notes) {
            $remainingNeeded = $item->quantity - $item->dispensed_quantity;

            if ($remainingNeeded <= 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Item obat {$item->drug->name} sudah selesai di-dispense.",
                ]);
            }

            // Lock candidate batches for update in FEFO order (earliest expiry first)
            /** @var Collection<int, DrugBatch> $batches */
            $batches = DrugBatch::query()
                ->where('drug_id', $item->drug_id)
                ->fefoAvailable()
                ->lockForUpdate()
                ->get();

            $totalAvailable = $batches->sum('current_quantity');

            if ($totalAvailable < $remainingNeeded) {
                throw ValidationException::withMessages([
                    'stock' => "Stok obat {$item->drug->name} tidak mencukupi (tersedia: {$totalAvailable}, dibutuhkan: {$remainingNeeded}).",
                ]);
            }

            $createdDispensings = collect();
            $allocatedTotal = 0;

            foreach ($batches as $batch) {
                if ($remainingNeeded <= 0) {
                    break;
                }

                $take = min($batch->current_quantity, $remainingNeeded);
                $balanceBefore = $batch->current_quantity;
                $balanceAfter = $balanceBefore - $take;

                $batch->update([
                    'current_quantity' => $balanceAfter,
                ]);

                $dispensing = Dispensing::create([
                    'prescription_id' => $item->prescription_id,
                    'prescription_item_id' => $item->id,
                    'drug_batch_id' => $batch->id,
                    'quantity' => $take,
                    'dispensed_by' => $user->id,
                    'dispensed_at' => now(),
                    'notes' => $notes,
                ]);

                StockMovement::create([
                    'drug_id' => $item->drug_id,
                    'drug_batch_id' => $batch->id,
                    'type' => 'dispensing',
                    'quantity' => -$take,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter,
                    'reference_type' => Dispensing::class,
                    'reference_id' => $dispensing->id,
                    'reason' => "Penyerahan resep #{$item->prescription->prescription_number}",
                    'user_id' => $user->id,
                ]);

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
     * Adjust stock for a batch (e.g. opname, correction) with audit trail.
     *
     * @throws ValidationException
     */
    public function adjustStock(DrugBatch $batch, int $newQuantity, string $reason, User $user): StockMovement
    {
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

        return DB::transaction(function () use ($batch, $newQuantity, $reason, $user) {
            /** @var DrugBatch $lockedBatch */
            $lockedBatch = DrugBatch::query()->where('id', $batch->id)->lockForUpdate()->firstOrFail();

            $balanceBefore = $lockedBatch->current_quantity;
            $delta = $newQuantity - $balanceBefore;
            $balanceAfter = $newQuantity;

            $lockedBatch->update([
                'current_quantity' => $balanceAfter,
            ]);

            return StockMovement::create([
                'drug_id' => $lockedBatch->drug_id,
                'drug_batch_id' => $lockedBatch->id,
                'type' => 'adjustment',
                'quantity' => $delta,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reason' => $reason,
                'user_id' => $user->id,
            ]);
        });
    }

    /**
     * Return a dispensed drug back to batch stock with reason.
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

        return DB::transaction(function () use ($dispensing, $quantity, $reason, $user) {
            /** @var DrugBatch $lockedBatch */
            $lockedBatch = DrugBatch::query()->where('id', $dispensing->drug_batch_id)->lockForUpdate()->firstOrFail();

            $balanceBefore = $lockedBatch->current_quantity;
            $balanceAfter = $balanceBefore + $quantity;

            $lockedBatch->update([
                'current_quantity' => $balanceAfter,
            ]);

            $stockReturn = StockReturn::create([
                'prescription_id' => $dispensing->prescription_id,
                'prescription_item_id' => $dispensing->prescription_item_id,
                'drug_batch_id' => $lockedBatch->id,
                'quantity' => $quantity,
                'return_reason' => $reason,
                'returned_by' => $user->id,
                'returned_at' => now(),
            ]);

            StockMovement::create([
                'drug_id' => $lockedBatch->drug_id,
                'drug_batch_id' => $lockedBatch->id,
                'type' => 'return',
                'quantity' => $quantity,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_type' => StockReturn::class,
                'reference_id' => $stockReturn->id,
                'reason' => $reason,
                'user_id' => $user->id,
            ]);

            // Update prescription item dispensed quantity
            $item = $dispensing->prescriptionItem;
            $newItemDispensed = max(0, $item->dispensed_quantity - $quantity);
            $item->update([
                'dispensed_quantity' => $newItemDispensed,
                'status' => $newItemDispensed >= $item->quantity ? 'dispensed' : 'pending',
            ]);

            return $stockReturn;
        });
    }
}
