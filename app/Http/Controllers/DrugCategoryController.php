<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDrugCategoryRequest;
use App\Http\Requests\UpdateDrugCategoryRequest;
use App\Models\DrugCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class DrugCategoryController extends Controller
{
    public function store(StoreDrugCategoryRequest $request): RedirectResponse
    {
        DrugCategory::create($request->validated());

        return back()->with('success', 'Kategori obat berhasil ditambahkan.');
    }

    public function update(UpdateDrugCategoryRequest $request, DrugCategory $drugCategory): RedirectResponse
    {
        $drugCategory->update($request->validated());

        return back()->with('success', 'Kategori obat berhasil diperbarui.');
    }

    public function destroy(DrugCategory $drugCategory): RedirectResponse
    {
        Gate::authorize('delete', $drugCategory);

        if ($drugCategory->drugs()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki obat terkait.');
        }

        $drugCategory->delete();

        return back()->with('success', 'Kategori obat berhasil dihapus.');
    }
}
