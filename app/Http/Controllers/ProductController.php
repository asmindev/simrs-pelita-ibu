<?php

namespace App\Http\Controllers;

use App\Enums\ProductType;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Product::class);

        $search = $request->string('search')->trim()->toString();
        $productType = $request->string('product_type')->toString();
        $categoryId = $request->string('category_id')->toString();
        $status = $request->string('status')->toString();

        $products = Product::query()
            ->with(['category:id,name'])
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->when($productType !== '' && $productType !== 'all', fn (Builder $query) => $query->ofType($productType))
            ->when($categoryId !== '', fn (Builder $query) => $query->where('product_category_id', (int) $categoryId))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = ProductCategory::query()
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
        Gate::authorize('create', Product::class);

        $categories = ProductCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/product/create/index', [
            'categories' => $categories,
            'productTypes' => $this->productTypeOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        Product::create($data);

        return redirect()
            ->route('master-data.products.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    public function show(Product $product): Response
    {
        Gate::authorize('view', $product);

        $product->load([
            'category:id,name,description',
            'batches' => fn ($query) => $query->with('stockQuants.location:id,code,name')->orderBy('expiry_date'),
            'stockQuants' => fn ($query) => $query
                ->with(['location:id,code,name,usage', 'productBatch:id,batch_number,expiry_date,buy_price'])
                ->where('quantity', '>', 0)
                ->orderBy('stock_location_id')
                ->orderByDesc('quantity'),
            'stockMovements' => fn ($query) => $query->with([
                'productBatch:id,batch_number',
                'sourceLocation:id,code,name',
                'destinationLocation:id,code,name',
                'user:id,name',
            ])->latest('id')->limit(50),
            'valuationLayers' => fn ($query) => $query->with([
                'productBatch:id,batch_number',
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

        $categories = ProductCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/product/show/index', [
            'product' => $product,
            'categories' => $categories,
            'productTypes' => $this->productTypeOptions(),
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

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        $categories = ProductCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/product/edit/index', [
            'product' => $product->loadMissing('category:id,name'),
            'categories' => $categories,
            'productTypes' => $this->productTypeOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'remove_image', 'inline']);

        if ($request->boolean('remove_image')) {
            $this->deleteStoredImage($product);
            $data['image_path'] = null;
        }

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($product);
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        if ($request->boolean('inline')) {
            return redirect()
                ->route('master-data.products.show', $product)
                ->with('success', 'Produk berhasil diperbarui.');
        }

        return redirect()
            ->route('master-data.products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        Gate::authorize('delete', $product);

        $this->deleteStoredImage($product);
        $product->delete();

        return redirect()
            ->route('master-data.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }

    private function deleteStoredImage(Product $product): void
    {
        if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
            Storage::disk('public')->delete($product->image_path);
        }
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
