<?php

namespace App\Http\Controllers;

use App\Enums\GuarantorType;
use App\Http\Requests\StoreGuarantorRequest;
use App\Http\Requests\UpdateGuarantorRequest;
use App\Models\Guarantor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GuarantorController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Guarantor::class);

        $search = $request->string('search')->trim()->toString();
        $type = $request->string('type')->toString();
        $status = $request->string('status')->toString();
        $typeFilter = GuarantorType::tryFrom($type);

        $guarantors = Guarantor::query()
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->when($typeFilter !== null, fn (Builder $query) => $query->where('type', $typeFilter->value))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('master-data/guarantor/list/index', [
            'guarantors' => $guarantors,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'status' => $status,
            ],
            'types' => array_map(fn (GuarantorType $item) => [
                'value' => $item->value,
                'label' => $item->label(),
            ], GuarantorType::cases()),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Guarantor::class);

        return Inertia::render('master-data/guarantor/create/index', [
            'types' => array_map(fn (GuarantorType $item) => [
                'value' => $item->value,
                'label' => $item->label(),
            ], GuarantorType::cases()),
        ]);
    }

    public function store(StoreGuarantorRequest $request): RedirectResponse
    {
        Guarantor::create($request->validated());

        return redirect()
            ->route('master-data.guarantors.index')
            ->with('success', 'Penjamin berhasil ditambahkan.');
    }

    public function edit(Guarantor $guarantor): Response
    {
        Gate::authorize('update', $guarantor);

        return Inertia::render('master-data/guarantor/edit/index', [
            'guarantor' => $guarantor,
            'types' => array_map(fn (GuarantorType $item) => [
                'value' => $item->value,
                'label' => $item->label(),
            ], GuarantorType::cases()),
        ]);
    }

    public function update(UpdateGuarantorRequest $request, Guarantor $guarantor): RedirectResponse
    {
        $guarantor->update($request->validated());

        return redirect()
            ->route('master-data.guarantors.index')
            ->with('success', 'Penjamin berhasil diperbarui.');
    }

    public function destroy(Guarantor $guarantor): RedirectResponse
    {
        Gate::authorize('delete', $guarantor);

        $guarantor->delete();

        return redirect()
            ->route('master-data.guarantors.index')
            ->with('success', 'Penjamin berhasil dihapus.');
    }
}
