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

        $tab = $request->string('tab')->toString() ?: 'batches';
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $moveSearch = $request->string('move_search')->trim()->toString();
        $moveType = $request->string('move_type')->toString();
        $moveLocationId = $request->string('move_location_id')->toString();

        $layerSearch = $request->string('layer_search')->trim()->toString();
        $layerDirection = $request->string('layer_direction')->toString();

        $quantSearch = $request->string('quant_search')->trim()->toString();
        $quantLocationId = $request->string('quant_location_id')->toString();

        $batches = ProductBatch::query()
            ->with(['product.category', 'stockQuants.location:id,code,name'])
            ->when($search !== '', function (Builder $q) use ($search): void {
                $q->where(function (Builder $sub) use ($search): void {
                    $sub->where('batch_number', 'like', "%{$search}%")
                        ->orWhereHas('product', fn (Builder $pq) => $pq->search($search));
                });
            })
            ->when($status === 'available', fn (Builder $q) => $q->fefoAvailable())
            ->when($status === 'expired', fn (Builder $q) => $q->whereDate('expiry_date', '<', Carbon::today()))
            ->when($status === 'empty', fn (Builder $q) => $q->where('current_quantity', '<=', 0))
            ->orderBy('expiry_date', 'asc')
            ->paginate(15)
            ->withQueryString();

        $movements = StockMovement::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'productBatch:id,batch_number',
                'sourceLocation:id,code,name,usage',
                'destinationLocation:id,code,name,usage',
                'user:id,name',
            ])
            ->when($moveSearch !== '', function (Builder $q) use ($moveSearch): void {
                $q->where(function (Builder $sub) use ($moveSearch): void {
                    $sub->where('reference_number', 'like', "%{$moveSearch}%")
                        ->orWhere('origin', 'like', "%{$moveSearch}%")
                        ->orWhere('reason', 'like', "%{$moveSearch}%")
                        ->orWhereHas('product', fn (Builder $pq) => $pq->search($moveSearch))
                        ->orWhereHas('productBatch', fn (Builder $bq) => $bq->where('batch_number', 'like', "%{$moveSearch}%"));
                });
            })
            ->when($moveType !== '' && $moveType !== 'all', fn (Builder $q) => $q->where('type', $moveType))
            ->when($moveLocationId !== '' && $moveLocationId !== 'all', function (Builder $q) use ($moveLocationId): void {
                $locId = (int) $moveLocationId;
                $q->where(function (Builder $sub) use ($locId): void {
                    $sub->where('source_location_id', $locId)
                        ->orWhere('destination_location_id', $locId);
                });
            })
            ->latest('id')
            ->paginate(15, ['*'], 'move_page')
            ->withQueryString();

        $valuationLayers = StockValuationLayer::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'productBatch:id,batch_number',
                'location:id,code,name',
                'stockMovement:id,reference_number,type',
                'user:id,name',
            ])
            ->when($layerSearch !== '', function (Builder $q) use ($layerSearch): void {
                $q->where(function (Builder $sub) use ($layerSearch): void {
                    $sub->where('reference', 'like', "%{$layerSearch}%")
                        ->orWhere('description', 'like', "%{$layerSearch}%")
                        ->orWhereHas('product', fn (Builder $pq) => $pq->search($layerSearch))
                        ->orWhereHas('productBatch', fn (Builder $bq) => $bq->where('batch_number', 'like', "%{$layerSearch}%"));
                });
            })
            ->when($layerDirection === 'in', fn (Builder $q) => $q->where('quantity', '>', 0))
            ->when($layerDirection === 'out', fn (Builder $q) => $q->where('quantity', '<', 0))
            ->when($layerDirection === 'remaining', fn (Builder $q) => $q->where('remaining_qty', '>', 0))
            ->latest('id')
            ->paginate(15, ['*'], 'layer_page')
            ->withQueryString();

        $quants = StockQuant::query()
            ->with([
                'location:id,code,name,usage',
                'product:id,name,code,unit_of_measure',
                'productBatch:id,batch_number,expiry_date,buy_price',
            ])
            ->where('quantity', '>', 0)
            ->when($quantSearch !== '', function (Builder $q) use ($quantSearch): void {
                $q->where(function (Builder $sub) use ($quantSearch): void {
                    $sub->whereHas('product', fn (Builder $pq) => $pq->search($quantSearch))
                        ->orWhereHas('productBatch', fn (Builder $bq) => $bq->where('batch_number', 'like', "%{$quantSearch}%"))
                        ->orWhereHas('location', fn (Builder $lq) => $lq->where('name', 'like', "%{$quantSearch}%")->orWhere('code', 'like', "%{$quantSearch}%"));
                });
            })
            ->when($quantLocationId !== '' && $quantLocationId !== 'all', fn (Builder $q) => $q->where('stock_location_id', (int) $quantLocationId))
            ->orderBy('stock_location_id')
            ->orderByDesc('quantity')
            ->paginate(15, ['*'], 'quant_page')
            ->withQueryString();

        $products = Product::query()
            ->with(['batches' => fn ($q) => $q->where('is_active', true)->orderBy('expiry_date')])
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'product_type', 'form', 'unit_of_measure', 'price']);

        $locations = $this->activeLocations();

        return Inertia::render('inventory/stock/index', [
            'activeTab' => $tab,
            'batches' => $batches,
            'movements' => $movements,
            'valuationLayers' => $valuationLayers,
            'quants' => $quants,
            'products' => $products,
            'locations' => $locations,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'move_search' => $moveSearch,
                'move_type' => $moveType,
                'move_location_id' => $moveLocationId,
                'layer_search' => $layerSearch,
                'layer_direction' => $layerDirection,
                'quant_search' => $quantSearch,
                'quant_location_id' => $quantLocationId,
            ],
            'statistics' => [
                'total_batches' => ProductBatch::query()->where('is_active', true)->count(),
                'active_stock' => (int) ProductBatch::query()->where('is_active', true)->sum('current_quantity'),
                'expiring_soon' => ProductBatch::query()
                    ->where('is_active', true)
                    ->where('current_quantity', '>', 0)
                    ->whereBetween('expiry_date', [Carbon::today(), Carbon::today()->addDays(30)])
                    ->count(),
                'expired' => ProductBatch::query()
                    ->where('is_active', true)
                    ->whereDate('expiry_date', '<', Carbon::today())
                    ->count(),
                'total_valuation' => (int) StockValuationLayer::query()->sum('value'),
                'today_moves' => StockMovement::query()->whereDate('created_at', Carbon::today())->count(),
            ],
        ]);
    }

    public function showBatch(ProductBatch $batch): Response
    {
        Gate::authorize('view', $batch);

        $this->stockService->ensureDefaultLocations();

        $batch->load([
            'product.category:id,name',
            'stockQuants' => fn ($q) => $q
                ->with('location:id,code,name,usage')
                ->where('quantity', '>', 0)
                ->orderByDesc('quantity'),
        ]);

        $movements = StockMovement::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'productBatch:id,batch_number',
                'sourceLocation:id,code,name,usage',
                'destinationLocation:id,code,name,usage',
                'user:id,name',
            ])
            ->where('product_batch_id', $batch->id)
            ->latest('id')
            ->limit(50)
            ->get();

        $valuationLayers = StockValuationLayer::query()
            ->with([
                'product:id,name,code,unit_of_measure',
                'productBatch:id,batch_number',
                'location:id,code,name',
                'stockMovement:id,reference_number,type',
                'user:id,name',
            ])
            ->where('product_batch_id', $batch->id)
            ->latest('id')
            ->limit(50)
            ->get();

        $products = Product::query()
            ->with(['batches' => fn ($q) => $q->where('is_active', true)->orderBy('expiry_date')])
            ->where('id', $batch->product_id)
            ->get(['id', 'code', 'name', 'product_type', 'form', 'unit_of_measure', 'price']);

        return Inertia::render('inventory/stock/show/index', [
            'batch' => $batch,
            'movements' => $movements,
            'valuationLayers' => $valuationLayers,
            'products' => $products,
            'locations' => $this->activeLocations(),
        ]);
    }

    public function storeBatch(StoreProductBatchRequest $request): RedirectResponse
    {
        Gate::authorize('create', ProductBatch::class);

        $batch = $this->stockService->createBatchWithInboundMove(
            $request->validated(),
            $request->user(),
        );

        return back()->with('success', "Batch {$batch->batch_number} berhasil ditambahkan dengan stok {$batch->initial_quantity}.");
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

        return back()->with('success', "Stok batch {$batch->batch_number} berhasil disesuaikan.");
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
