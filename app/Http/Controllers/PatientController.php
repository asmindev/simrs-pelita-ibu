<?php

namespace App\Http\Controllers;

use App\Http\Requests\MergePatientRequest;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use App\Models\PatientAccessLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $patient->load(['mergedTo:id,name,medical_record_number', 'mergedFrom:id,name,medical_record_number,merged_at']);

        return Inertia::render('master-data/patient/edit/index', [
            'patient' => $patient,
        ]);
    }

    public function merge(MergePatientRequest $request, Patient $patient): RedirectResponse
    {
        $validated = $request->validated();
        $targetPatient = Patient::query()->findOrFail($validated['target_patient_id']);
        $reason = (string) $validated['reason'];

        DB::transaction(function () use ($request, $patient, $targetPatient, $reason): void {
            $patient->update([
                'is_active' => false,
                'merged_to_patient_id' => $targetPatient->id,
                'merged_at' => now(),
            ]);

            activity('master-data')
                ->causedBy($request->user())
                ->performedOn($patient)
                ->event('patient_merged')
                ->withProperties([
                    'source_patient_id' => $patient->id,
                    'source_medical_record_number' => $patient->medical_record_number,
                    'target_patient_id' => $targetPatient->id,
                    'target_medical_record_number' => $targetPatient->medical_record_number,
                    'reason' => $reason,
                ])
                ->log("Penggabungan berkas RM {$patient->medical_record_number} ke {$targetPatient->medical_record_number}");

            PatientAccessLog::create([
                'user_id' => $request->user()?->id,
                'patient_id' => $patient->id,
                'unit_id' => null,
                'action' => 'merge',
                'context' => [
                    'target_patient_id' => $targetPatient->id,
                    'target_medical_record_number' => $targetPatient->medical_record_number,
                    'reason' => $reason,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'accessed_at' => now(),
            ]);

            PatientAccessLog::create([
                'user_id' => $request->user()?->id,
                'patient_id' => $targetPatient->id,
                'unit_id' => null,
                'action' => 'merge_received',
                'context' => [
                    'source_patient_id' => $patient->id,
                    'source_medical_record_number' => $patient->medical_record_number,
                    'reason' => $reason,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'accessed_at' => now(),
            ]);
        });

        return redirect()
            ->route('master-data.patients.edit', $targetPatient)
            ->with('success', "Berkas rekam medis {$patient->medical_record_number} berhasil digabungkan ke {$targetPatient->medical_record_number}.");
    }

    public function search(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Patient::class);

        $term = $request->string('q')->trim()->toString();
        $excludeId = $request->integer('exclude');

        if ($term === '') {
            return response()->json(['data' => []]);
        }

        $query = Patient::query()
            ->when($excludeId > 0, fn (Builder $q) => $q->whereKeyNot($excludeId))
            ->search($term);

        $patients = $query
            ->orderBy('name')
            ->limit(15)
            ->get()
            ->map(fn (Patient $patient): array => [
                'id' => $patient->id,
                'medical_record_number' => $patient->medical_record_number,
                'nik' => $patient->nik,
                'name' => $patient->name,
                'gender' => $patient->gender->value,
                'birth_date' => $patient->birth_date->toDateString(),
                'address' => $patient->address,
                'phone' => $patient->phone,
                'is_active' => $patient->is_active,
                'merged_to_patient_id' => $patient->merged_to_patient_id,
            ]);

        return response()->json(['data' => $patients]);
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
