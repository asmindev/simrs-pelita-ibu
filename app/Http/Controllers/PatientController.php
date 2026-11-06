<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Patient::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $patients = Patient::query()
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('master-data/patient/list/index', [
            'patients' => $patients,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Patient::class);

        return Inertia::render('master-data/patient/create/index');
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        Patient::create($request->validated());

        return redirect()
            ->route('master-data.patients.index')
            ->with('success', 'Pasien berhasil ditambahkan.');
    }

    public function edit(Patient $patient): Response
    {
        Gate::authorize('update', $patient);

        return Inertia::render('master-data/patient/edit/index', [
            'patient' => $patient,
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $patient->update($request->validated());

        return redirect()
            ->route('master-data.patients.index')
            ->with('success', 'Pasien berhasil diperbarui.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        Gate::authorize('delete', $patient);

        $patient->update(['is_active' => false]);

        return redirect()
            ->route('master-data.patients.index')
            ->with('success', 'Pasien dinonaktifkan.');
    }

    public function duplicates(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Patient::class);

        $validated = $request->validate([
            'nik' => ['nullable', 'string', 'digits:16'],
            'name' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'exclude' => ['nullable', 'integer'],
        ]);

        $nik = $validated['nik'] ?? null;
        $name = $validated['name'] ?? null;
        $birthDate = $validated['birth_date'] ?? null;

        if ($nik === null && ($name === null || $birthDate === null)) {
            return response()->json(['data' => []]);
        }

        $patients = Patient::query()
            ->when(
                isset($validated['exclude']),
                fn (Builder $query) => $query->whereKeyNot($validated['exclude']),
            )
            ->where(function (Builder $query) use ($nik, $name, $birthDate): void {
                if ($nik !== null) {
                    $query->where('nik', $nik);
                }

                if ($name !== null && $birthDate !== null) {
                    $method = $nik !== null ? 'orWhere' : 'where';

                    $query->{$method}(function (Builder $query) use ($name, $birthDate): void {
                        $query->where('name', 'like', "%{$name}%")
                            ->whereDate('birth_date', $birthDate);
                    });
                }
            })
            ->orderBy('name')
            ->limit(10)
            ->get()
            ->map(fn (Patient $patient): array => [
                'id' => $patient->id,
                'medical_record_number' => $patient->medical_record_number,
                'nik' => $patient->nik,
                'name' => $patient->name,
                'gender' => $patient->gender->value,
                'birth_date' => $patient->birth_date->toDateString(),
                'is_active' => $patient->is_active,
            ]);

        return response()->json(['data' => $patients]);
    }
}
