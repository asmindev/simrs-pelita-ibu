<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Enums\EncounterStatus;
use App\Enums\Permissions\MedicalRecordPermission;
use App\Http\Controllers\Controller;
use App\Models\BreakGlassGrant;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\PatientAccessLog;
use App\Models\Unit;
use App\Services\MedicalRecordService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MedicalRecordController extends Controller
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
                'assessments:id,encounter_id,is_final,type,triage_level,updated_at',
                'diagnoses:id,encounter_id,icd10_code,icd10_name,type',
            ])
            ->whereDate('arrived_at', $selectedDate)
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('unit_id', $assignedUnitIds))
            ->when($unitId > 0, fn (Builder $query) => $query->where('unit_id', $unitId))
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->orderByRaw("CASE WHEN status = 'in_consultation' THEN 1 WHEN status = 'arrived' THEN 2 ELSE 3 END")
            ->orderBy('arrived_at')
            ->paginate(15)
            ->withQueryString();

        $units = Unit::query()
            ->active()
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('id', $assignedUnitIds))
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('medical-record/home/index', [
            'encounters' => $encounters,
            'units' => $units,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'unit_id' => $unitId > 0 ? $unitId : null,
                'date' => $selectedDate,
            ],
            'statistics' => [
                'total_today' => Encounter::whereDate('arrived_at', $selectedDate)
                    ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('unit_id', $assignedUnitIds))
                    ->count(),
                'in_consultation' => Encounter::whereDate('arrived_at', $selectedDate)
                    ->where('status', EncounterStatus::InConsultation)
                    ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('unit_id', $assignedUnitIds))
                    ->count(),
                'waiting' => Encounter::whereDate('arrived_at', $selectedDate)
                    ->where('status', EncounterStatus::Arrived)
                    ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('unit_id', $assignedUnitIds))
                    ->count(),
                'finished' => Encounter::whereDate('arrived_at', $selectedDate)
                    ->where('status', EncounterStatus::Finished)
                    ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('unit_id', $assignedUnitIds))
                    ->count(),
            ],
        ]);
    }

    public function patientHistory(Request $request, Patient $patient, MedicalRecordService $service): Response
    {
        $user = $request->user();
        if (! $user || ! $user->can(MedicalRecordPermission::EncounterView->value)) {
            abort(403, 'Anda tidak memiliki hak akses melihat riwayat rekam medis pasien.');
        }

        $canViewSensitive = $user->can(MedicalRecordPermission::SensitiveNoteView->value)
            || BreakGlassGrant::where('user_id', $user->id)
                ->where('patient_id', $patient->id)
                ->active()
                ->exists();

        $relations = [
            'unit:id,name,code',
            'doctor:id,name',
            'guarantor:id,name',
            'assessments.createdBy:id,name',
            'assessments.finalizedBy:id,name',
            'assessments.addenda.createdBy:id,name',
            'diagnoses.createdBy:id,name',
            'procedures.performedBy:id,name',
            'procedures.createdBy:id,name',
            'clinicalReports.doctor:id,name',
            'clinicalReports.createdBy:id,name',
        ];

        if ($canViewSensitive) {
            $relations[] = 'sensitiveNotes.createdBy:id,name';
        }

        $encounters = $patient->encounters()
            ->with($relations)
            ->orderByDesc('arrived_at')
            ->paginate(10)
            ->withQueryString();

        PatientAccessLog::create([
            'user_id' => $user->id,
            'patient_id' => $patient->id,
            'action' => 'view_patient_history',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'context' => [
                'total_encounters' => $encounters->total(),
                'viewed_sensitive' => $canViewSensitive,
            ],
        ]);

        return Inertia::render('medical-record/patient/history/index', [
            'patient' => $patient,
            'encounters' => $encounters,
            'can_view_sensitive' => $canViewSensitive,
        ]);
    }
}
