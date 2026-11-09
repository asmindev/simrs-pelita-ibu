<?php

namespace App\Http\Controllers;

use App\Enums\EncounterStatus;
use App\Enums\EncounterType;
use App\Enums\QueueStatus;
use App\Enums\RoleName;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\BreakGlassGrant;
use App\Models\DiagnosticOrder;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\DrugBatch;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    /**
     * Display the domain role-based operational dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $availableRoles = $this->determineAvailableRoles($user);

        $requestedRole = (string) $request->query('role', '');
        $activeRole = collect($availableRoles)->firstWhere('key', $requestedRole)['key']
            ?? $availableRoles[0]['key']
            ?? 'executive';

        $data = match ($activeRole) {
            'doctor' => $this->getDoctorData($user),
            'registration' => $this->getRegistrationData(),
            'pharmacist' => $this->getPharmacyData(),
            'cashier' => $this->getCashierData(),
            'nurse' => $this->getNurseData(),
            'diagnostics' => $this->getDiagnosticsData(),
            default => $this->getExecutiveData(),
        };

        return Inertia::render('dashboard/index', [
            'activeRole' => $activeRole,
            'availableRoles' => $availableRoles,
            'metrics' => $data['metrics'],
            'widgets' => $data['widgets'],
        ]);
    }

    /**
     * Determine list of accessible dashboard views for the user.
     *
     * @return array<int, array{key: string, label: string}>
     */
    private function determineAvailableRoles(User $user): array
    {
        $allRoles = [
            ['key' => 'executive', 'label' => 'Eksekutif & Manajemen'],
            ['key' => 'doctor', 'label' => 'Dokter & Poliklinik'],
            ['key' => 'registration', 'label' => 'Pendaftaran & Antrean'],
            ['key' => 'pharmacist', 'label' => 'Farmasi & Apotek'],
            ['key' => 'cashier', 'label' => 'Kasir & Billing'],
            ['key' => 'nurse', 'label' => 'Rawat Inap & Bed'],
            ['key' => 'diagnostics', 'label' => 'Laboratorium & Radiologi'],
        ];

        if ($user->hasRole(RoleName::SuperAdmin->value) || $user->hasRole(RoleName::Admin->value)) {
            return $allRoles;
        }

        $roles = [];

        if ($user->hasRole(RoleName::Doctor->value)) {
            $roles[] = ['key' => 'doctor', 'label' => 'Dokter & Poliklinik'];
        }

        if ($user->hasRole(RoleName::Registration->value)) {
            $roles[] = ['key' => 'registration', 'label' => 'Pendaftaran & Antrean'];
        }

        if ($user->hasRole(RoleName::Pharmacist->value)) {
            $roles[] = ['key' => 'pharmacist', 'label' => 'Farmasi & Apotek'];
        }

        if ($user->hasRole(RoleName::Cashier->value)) {
            $roles[] = ['key' => 'cashier', 'label' => 'Kasir & Billing'];
        }

        if ($user->hasRole(RoleName::Nurse->value)) {
            $roles[] = ['key' => 'nurse', 'label' => 'Rawat Inap & Bed'];
        }

        if ($user->hasRole([RoleName::LabAnalyst->value, RoleName::Radiographer->value])) {
            $roles[] = ['key' => 'diagnostics', 'label' => 'Laboratorium & Radiologi'];
        }

        if ($user->hasRole([RoleName::Management->value, RoleName::Auditor->value])) {
            $roles[] = ['key' => 'executive', 'label' => 'Eksekutif & Manajemen'];
        }

        if (empty($roles)) {
            $roles[] = ['key' => 'executive', 'label' => 'Dashboard Umum'];
        }

        return $roles;
    }

    /**
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    private function getDoctorData(User $user): array
    {
        $today = Carbon::today();
        $doctor = Doctor::where('email', $user->email)->first()
            ?? Doctor::where('name', $user->name)->first();
        $doctorId = $doctor?->id;

        $encountersQuery = Encounter::whereDate('arrived_at', $today);
        if ($doctorId) {
            $encountersQuery->where('doctor_id', $doctorId);
        }

        $waitingCount = (clone $encountersQuery)->where('status', EncounterStatus::Arrived)->count();
        $inConsultationCount = (clone $encountersQuery)->where('status', EncounterStatus::InConsultation)->count();
        $finishedCount = (clone $encountersQuery)->where('status', EncounterStatus::Finished)->count();

        $patientQueue = (clone $encountersQuery)
            ->with(['patient:id,medical_record_number,name,birth_date,gender', 'unit:id,name', 'queue'])
            ->whereIn('status', [EncounterStatus::Arrived, EncounterStatus::InConsultation])
            ->orderBy('arrived_at', 'asc')
            ->limit(10)
            ->get()
            ->map(fn ($enc) => [
                'id' => $enc->id,
                'encounter_number' => $enc->encounter_number,
                'patient_name' => $enc->patient->name,
                'patient_mrn' => $enc->patient->medical_record_number,
                'unit_name' => $enc->unit->name,
                'queue_code' => $enc->queue?->queue_code ?? '-',
                'status' => $enc->status->value,
                'status_label' => $enc->status->label(),
                'arrived_at' => $enc->arrived_at->format('H:i'),
            ]);

        $recentDiagnostics = DiagnosticOrder::whereDate('created_at', '>=', $today->copy()->subDays(3))
            ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
            ->where('status', 'completed')
            ->with(['patient:id,name,medical_record_number'])
            ->latest('completed_at')
            ->limit(5)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'patient_name' => $order->patient->name,
                'patient_mrn' => $order->patient->medical_record_number,
                'type' => $order->type,
                'completed_at' => $order->completed_at?->diffForHumans() ?? '-',
            ]);

        return [
            'metrics' => [
                'waiting_count' => $waitingCount,
                'in_consultation_count' => $inConsultationCount,
                'finished_today_count' => $finishedCount,
                'doctor_name' => $doctor?->name ?? $user->name,
            ],
            'widgets' => [
                'patient_queue' => $patientQueue,
                'recent_diagnostics' => $recentDiagnostics,
            ],
        ];
    }

    /**
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    private function getRegistrationData(): array
    {
        $today = Carbon::today();
        $totalEncounters = Encounter::whereDate('arrived_at', $today)->count();
        $outpatientCount = Encounter::whereDate('arrived_at', $today)->where('type', EncounterType::Outpatient)->count();
        $emergencyCount = Encounter::whereDate('arrived_at', $today)->where('type', EncounterType::Emergency)->count();
        $newPatientsToday = Patient::whereDate('created_at', $today)->count();

        $queuesByUnit = Unit::where('is_active', true)
            ->withCount([
                'queues as waiting_count' => fn ($q) => $q->whereDate('queue_date', $today)->where('status', QueueStatus::Waiting),
                'queues as serving_count' => fn ($q) => $q->whereDate('queue_date', $today)->where('status', QueueStatus::Serving),
                'queues as total_count' => fn ($q) => $q->whereDate('queue_date', $today),
            ])
            ->get()
            ->filter(fn ($u) => $u->total_count > 0 || $u->type === 'outpatient')
            ->take(8)
            ->map(fn ($u) => [
                'id' => $u->id,
                'unit_name' => $u->name,
                'waiting' => $u->waiting_count,
                'serving' => $u->serving_count,
                'total' => $u->total_count,
            ])
            ->values();

        $recentEncounters = Encounter::whereDate('arrived_at', $today)
            ->with(['patient:id,medical_record_number,name,gender', 'unit:id,name', 'doctor:id,name'])
            ->latest('arrived_at')
            ->limit(8)
            ->get()
            ->map(fn ($enc) => [
                'id' => $enc->id,
                'encounter_number' => $enc->encounter_number,
                'patient_name' => $enc->patient->name,
                'patient_mrn' => $enc->patient->medical_record_number,
                'unit_name' => $enc->unit->name,
                'doctor_name' => $enc->doctor?->name ?? 'Belum Ditentukan',
                'type' => $enc->type->value,
                'status' => $enc->status->value,
                'arrived_at' => $enc->arrived_at->format('H:i'),
            ]);

        $activeDoctorsToday = DoctorSchedule::where('day_of_week', $today->dayOfWeek)
            ->where('is_active', true)
            ->with(['doctor:id,name,specialization', 'unit:id,name'])
            ->limit(6)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'doctor_name' => $s->doctor->name,
                'specialization' => $s->doctor->specialization ?? '-',
                'unit_name' => $s->unit->name,
                'schedule_time' => substr($s->start_time, 0, 5).' - '.substr($s->end_time, 0, 5),
                'quota' => $s->quota,
            ]);

        return [
            'metrics' => [
                'total_encounters' => $totalEncounters,
                'outpatient_count' => $outpatientCount,
                'emergency_count' => $emergencyCount,
                'new_patients_today' => $newPatientsToday,
            ],
            'widgets' => [
                'queues_by_unit' => $queuesByUnit,
                'recent_encounters' => $recentEncounters,
                'active_doctors_today' => $activeDoctorsToday,
            ],
        ];
    }

    /**
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    private function getPharmacyData(): array
    {
        $today = Carbon::today();
        $submittedCount = Prescription::where('status', 'submitted')->count();
        $verifiedCount = Prescription::where('status', 'verified')->count();
        $dispensedTodayCount = Prescription::where('status', 'dispensed')->whereDate('dispensed_at', $today)->count();

        $lowStockCount = DrugBatch::where('is_active', true)->where('current_quantity', '<=', 10)->count();
        $expiringBatchesCount = DrugBatch::where('is_active', true)
            ->where('current_quantity', '>', 0)
            ->whereDate('expiry_date', '<=', $today->copy()->addDays(30))
            ->count();

        $pendingPrescriptions = Prescription::whereIn('status', ['submitted', 'verified'])
            ->with(['patient:id,name,medical_record_number', 'doctor:id,name', 'unit:id,name', 'items'])
            ->orderBy('created_at', 'asc')
            ->limit(8)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'prescription_number' => $p->prescription_number,
                'patient_name' => $p->patient->name,
                'patient_mrn' => $p->patient->medical_record_number,
                'doctor_name' => $p->doctor->name,
                'unit_name' => $p->unit->name,
                'items_count' => $p->items->count(),
                'status' => $p->status,
                'created_at' => $p->created_at?->format('H:i') ?? '-',
            ]);

        $criticalBatches = DrugBatch::where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->where('current_quantity', '<=', 10)
                    ->orWhereDate('expiry_date', '<=', $today->copy()->addDays(30));
            })
            ->with(['drug:id,name,code,unit_of_measure'])
            ->orderBy('expiry_date', 'asc')
            ->limit(5)
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'batch_number' => $b->batch_number,
                'drug_name' => $b->drug->name,
                'drug_code' => $b->drug->code,
                'current_quantity' => $b->current_quantity,
                'unit_of_measure' => $b->drug->unit_of_measure,
                'expiry_date' => $b->expiry_date->format('d/m/Y'),
                'is_expired' => $b->expiry_date->isPast(),
            ]);

        return [
            'metrics' => [
                'submitted_count' => $submittedCount,
                'verified_count' => $verifiedCount,
                'dispensed_today_count' => $dispensedTodayCount,
                'low_stock_drugs_count' => $lowStockCount,
                'expiring_batches_count' => $expiringBatchesCount,
            ],
            'widgets' => [
                'pending_prescriptions' => $pendingPrescriptions,
                'critical_batches' => $criticalBatches,
            ],
        ];
    }

    /**
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    private function getCashierData(): array
    {
        $today = Carbon::today();
        $pendingInvoicesCount = Invoice::whereIn('status', ['draft', 'finalized'])->count();
        $paidInvoicesTodayCount = Invoice::where('status', 'paid')->whereDate('updated_at', $today)->count();
        $todayRevenue = (float) Payment::whereDate('paid_at', $today)->sum('amount');
        $totalPendingAmount = (float) Invoice::whereIn('status', ['draft', 'finalized'])->sum('total_amount');

        $pendingInvoices = Invoice::whereIn('status', ['draft', 'finalized'])
            ->with(['patient:id,name,medical_record_number', 'guarantor:id,name'])
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($inv) => [
                'id' => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'patient_name' => $inv->patient->name,
                'patient_mrn' => $inv->patient->medical_record_number,
                'guarantor_name' => $inv->guarantor?->name ?? 'Pribadi / Umum',
                'total_amount' => (float) $inv->total_amount,
                'paid_amount' => (float) $inv->paid_amount,
                'status' => $inv->status,
                'created_at' => $inv->created_at?->format('H:i') ?? '-',
            ]);

        $paymentMethodsBreakdown = Payment::whereDate('paid_at', $today)
            ->selectRaw('method, sum(amount) as total, count(*) as count')
            ->groupBy('method')
            ->get()
            ->map(fn ($m) => [
                'method' => $m->method,
                'total' => (float) $m->total,
                'count' => (int) $m->count,
            ]);

        return [
            'metrics' => [
                'pending_invoices_count' => $pendingInvoicesCount,
                'paid_today_count' => $paidInvoicesTodayCount,
                'today_revenue' => $todayRevenue,
                'total_pending_amount' => $totalPendingAmount,
            ],
            'widgets' => [
                'pending_invoices' => $pendingInvoices,
                'payment_methods_breakdown' => $paymentMethodsBreakdown,
            ],
        ];
    }

    /**
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    private function getNurseData(): array
    {
        $today = Carbon::today();
        $totalBeds = Bed::count();
        $occupiedBeds = Bed::where('status', 'occupied')->count();
        $availableBeds = Bed::where('status', 'available')->count();
        $bor = $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 1) : 0;

        $todayAdmissions = Admission::whereDate('admitted_at', $today)->count();
        $activeInpatientsCount = Admission::where('status', 'admitted')->count();

        $bedClasses = Bed::selectRaw('class, count(*) as total, sum(case when status = "occupied" then 1 else 0 end) as occupied')
            ->groupBy('class')
            ->get()
            ->map(fn ($b) => [
                'class' => $b->class,
                'total' => (int) $b->total,
                'occupied' => (int) $b->occupied,
                'available' => (int) $b->total - (int) $b->occupied,
            ]);

        $activeInpatients = Admission::where('status', 'admitted')
            ->with(['patient:id,name,mrn,gender', 'doctor:id,name'])
            ->latest('admitted_at')
            ->limit(8)
            ->get()
            ->map(fn ($adm) => [
                'id' => $adm->id,
                'admission_number' => $adm->admission_number,
                'patient_name' => $adm->patient->name,
                'patient_mrn' => $adm->patient->mrn,
                'doctor_name' => $adm->doctor->name,
                'admitted_at' => $adm->admitted_at->format('d/m/Y H:i'),
                'initial_diagnosis' => $adm->initial_diagnosis ?? '-',
            ]);

        return [
            'metrics' => [
                'total_beds' => $totalBeds,
                'occupied_beds' => $occupiedBeds,
                'available_beds' => $availableBeds,
                'bor_percentage' => $bor,
                'today_admissions' => $todayAdmissions,
                'active_inpatients_count' => $activeInpatientsCount,
            ],
            'widgets' => [
                'bed_classes' => $bedClasses,
                'active_inpatients' => $activeInpatients,
            ],
        ];
    }

    /**
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    private function getDiagnosticsData(): array
    {
        $today = Carbon::today();
        $pendingLabOrders = DiagnosticOrder::where('type', 'laboratory')->where('status', 'ordered')->count();
        $pendingRadOrders = DiagnosticOrder::where('type', 'radiology')->where('status', 'ordered')->count();
        $inProgressOrders = DiagnosticOrder::where('status', 'in_progress')->count();
        $completedToday = DiagnosticOrder::where('status', 'completed')->whereDate('completed_at', $today)->count();

        $pendingOrders = DiagnosticOrder::whereIn('status', ['ordered', 'in_progress'])
            ->with(['patient:id,name,medical_record_number', 'doctor:id,name'])
            ->orderBy('created_at', 'asc')
            ->limit(8)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'type' => $o->type,
                'patient_name' => $o->patient->name,
                'patient_mrn' => $o->patient->medical_record_number,
                'doctor_name' => $o->doctor->name,
                'status' => $o->status,
                'created_at' => $o->created_at?->format('H:i') ?? '-',
            ]);

        return [
            'metrics' => [
                'pending_lab_orders' => $pendingLabOrders,
                'pending_rad_orders' => $pendingRadOrders,
                'in_progress_orders' => $inProgressOrders,
                'completed_today' => $completedToday,
            ],
            'widgets' => [
                'pending_orders' => $pendingOrders,
            ],
        ];
    }

    /**
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    private function getExecutiveData(): array
    {
        $today = Carbon::today();
        $totalEncountersToday = Encounter::whereDate('arrived_at', $today)->count();
        $totalAdmittedPatients = Admission::where('status', 'admitted')->count();
        $totalBeds = Bed::count();
        $occupiedBeds = Bed::where('status', 'occupied')->count();
        $bor = $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 1) : 0;
        $todayRevenue = (float) Payment::whereDate('paid_at', $today)->sum('amount');
        $pendingBreakGlassCount = BreakGlassGrant::whereNull('reviewed_at')->count();
        $pendingPrescriptionsCount = Prescription::whereIn('status', ['submitted', 'verified'])->count();
        $pendingDiagnosticsCount = DiagnosticOrder::whereIn('status', ['ordered', 'in_progress'])->count();

        $recentEncounters = Encounter::whereDate('arrived_at', $today)
            ->with(['patient:id,name,medical_record_number', 'unit:id,name', 'doctor:id,name'])
            ->latest('arrived_at')
            ->limit(6)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'encounter_number' => $e->encounter_number,
                'patient_name' => $e->patient->name,
                'patient_mrn' => $e->patient->medical_record_number,
                'unit_name' => $e->unit->name,
                'doctor_name' => $e->doctor?->name ?? '-',
                'type' => $e->type->value,
                'status' => $e->status->value,
                'status_label' => $e->status->label(),
                'arrived_at' => $e->arrived_at->format('H:i'),
            ]);

        $recentAuditLogs = Activity::latest()
            ->with('causer:id,name')
            ->limit(6)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'description' => $log->description,
                'causer_name' => $log->causer?->name ?? 'Sistem',
                'created_at' => $log->created_at?->diffForHumans() ?? '-',
            ]);

        return [
            'metrics' => [
                'total_encounters_today' => $totalEncountersToday,
                'total_admitted_patients' => $totalAdmittedPatients,
                'bor_percentage' => $bor,
                'occupied_beds' => $occupiedBeds,
                'total_beds' => $totalBeds,
                'today_revenue' => $todayRevenue,
                'pending_break_glass' => $pendingBreakGlassCount,
                'pending_prescriptions' => $pendingPrescriptionsCount,
                'pending_diagnostics' => $pendingDiagnosticsCount,
            ],
            'widgets' => [
                'recent_encounters' => $recentEncounters,
                'recent_audit_logs' => $recentAuditLogs,
            ],
        ];
    }
}
