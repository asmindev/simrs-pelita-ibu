<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\StoreClinicalReportRequest;
use App\Models\ClinicalReport;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Services\MedicalRecordService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalReportController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', ClinicalReport::class);

        $user = $request->user();
        $assignedUnitIds = $user?->unitIds() ?? [];

        $reportType = $request->string('report_type')->toString();
        $search = $request->string('search')->trim()->toString();

        $reports = ClinicalReport::query()
            ->with([
                'patient:id,medical_record_number,name,birth_date,gender',
                'encounter:id,encounter_number,unit_id',
                'doctor:id,name',
                'createdBy:id,name',
            ])
            ->when(! empty($assignedUnitIds), function (Builder $query) use ($assignedUnitIds): void {
                $query->whereHas('encounter', fn (Builder $q) => $q->whereIn('unit_id', $assignedUnitIds));
            })
            ->when($reportType !== '', fn (Builder $query) => $query->where('report_type', $reportType))
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $q) use ($search): void {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhereHas('patient', function (Builder $pq) use ($search): void {
                            $pq->where('name', 'like', "%{$search}%")
                                ->orWhere('medical_record_number', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('reported_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('medical-record/report/list/index', [
            'reports' => $reports,
            'filters' => [
                'report_type' => $reportType,
                'search' => $search,
            ],
        ]);
    }

    public function create(Request $request, Encounter $encounter): Response
    {
        $user = $request->user();
        if (! $user || ! $user->can(MedicalRecordPermission::ReportManage->value)) {
            abort(403, 'Anda tidak berwenang membuat laporan klinis.');
        }

        $assignedUnits = $user->unitIds();
        if (! empty($assignedUnits) && ! in_array($encounter->unit_id, $assignedUnits, true)) {
            abort(403, 'Akses unit dibatasi.');
        }

        $encounter->load(['patient', 'unit', 'doctor']);

        $doctors = Doctor::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('medical-record/report/create/index', [
            'encounter' => $encounter,
            'doctors' => $doctors,
        ]);
    }

    public function store(StoreClinicalReportRequest $request, Encounter $encounter, MedicalRecordService $service): RedirectResponse
    {
        $report = $service->createClinicalReport($encounter, $request->validated(), $request->user());

        return redirect()->route('medical-record.reports.show', $report)
            ->with('success', 'Laporan klinis berhasil diterbitkan.');
    }

    public function show(Request $request, ClinicalReport $clinicalReport): Response
    {
        Gate::authorize('view', $clinicalReport);

        $clinicalReport->load([
            'patient',
            'encounter.unit',
            'doctor',
            'createdBy',
        ]);

        return Inertia::render('medical-record/report/show/index', [
            'report' => $clinicalReport,
        ]);
    }
}
