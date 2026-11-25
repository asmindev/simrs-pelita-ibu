<?php

namespace App\Http\Controllers;

use App\Enums\ProductType;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Drug;
use App\Models\DrugCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Drug::class);

        $search = $request->string('search')->trim()->toString();
        $productType = $request->string('product_type')->toString();
        $categoryId = $request->string('category_id')->toString();
        $status = $request->string('status')->toString();

        $products = Drug::query()
            ->with(['category:id,name'])
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->when($productType !== '' && $productType !== 'all', fn (Builder $query) => $query->ofType($productType))
            ->when($categoryId !== '', fn (Builder $query) => $query->where('drug_category_id', (int) $categoryId))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = DrugCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/product/list/index', [
            'products' => $products,
            'categories' => $categories,
            'productTypes' => $this->productTypeOptions(),
            'filters' => [
                'search' => $search,
                'product_type' => $productType,
                'category_id' => $categoryId,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Drug::class);

        $categories = DrugCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/product/create/index', [
            'categories' => $categories,
            'productTypes' => $this->productTypeOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Drug::create($request->validated());

        return redirect()
            ->route('master-data.products.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    public function show(Drug $product): Response
    {
        Gate::authorize('view', $product);

        $product->load([
            'category:id,name,description',
            'batches' => fn ($query) => $query->with('stockQuants.location:id,code,name')->orderBy('expiry_date'),
            'stockQuants' => fn ($query) => $query
                ->with(['location:id,code,name,usage', 'drugBatch:id,batch_number,expiry_date,buy_price'])
                ->where('quantity', '>', 0)
                ->orderBy('stock_location_id')
                ->orderByDesc('quantity'),
            'stockMovements' => fn ($query) => $query->with([
                'drugBatch:id,batch_number',
                'sourceLocation:id,code,name',
                'destinationLocation:id,code,name',
                'user:id,name',
            ])->latest('id')->limit(50),
            'valuationLayers' => fn ($query) => $query->with([
                'drugBatch:id,batch_number',
                'location:id,code,name',
                'stockMovement:id,reference_number,type',
                'user:id,name',
            ])->latest('id')->limit(50),
        ]);

        $totalStock = (int) $product->batches->sum('current_quantity');
        $activeBatchesCount = $product->batches->where('current_quantity', '>', 0)->count();
        $totalValuation = (int) $product->valuationLayers()->sum('value');
        $averageCost = $totalStock > 0
            ? (int) round($totalValuation / $totalStock)
            : (int) ($product->batches->first()?->buy_price ?? 0);

        return Inertia::render('master-data/product/show/index', [
            'product' => $product,
            'statistics' => [
                'total_stock' => $totalStock,
                'active_batches' => $activeBatchesCount,
                'total_batches' => $product->batches->count(),
                'locations_count' => $product->stockQuants->pluck('stock_location_id')->unique()->count(),
                'movements_count' => (int) $product->stockMovements()->count(),
                'total_valuation' => $totalValuation,
                'average_cost' => $averageCost,
            ],
        ]);
    }

    public function edit(Drug $product): Response
    {
        Gate::authorize('update', $product);

        $categories = DrugCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/product/edit/index', [
            'product' => $product->loadMissing('category:id,name'),
            'categories' => $categories,
            'productTypes' => $this->productTypeOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, Drug $product): RedirectResponse
    {
        $product->update($request->validated());

        return redirect()
            ->route('master-data.products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Drug $product): RedirectResponse
    {
        Gate::authorize('delete', $product);

        $product->delete();

        return redirect()
            ->route('master-data.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function productTypeOptions(): array
    {
        return array_map(
            fn (ProductType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ],
            ProductType::cases(),
        );
    }
}
