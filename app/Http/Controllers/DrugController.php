<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDrugRequest;
use App\Http\Requests\UpdateDrugRequest;
use App\Models\Drug;
use App\Models\DrugCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DrugController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Drug::class);

        $search = $request->string('search')->trim()->toString();
        $categoryId = $request->string('category_id')->toString();
        $status = $request->string('status')->toString();

        $drugs = Drug::query()
            ->with(['category:id,name'])
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->when($categoryId !== '', fn (Builder $query) => $query->where('drug_category_id', (int) $categoryId))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = DrugCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/drug/list/index', [
            'drugs' => $drugs,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
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

        return Inertia::render('master-data/drug/create/index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreDrugRequest $request): RedirectResponse
    {
        Drug::create($request->validated());

        return redirect()
            ->route('master-data.drugs.index')
            ->with('success', 'Obat berhasil ditambahkan.');
    }

    public function show(Drug $drug): Response
    {
        Gate::authorize('view', $drug);

        $drug->load([
            'category:id,name,description',
            'batches' => fn ($query) => $query->orderBy('expiry_date'),
            'stockMovements' => fn ($query) => $query->with(['drugBatch', 'user'])->latest('id')->limit(50),
        ]);

        $totalStock = (int) $drug->batches->sum('current_quantity');
        $activeBatchesCount = $drug->batches->where('current_quantity', '>', 0)->count();

        return Inertia::render('master-data/drug/show/index', [
            'drug' => $drug,
            'statistics' => [
                'total_stock' => $totalStock,
                'active_batches' => $activeBatchesCount,
                'total_batches' => $drug->batches->count(),
            ],
        ]);
    }

    public function edit(Drug $drug): Response
    {
        Gate::authorize('update', $drug);

        $categories = DrugCategory::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return Inertia::render('master-data/drug/edit/index', [
            'drug' => $drug->loadMissing('category:id,name'),
            'categories' => $categories,
        ]);
    }

    public function update(UpdateDrugRequest $request, Drug $drug): RedirectResponse
    {
        $drug->update($request->validated());

        return redirect()
            ->route('master-data.drugs.index')
            ->with('success', 'Obat berhasil diperbarui.');
    }

    public function destroy(Drug $drug): RedirectResponse
    {
        Gate::authorize('delete', $drug);

        $drug->delete();

        return redirect()
            ->route('master-data.drugs.index')
            ->with('success', 'Obat berhasil dihapus.');
    }
}
