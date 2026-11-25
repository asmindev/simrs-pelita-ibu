<?php

namespace App\Http\Controllers;

use App\Enums\StockLocationUsage;
use App\Http\Requests\StoreStockLocationRequest;
use App\Http\Requests\UpdateStockLocationRequest;
use App\Models\StockLocation;
use App\Models\StockMovement;
use App\Models\StockQuant;
use Database\Seeders\StockLocationSeeder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StockLocationController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', StockLocation::class);

        StockLocationSeeder::ensureDefaults();

        $search = $request->string('search')->trim()->toString();
        $usage = $request->string('usage')->toString();
        $status = $request->string('status')->toString();
        $usageFilter = StockLocationUsage::tryFrom($usage);

        $warehouses = StockLocation::query()
            ->withCount(['quants as active_items_count' => fn (Builder $q) => $q->where('quantity', '>', 0)])
            ->withSum(['quants as total_stock' => fn (Builder $q) => $q->where('quantity', '>', 0)], 'quantity')
            ->when($search !== '', fn (Builder $q) => $q->search($search))
            ->when($usageFilter !== null, fn (Builder $q) => $q->where('usage', $usageFilter->value))
            ->when($status === 'active', fn (Builder $q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $q) => $q->where('is_active', false))
            ->orderByDesc('is_default_warehouse')
            ->orderByRaw("CASE WHEN `usage` = 'internal' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $locationIds = $warehouses->getCollection()->pluck('id');
        $valuationByLocation = StockQuant::query()
            ->join('product_batches', 'product_batches.id', '=', 'stock_quants.product_batch_id')
            ->whereIn('stock_quants.stock_location_id', $locationIds)
            ->where('stock_quants.quantity', '>', 0)
            ->groupBy('stock_quants.stock_location_id')
            ->selectRaw('stock_quants.stock_location_id, SUM(stock_quants.quantity * product_batches.buy_price) as total_valuation')
            ->pluck('total_valuation', 'stock_quants.stock_location_id');

        $warehouses->getCollection()->transform(function (StockLocation $location) use ($valuationByLocation): StockLocation {
            $location->setAttribute('total_valuation', (int) ($valuationByLocation[$location->id] ?? 0));

            return $location;
        });

        return Inertia::render('inventory/warehouse/list/index', [
            'warehouses' => $warehouses,
            'usageOptions' => $this->usageOptions(),
            'filters' => [
                'search' => $search,
                'usage' => $usage,
                'status' => $status,
            ],
            'statistics' => [
                'total_locations' => StockLocation::query()->count(),
                'internal_count' => StockLocation::query()->where('usage', StockLocationUsage::Internal->value)->where('is_active', true)->count(),
                'active_count' => StockLocation::query()->where('is_active', true)->count(),
                'total_on_hand' => (int) StockQuant::query()
                    ->join('stock_locations', 'stock_locations.id', '=', 'stock_quants.stock_location_id')
                    ->where('stock_locations.usage', StockLocationUsage::Internal->value)
                    ->where('stock_quants.quantity', '>', 0)
                    ->sum('stock_quants.quantity'),
            ],
        ]);
    }

    public function show(StockLocation $warehouse): Response
    {
        Gate::authorize('view', $warehouse);

        $quants = StockQuant::query()
            ->with([
                'product:id,code,name,product_type,unit_of_measure',
                'productBatch:id,batch_number,expiry_date,buy_price',
            ])
            ->where('stock_location_id', $warehouse->id)
            ->where('quantity', '>', 0)
            ->orderByDesc('quantity')
            ->get();

        $movements = StockMovement::query()
            ->with([
                'product:id,code,name,unit_of_measure',
                'productBatch:id,batch_number',
                'sourceLocation:id,code,name',
                'destinationLocation:id,code,name',
                'user:id,name',
            ])
            ->where(function (Builder $q) use ($warehouse): void {
                $q->where('source_location_id', $warehouse->id)
                    ->orWhere('destination_location_id', $warehouse->id);
            })
            ->latest('id')
            ->limit(50)
            ->get();

        $totalValuation = (int) $quants->sum(
            fn (StockQuant $quant): int => $quant->quantity * (int) ($quant->productBatch?->buy_price ?? 0),
        );

        return Inertia::render('inventory/warehouse/show/index', [
            'warehouse' => $warehouse,
            'quants' => $quants,
            'movements' => $movements,
            'usageOptions' => $this->usageOptions(),
            'statistics' => [
                'total_on_hand' => (int) $quants->sum('quantity'),
                'sku_count' => $quants->pluck('product_id')->unique()->count(),
                'batch_count' => $quants->pluck('product_batch_id')->unique()->count(),
                'total_valuation' => $totalValuation,
                'movements_count' => $movements->count(),
            ],
        ]);
    }

    public function store(StoreStockLocationRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['is_default_warehouse'] = (bool) ($validated['is_default_warehouse'] ?? false);
        $validated['is_active'] = (bool) ($validated['is_active'] ?? true);

        DB::transaction(function () use ($validated): void {
            if ($validated['is_default_warehouse']) {
                StockLocation::query()->where('is_default_warehouse', true)->update(['is_default_warehouse' => false]);
            }

            StockLocation::create($validated);
        });

        return redirect()
            ->route('inventory.warehouses.index')
            ->with('success', 'Gudang / lokasi stok berhasil ditambahkan.');
    }

    public function update(UpdateStockLocationRequest $request, StockLocation $warehouse): RedirectResponse
    {
        $validated = $request->validated();
        $validated['code'] = strtoupper(trim($validated['code']));

        DB::transaction(function () use ($validated, $warehouse): void {
            if (! empty($validated['is_default_warehouse'])) {
                StockLocation::query()
                    ->where('id', '!=', $warehouse->id)
                    ->where('is_default_warehouse', true)
                    ->update(['is_default_warehouse' => false]);
            }

            $warehouse->update($validated);
        });

        return back()->with('success', 'Data gudang / lokasi stok berhasil diperbarui.');
    }

    public function destroy(StockLocation $warehouse): RedirectResponse
    {
        Gate::authorize('delete', $warehouse);

        if ($warehouse->is_default_warehouse) {
            return back()->with('error', 'Gudang default tidak dapat dinonaktifkan. Tetapkan gudang default lain terlebih dahulu.');
        }

        if ($warehouse->quants()->where('quantity', '>', 0)->exists()) {
            return back()->with('error', 'Lokasi tidak dapat dinonaktifkan karena masih memiliki stok aktif.');
        }

        $warehouse->update(['is_active' => false]);

        return back()->with('success', 'Gudang / lokasi stok berhasil dinonaktifkan.');
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function usageOptions(): array
    {
        return array_map(
            fn (StockLocationUsage $usage): array => [
                'value' => $usage->value,
                'label' => $usage->label(),
            ],
            StockLocationUsage::cases(),
        );
    }
}
