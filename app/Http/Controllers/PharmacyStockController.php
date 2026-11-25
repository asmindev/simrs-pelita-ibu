<?php

namespace App\Http\Controllers;

use App\Enums\StockLocationUsage;
use App\Http\Requests\AdjustStockRequest;
use App\Http\Requests\StoreProductBatchRequest;
use App\Http\Requests\StoreStockMoveRequest;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockLocation;
use App\Models\StockMovement;
use App\Models\StockQuant;
use App\Models\StockValuationLayer;
use App\Services\PharmacyStockService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PharmacyStockController extends Controller
{
    public function __construct(
        protected PharmacyStockService $stockService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', ProductBatch::class);

        $this->stockService->ensureDefaultLocations();

        $search = $request->string('search')->trim()->toString();
        $locationId = $request->string('location_id')->toString();
        $expiry = $request->string('expiry')->toString();
        $today = Carbon::today()->toDateString();
        $soon = Carbon::today()->addDays(30)->toDateString();

        $itemsQuery = DB::table('stock_quants')
            ->join('stock_locations', 'stock_locations.id', '=', 'stock_quants.stock_location_id')
            ->join('products', 'products.id', '=', 'stock_quants.product_id')
            ->join('product_batches', 'product_batches.id', '=', 'stock_quants.product_batch_id')
            ->where('stock_locations.usage', StockLocationUsage::Internal->value)
            ->where('stock_locations.is_active', true)
            ->where('stock_quants.quantity', '>', 0)
            ->where('product_batches.is_active', true)
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('products.name', 'like', "%{$search}%")
                        ->orWhere('products.code', 'like', "%{$search}%")
                        ->orWhere('stock_locations.name', 'like', "%{$search}%")
                        ->orWhere('stock_locations.code', 'like', "%{$search}%");
                });
            })
            ->when($locationId !== '' && $locationId !== 'all', fn ($q) => $q->where('stock_quants.stock_location_id', (int) $locationId))
            ->groupBy([
                'stock_quants.stock_location_id',
                'stock_locations.code',
                'stock_locations.name',
                'stock_quants.product_id',
                'products.code',
                'products.name',
                'products.form',
                'products.unit_of_measure',
            ])
            ->selectRaw('
                stock_quants.stock_location_id,
                stock_locations.code as location_code,
                stock_locations.name as location_name,
                stock_quants.product_id,
                products.code as product_code,
                products.name as product_name,
                products.form as product_form,
                products.unit_of_measure,
                CAST(SUM(stock_quants.quantity) AS SIGNED) as total_quantity,
                CAST(SUM(stock_quants.quantity * product_batches.buy_price) AS SIGNED) as total_value,
                CAST(ROUND(SUM(stock_quants.quantity * product_batches.buy_price) / NULLIF(SUM(stock_quants.quantity), 0)) AS SIGNED) as avg_buy_price,
                MIN(product_batches.expiry_date) as nearest_expiry
            ')
            ->when($expiry === 'expired', fn ($q) => $q->havingRaw('MIN(product_batches.expiry_date) < ?', [$today]))
            ->when($expiry === 'expiring_soon', fn ($q) => $q->havingRaw('MIN(product_batches.expiry_date) BETWEEN ? AND ?', [$today, $soon]))
            ->orderBy('stock_locations.name')
            ->orderBy('products.name');

        $items = $itemsQuery->paginate(15)->withQueryString();

        $totalItemsCount = DB::table('stock_quants')
            ->join('stock_locations', 'stock_locations.id', '=', 'stock_quants.stock_location_id')
            ->join('product_batches', 'product_batches.id', '=', 'stock_quants.product_batch_id')
            ->where('stock_locations.usage', StockLocationUsage::Internal->value)
            ->where('stock_locations.is_active', true)
            ->where('stock_quants.quantity', '>', 0)
            ->where('product_batches.is_active', true)
            ->selectRaw('COUNT(DISTINCT CONCAT(stock_quants.stock_location_id, "-", stock_quants.product_id)) as total_items')
            ->value('total_items');

        return Inertia::render('inventory/stock/index', [
            'items' => $items,
            'products' => $this->activeProducts(),
            'locations' => $this->activeLocations(),
            'filters' => [
                'search' => $search,
                'location_id' => $locationId,
                'expiry' => $expiry,
            ],
            'statistics' => [
                'total_items' => (int) ($totalItemsCount ?? 0),
                'active_stock' => (int) StockQuant::query()
                    ->join('stock_locations', 'stock_locations.id', '=', 'stock_quants.stock_location_id')
                    ->where('stock_locations.usage', StockLocationUsage::Internal->value)
                    ->where('stock_locations.is_active', true)
                    ->where('stock_quants.quantity', '>', 0)
                    ->sum('stock_quants.quantity'),
                'expiring_soon' => ProductBatch::query()
                    ->where('is_active', true)
                    ->where('current_quantity', '>', 0)
                    ->whereBetween('expiry_date', [Carbon::today(), Carbon::today()->addDays(30)])
                    ->count(),
                'expired' => ProductBatch::query()
                    ->where('is_active', true)
                    ->where('current_quantity', '>', 0)
                    ->whereDate('expiry_date', '<', Carbon::today())
                    ->count(),
                'total_valuation' => (int) StockValuationLayer::query()->sum('value'),
                'today_moves' => StockMovement::query()->whereDate('created_at', Carbon::today())->count(),
            ],
        ]);
    }

    public function show(StockLocation $warehouse, Product $product): Response
    {
        Gate::authorize('viewAny', ProductBatch::class);

        $this->stockService->ensureDefaultLocations();

        $product->load('category:id,name');

        $quants = StockQuant::query()
            ->select('stock_quants.*')
            ->join('product_batches', 'product_batches.id', '=', 'stock_quants.product_batch_id')
            ->with([
                'location:id,code,name,usage',
                'product:id,code,name,form,unit_of_measure',
                'productBatch:id,product_id,batch_number,expiry_date,initial_quantity,current_quantity,buy_price,is_active,created_at',
            ])
            ->where('stock_quants.stock_location_id', $warehouse->id)
            ->where('stock_quants.product_id', $product->id)
            ->where('stock_quants.quantity', '>', 0)
            ->orderBy('product_batches.expiry_date')
            ->get();

        $quants->each(function (StockQuant $quant): void {
            if ($quant->productBatch && $quant->product) {
                $quant->productBatch->setRelation('product', $quant->product);
            }
            if ($quant->productBatch && $quant->location) {
                $quant->productBatch->setRelation('stockQuants', new Collection([$quant]));
            }
        });

        $totalQuantity = (int) $quants->sum('quantity');
        $totalValue = (int) $quants->sum(
            fn (StockQuant $q): int => $q->quantity * (int) ($q->productBatch?->buy_price ?? 0),
        );
        $avgBuyPrice = $totalQuantity > 0 ? (int) round($totalValue / $totalQuantity) : 0;
        $nearestExpiry = $quants->first()?->productBatch?->expiry_date?->toDateString();

        $movements = StockMovement::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'sourceLocation:id,code,name,usage',
                'destinationLocation:id,code,name,usage',
                'user:id,name',
            ])
            ->where('product_id', $product->id)
            ->where(function (Builder $q) use ($warehouse): void {
                $q->where('source_location_id', $warehouse->id)
                    ->orWhere('destination_location_id', $warehouse->id);
            })
            ->latest('id')
            ->limit(50)
            ->get();

        $valuationLayers = StockValuationLayer::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'location:id,code,name',
                'stockMovement:id,reference_number,type',
                'user:id,name',
            ])
            ->where('product_id', $product->id)
            ->where('stock_location_id', $warehouse->id)
            ->latest('id')
            ->limit(50)
            ->get();

        $products = Product::query()
            ->with([
                'batches' => fn ($q) => $q
                    ->with('stockQuants:id,product_batch_id,stock_location_id,quantity')
                    ->where('is_active', true)
                    ->orderBy('expiry_date'),
            ])
            ->where('id', $product->id)
            ->get(['id', 'code', 'name', 'product_type', 'form', 'unit_of_measure', 'price']);

        return Inertia::render('inventory/stock/show/index', [
            'warehouse' => $warehouse->only(['id', 'code', 'name', 'usage', 'is_default_warehouse']),
            'product' => $product->only(['id', 'code', 'name', 'product_type', 'form', 'unit_of_measure', 'price', 'category']),
            'quants' => $quants,
            'movements' => $movements,
            'valuationLayers' => $valuationLayers,
            'summary' => [
                'total_quantity' => $totalQuantity,
                'total_value' => $totalValue,
                'avg_buy_price' => $avgBuyPrice,
                'nearest_expiry' => $nearestExpiry,
            ],
            'products' => $products,
            'locations' => $this->activeLocations(),
        ]);
    }

    public function moves(Request $request): Response
    {
        Gate::authorize('viewAny', ProductBatch::class);

        $this->stockService->ensureDefaultLocations();

        $search = $request->string('search')->trim()->toString();
        $type = $request->string('type')->toString();
        $locationId = $request->string('location_id')->toString();

        $movements = StockMovement::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'sourceLocation:id,code,name,usage',
                'destinationLocation:id,code,name,usage',
                'user:id,name',
            ])
            ->when($search !== '', function (Builder $q) use ($search): void {
                $q->where(function (Builder $sub) use ($search): void {
                    $sub->where('reference_number', 'like', "%{$search}%")
                        ->orWhere('origin', 'like', "%{$search}%")
                        ->orWhere('reason', 'like', "%{$search}%")
                        ->orWhereHas('product', fn (Builder $pq) => $pq->search($search));
                });
            })
            ->when($type !== '' && $type !== 'all', fn (Builder $q) => $q->where('type', $type))
            ->when($locationId !== '' && $locationId !== 'all', function (Builder $q) use ($locationId): void {
                $locId = (int) $locationId;
                $q->where(function (Builder $sub) use ($locId): void {
                    $sub->where('source_location_id', $locId)
                        ->orWhere('destination_location_id', $locId);
                });
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('inventory/move/index', [
            'movements' => $movements,
            'products' => $this->activeProducts(),
            'locations' => $this->activeLocations(),
            'filters' => [
                'search' => $search,
                'type' => $type,
                'location_id' => $locationId,
            ],
            'statistics' => [
                'total_moves' => StockMovement::query()->count(),
                'today_moves' => StockMovement::query()->whereDate('created_at', Carbon::today())->count(),
                'inbound_count' => StockMovement::query()->where('type', 'in')->count(),
                'transfer_count' => StockMovement::query()->where('type', 'transfer')->count(),
            ],
        ]);
    }

    public function valuation(Request $request): Response
    {
        Gate::authorize('viewAny', ProductBatch::class);

        $search = $request->string('search')->trim()->toString();
        $direction = $request->string('direction')->toString();

        $valuationLayers = StockValuationLayer::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'location:id,code,name',
                'stockMovement:id,reference_number,type',
                'user:id,name',
            ])
            ->when($search !== '', function (Builder $q) use ($search): void {
                $q->where(function (Builder $sub) use ($search): void {
                    $sub->where('reference', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('product', fn (Builder $pq) => $pq->search($search));
                });
            })
            ->when($direction === 'in', fn (Builder $q) => $q->where('quantity', '>', 0))
            ->when($direction === 'out', fn (Builder $q) => $q->where('quantity', '<', 0))
            ->when($direction === 'remaining', fn (Builder $q) => $q->where('remaining_qty', '>', 0))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('inventory/valuation/index', [
            'valuationLayers' => $valuationLayers,
            'filters' => [
                'search' => $search,
                'direction' => $direction,
            ],
            'statistics' => [
                'total_layers' => StockValuationLayer::query()->count(),
                'total_valuation' => (int) StockValuationLayer::query()->sum('value'),
                'remaining_qty' => (int) StockValuationLayer::query()->sum('remaining_qty'),
                'remaining_value' => (int) StockValuationLayer::query()->sum('remaining_value'),
            ],
        ]);
    }

    public function storeBatch(StoreProductBatchRequest $request): RedirectResponse
    {
        Gate::authorize('create', ProductBatch::class);

        $batch = $this->stockService->createBatchWithInboundMove(
            $request->validated(),
            $request->user(),
        );

        return back()->with('success', "Stok produk berhasil ditambahkan sejumlah {$batch->initial_quantity}.");
    }

    public function adjust(AdjustStockRequest $request, ProductBatch $batch): RedirectResponse
    {
        Gate::authorize('adjust', $batch);

        $locationId = $request->validated('stock_location_id');
        $location = $locationId ? StockLocation::query()->find((int) $locationId) : null;

        $this->stockService->adjustStock(
            $batch,
            (int) $request->validated('new_quantity'),
            $request->validated('reason'),
            $request->user(),
            $location,
        );

        return back()->with('success', 'Penyesuaian stok fisik berhasil disimpan.');
    }

    public function storeMove(StoreStockMoveRequest $request): RedirectResponse
    {
        Gate::authorize('create', ProductBatch::class);

        $movements = $this->stockService->recordStockMove(
            $request->validated(),
            $request->user(),
        );

        $count = $movements->count();
        $firstRef = $movements->first()?->reference_number ?? 'Stock Move';

        return back()->with('success', "Pergerakan stok {$firstRef} berhasil dicatat ({$count} baris mutasi).");
    }

    /**
     * @return Collection<int, Product>
     */
    private function activeProducts(): Collection
    {
        return Product::query()
            ->with([
                'batches' => fn ($q) => $q
                    ->with('stockQuants:id,product_batch_id,stock_location_id,quantity')
                    ->where('is_active', true)
                    ->orderBy('expiry_date'),
            ])
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'product_type', 'form', 'unit_of_measure', 'price']);
    }

    /**
     * @return Collection<int, StockLocation>
     */
    private function activeLocations(): Collection
    {
        return StockLocation::query()
            ->active()
            ->orderByDesc('is_default_warehouse')
            ->orderBy('id')
            ->get(['id', 'code', 'name', 'usage', 'is_default_warehouse'])
            ->sortBy(fn (StockLocation $loc): int => $loc->usage === StockLocationUsage::Internal ? 0 : 1)
            ->values();
    }
}
