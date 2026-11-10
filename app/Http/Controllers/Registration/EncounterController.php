<?php

namespace App\Http\Controllers\Registration;

use App\Enums\EncounterType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CancelEncounterRequest;
use App\Http\Requests\StoreEncounterRequest;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Guarantor;
use App\Models\Patient;
use App\Models\Unit;
use App\Services\RegistrationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EncounterController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Encounter::class);

        $user = $request->user();
        $assignedUnitIds = $user?->unitIds() ?? [];

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();
        $unitId = $request->integer('unit_id');
        $date = $request->string('date')->toString();
        $selectedDate = $date !== '' ? Carbon::parse($date)->toDateString() : today()->toDateString();

        $encounters = Encounter::query()
            ->with([
                'patient:id,medical_record_number,nik,name,gender,birth_date',
                'unit:id,name,code',
                'doctor:id,name',
                'guarantor:id,name,type',
                'queue:id,encounter_id,queue_code,queue_number,status',
            ])
            ->whereDate('arrived_at', $selectedDate)
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('unit_id', $assignedUnitIds))
            ->when($unitId > 0, fn (Builder $query) => $query->where('unit_id', $unitId))
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->orderByDesc('arrived_at')
            ->paginate(15)
            ->withQueryString();

        $units = Unit::query()
            ->active()
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('id', $assignedUnitIds))
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('registration/visit/list/index', [
            'encounters' => $encounters,
            'units' => $units,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'unit_id' => $unitId > 0 ? $unitId : null,
                'date' => $selectedDate,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Encounter::class);

        $user = $request->user();
        $assignedUnitIds = $user?->unitIds() ?? [];

        $units = Unit::query()
            ->active()
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('id', $assignedUnitIds))
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'type']);

        $doctors = Doctor::query()
            ->active()
            ->with(['schedules.unit:id,name,code'])
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'specialization']);

        $guarantors = Guarantor::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'type']);

        $preselectedPatient = null;
        $patientId = $request->integer('patient_id');
        if ($patientId > 0) {
            $patient = Patient::query()->active()->whereNull('merged_to_patient_id')->find($patientId);
            if ($patient) {
                $preselectedPatient = [
                    'id' => $patient->id,
                    'medical_record_number' => $patient->medical_record_number,
                    'nik' => $patient->nik,
                    'name' => $patient->name,
                    'gender' => $patient->gender->value,
                    'birth_date' => $patient->birth_date->toDateString(),
                    'address' => $patient->address,
                    'phone' => $patient->phone,
                    'is_active' => $patient->is_active,
                    'merged_to_patient_id' => null,
                ];
            }
        }

        return Inertia::render('registration/visit/create/index', [
            'units' => $units,
            'doctors' => $doctors,
            'guarantors' => $guarantors,
            'preselectedPatient' => $preselectedPatient,
            'types' => [
                ['value' => EncounterType::Outpatient->value, 'label' => EncounterType::Outpatient->label()],
                ['value' => EncounterType::Emergency->value, 'label' => EncounterType::Emergency->label()],
            ],
        ]);
    }

    public function store(StoreEncounterRequest $request, RegistrationService $service): RedirectResponse
    {
        $encounter = $service->createEncounter($request->validated(), $request->user());

        return redirect()
            ->route('registration.visits.show', $encounter)
            ->with('success', "Pendaftaran berhasil. Nomor Antrean: {$encounter->queue?->queue_code}.");
    }

    public function show(Encounter $encounter): Response
    {
        Gate::authorize('view', $encounter);

        $encounter->load([
            'patient',
            'unit',
            'doctor',
            'guarantor',
            'queue.calledBy',
            'insuranceCoverage',
            'cancelledBy',
            'createdBy',
            'invoices',
        ]);

        return Inertia::render('registration/visit/show/index', [
            'encounter' => $encounter,
        ]);
    }

    public function cancel(CancelEncounterRequest $request, Encounter $encounter, RegistrationService $service): RedirectResponse
    {
        $service->cancelEncounter(
            $encounter,
            (string) $request->validated('cancellation_reason'),
            $request->user()
        );

        return redirect()
            ->back()
            ->with('success', 'Kunjungan berhasil dibatalkan.');
    }
}
