<?php

namespace App\Http\Controllers;

use App\Http\Requests\DischargePatientRequest;
use App\Http\Requests\StoreAdmissionRequest;
use App\Http\Requests\StoreDailyNoteRequest;
use App\Http\Requests\TransferBedRequest;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\Encounter;
use App\Services\InpatientService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionController extends Controller
{
    public function __construct(
        protected InpatientService $inpatientService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Admission::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString(); // active, discharged, all

        $admissions = Admission::query()
            ->with(['patient', 'doctor', 'currentAssignment.bed'])
            ->when($search !== '', fn (Builder $q) => $q->search($search))
            ->when($status !== '' && $status !== 'all', fn (Builder $q) => $q->where('status', $status))
            ->when($status === '', fn (Builder $q) => $q->where('status', 'active'))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $availableBeds = Bed::where('status', 'available')->orderBy('room_name')->orderBy('bed_number')->get();

        $activeEncounters = Encounter::query()
            ->with(['patient', 'doctor.user'])
            ->whereDoesntHave('admissions', fn (Builder $q) => $q->where('status', 'active'))
            ->whereNotIn('status', ['cancelled'])
            ->latest('id')
            ->limit(50)
            ->get();

        return Inertia::render('inpatient/admission/list/index', [
            'admissions' => $admissions,
            'availableBeds' => $availableBeds,
            'activeEncounters' => $activeEncounters,
            'filters' => [
                'search' => $search,
                'status' => $status ?: 'active',
            ],
            'statistics' => [
                'active_patients' => Admission::where('status', 'active')->count(),
                'discharged_today' => Admission::where('status', 'discharged')->whereDate('discharged_at', Carbon::today())->count(),
                'available_beds' => Bed::where('status', 'available')->count(),
                'bed_occupancy_rate' => Bed::count() > 0
                    ? round((Bed::where('status', 'occupied')->count() / Bed::count()) * 100)
                    : 0,
            ],
        ]);
    }

    public function store(StoreAdmissionRequest $request): RedirectResponse
    {
        Gate::authorize('create', Admission::class);

        $encounter = Encounter::findOrFail($request->validated('encounter_id'));
        $bed = Bed::findOrFail($request->validated('bed_id'));

        $admission = $this->inpatientService->admitPatient($encounter, $bed, $request->validated(), $request->user());

        return redirect()
            ->route('inpatient.admissions.show', $admission->id)
            ->with('success', "Pasien berhasil di-admisi ke Bed {$bed->bed_number}.");
    }

    public function show(Admission $admission): Response
    {
        Gate::authorize('view', $admission);

        $admission->load([
            'patient',
            'doctor',
            'encounter',
            'currentAssignment.bed',
            'assignments.bed',
            'assignments.assignedBy',
            'dailyNotes.author',
        ]);

        $availableBeds = Bed::where('status', 'available')
            ->orderBy('room_name')
            ->orderBy('bed_number')
            ->get();

        return Inertia::render('inpatient/admission/show/index', [
            'admission' => $admission,
            'availableBeds' => $availableBeds,
        ]);
    }

    public function transferBed(TransferBedRequest $request, Admission $admission): RedirectResponse
    {
        Gate::authorize('transfer', $admission);

        $targetBed = Bed::findOrFail($request->validated('target_bed_id'));
        $this->inpatientService->transferBed($admission, $targetBed, $request->validated('reason'), $request->user());

        return back()->with('success', "Pasien berhasil dipindahkan ke Bed {$targetBed->bed_number} ({$targetBed->room_name}).");
    }

    public function discharge(DischargePatientRequest $request, Admission $admission): RedirectResponse
    {
        Gate::authorize('discharge', $admission);

        $this->inpatientService->dischargePatient($admission, $request->validated(), $request->user());

        return back()->with('success', "Pasien {$admission->patient->name} berhasil dipulangkan.");
    }

    public function addDailyNote(StoreDailyNoteRequest $request, Admission $admission): RedirectResponse
    {
        Gate::authorize('addNote', $admission);

        $this->inpatientService->addDailyNote($admission, $request->validated(), $request->user());

        return back()->with('success', 'Catatan harian perkembangan pasien berhasil ditambahkan.');
    }
}
