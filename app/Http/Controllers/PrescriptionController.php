<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelPrescriptionRequest;
use App\Http\Requests\DispensePrescriptionRequest;
use App\Http\Requests\ReturnDispensedRequest;
use App\Http\Requests\StorePrescriptionRequest;
use App\Http\Requests\VerifyPrescriptionRequest;
use App\Models\Dispensing;
use App\Models\Prescription;
use App\Models\Unit;
use App\Services\PharmacyStockService;
use App\Services\PrescriptionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function __construct(
        protected PrescriptionService $prescriptionService,
        protected PharmacyStockService $stockService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Prescription::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();
        $unitId = $request->input('unit_id');
        $date = $request->string('date')->toString();

        $prescriptions = Prescription::query()
            ->with([
                'patient:id,name,medical_record_number,gender,birth_date',
                'doctor:id,name',
                'unit:id,name',
                'pharmacist:id,name',
                'items.drug:id,name,form,unit_of_measure',
            ])
            ->when($search !== '', fn (Builder $q) => $q->search($search))
            ->when($status !== '' && $status !== 'all', fn (Builder $q) => $q->where('status', $status))
            ->when($unitId !== null && $unitId !== '' && $unitId !== 'all', fn (Builder $q) => $q->where('unit_id', $unitId))
            ->when($date !== '', fn (Builder $q) => $q->whereDate('created_at', $date))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $units = Unit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('pharmacy/prescription/list/index', [
            'prescriptions' => $prescriptions,
            'units' => $units,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'unit_id' => $unitId ? (int) $unitId : null,
                'date' => $date,
            ],
            'statistics' => [
                'total_today' => Prescription::query()->whereDate('created_at', today())->count(),
                'submitted' => Prescription::query()->where('status', 'submitted')->count(),
                'verified' => Prescription::query()->where('status', 'verified')->count(),
                'dispensed' => Prescription::query()->where('status', 'dispensed')->count(),
            ],
        ]);
    }

    public function show(Prescription $prescription): Response
    {
        Gate::authorize('view', $prescription);

        $prescription->load([
            'encounter.queue',
            'patient',
            'doctor',
            'unit',
            'pharmacist',
            'items.drug.batches' => fn ($q) => $q->fefoAvailable(),
            'items.dispensings.drugBatch',
            'items.dispensings.dispenser',
            'returns.drugBatch',
            'returns.returnedBy',
        ]);

        return Inertia::render('pharmacy/prescription/show/index', [
            'prescription' => $prescription,
        ]);
    }

    public function store(StorePrescriptionRequest $request): RedirectResponse
    {
        Gate::authorize('create', Prescription::class);

        $prescription = $this->prescriptionService->createPrescription(
            $request->validated(),
            $request->user()
        );

        return back()->with('success', "Resep {$prescription->prescription_number} berhasil diterbitkan.");
    }

    public function verify(VerifyPrescriptionRequest $request, Prescription $prescription): RedirectResponse
    {
        Gate::authorize('verify', $prescription);

        $this->prescriptionService->verifyPrescription(
            $prescription,
            $request->user(),
            $request->validated('verification_notes')
        );

        return back()->with('success', 'Resep berhasil ditelaah dan diverifikasi.');
    }

    public function dispense(DispensePrescriptionRequest $request, Prescription $prescription): RedirectResponse
    {
        Gate::authorize('dispense', $prescription);

        $this->prescriptionService->dispensePrescription(
            $prescription,
            $request->user(),
            $request->validated('notes')
        );

        return back()->with('success', 'Obat berhasil di-dispense dan stok otomatis terpotong (FEFO).');
    }

    public function cancel(CancelPrescriptionRequest $request, Prescription $prescription): RedirectResponse
    {
        Gate::authorize('cancel', $prescription);

        $this->prescriptionService->cancelPrescription(
            $prescription,
            $request->validated('cancel_reason'),
            $request->user()
        );

        return back()->with('success', 'Resep berhasil dibatalkan.');
    }

    public function returnItem(ReturnDispensedRequest $request, Prescription $prescription): RedirectResponse
    {
        Gate::authorize('return', $prescription);

        /** @var Dispensing $dispensing */
        $dispensing = Dispensing::query()->findOrFail($request->validated('dispensing_id'));

        $this->stockService->returnDispensed(
            $dispensing,
            (int) $request->validated('quantity'),
            $request->validated('reason'),
            $request->user()
        );

        return back()->with('success', 'Retur obat berhasil dicatat dan stok batch telah dikembalikan.');
    }
}
