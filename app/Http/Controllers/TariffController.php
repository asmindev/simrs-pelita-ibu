<?php

namespace App\Http\Controllers;

use App\Enums\TariffCategory;
use App\Http\Requests\StoreTariffRequest;
use App\Http\Requests\UpdateTariffRequest;
use App\Models\Tariff;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TariffController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Tariff::class);

        $search = $request->string('search')->trim()->toString();
        $category = $request->string('category')->toString();
        $unitId = $request->string('unit_id')->toString();
        $status = $request->string('status')->toString();
        $categoryFilter = TariffCategory::tryFrom($category);

        $tariffs = Tariff::query()
            ->with(['unit:id,code,name'])
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->when($categoryFilter !== null, fn (Builder $query) => $query->where('category', $categoryFilter->value))
            ->when($unitId !== '', fn (Builder $query) => $query->where('unit_id', (int) $unitId))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $units = Unit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return Inertia::render('master-data/tariff/list/index', [
            'tariffs' => $tariffs,
            'units' => $units,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'unit_id' => $unitId,
                'status' => $status,
            ],
            'categories' => array_map(fn (TariffCategory $item) => [
                'value' => $item->value,
                'label' => $item->label(),
            ], TariffCategory::cases()),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Tariff::class);

        $units = Unit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return Inertia::render('master-data/tariff/create/index', [
            'units' => $units,
            'categories' => array_map(fn (TariffCategory $item) => [
                'value' => $item->value,
                'label' => $item->label(),
            ], TariffCategory::cases()),
        ]);
    }

    public function store(StoreTariffRequest $request): RedirectResponse
    {
        Tariff::create($request->validated());

        return redirect()
            ->route('master-data.tariffs.index')
            ->with('success', 'Tarif berhasil ditambahkan.');
    }

    public function edit(Tariff $tariff): Response
    {
        Gate::authorize('update', $tariff);

        $units = Unit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return Inertia::render('master-data/tariff/edit/index', [
            'tariff' => $tariff->loadMissing('unit:id,code,name'),
            'units' => $units,
            'categories' => array_map(fn (TariffCategory $item) => [
                'value' => $item->value,
                'label' => $item->label(),
            ], TariffCategory::cases()),
        ]);
    }

    public function update(UpdateTariffRequest $request, Tariff $tariff): RedirectResponse
    {
        $tariff->update($request->validated());

        return redirect()
            ->route('master-data.tariffs.index')
            ->with('success', 'Tarif berhasil diperbarui.');
    }

    public function destroy(Tariff $tariff): RedirectResponse
    {
        Gate::authorize('delete', $tariff);

        $tariff->delete();

        return redirect()
            ->route('master-data.tariffs.index')
            ->with('success', 'Tarif berhasil dihapus.');
    }
}
