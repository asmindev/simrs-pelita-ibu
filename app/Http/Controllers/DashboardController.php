<?php

namespace App\Http\Controllers;

use App\Enums\EncounterStatus;
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
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Queue;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the unified action-oriented operational dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        $userRoles = $user->getRoleNames()->all();
        $isSuperAdmin = $user->hasRole(RoleName::SuperAdmin->value) || $user->hasRole(RoleName::Admin->value);
        $isDoctor = $isSuperAdmin || $user->hasRole(RoleName::Doctor->value);
        $isRegistration = $isSuperAdmin || $user->hasRole(RoleName::Registration->value);
        $isPharmacist = $isSuperAdmin || $user->hasRole(RoleName::Pharmacist->value);
        $isCashier = $isSuperAdmin || $user->hasRole(RoleName::Cashier->value);
        $isNurse = $isSuperAdmin || $user->hasRole(RoleName::Nurse->value);
        $isDiagnostics = $isSuperAdmin || $user->hasRole([RoleName::LabAnalyst->value, RoleName::Radiographer->value]);
        $isExecutive = $isSuperAdmin || $user->hasRole([RoleName::Management->value, RoleName::Auditor->value]);

        // 1. Pipeline Metrics (Hospital-wide flow)
        $totalBeds = Bed::count();
        $occupiedBeds = Bed::where('status', 'occupied')->count();
        $borPercentage = $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 1) : 0;

        $pipeline = [
            'registration_count' => Encounter::whereDate('arrived_at', $today)->count(),
            'waiting_consultations' => Encounter::whereDate('arrived_at', $today)->where('status', EncounterStatus::Arrived)->count(),
            'in_consultations' => Encounter::whereDate('arrived_at', $today)->where('status', EncounterStatus::InConsultation)->count(),
            'pending_prescriptions' => Prescription::whereIn('status', ['submitted', 'verified'])->count(),
            'pending_invoices' => Invoice::whereIn('status', ['draft', 'finalized'])->count(),
            'pending_diagnostics' => DiagnosticOrder::whereIn('status', ['ordered', 'in_progress'])->count(),
            'total_beds' => $totalBeds,
            'occupied_beds' => $occupiedBeds,
            'bor_percentage' => $borPercentage,
            'today_revenue' => (float) Payment::whereDate('paid_at', $today)->sum('amount'),
        ];

        // 2. Unified Action Feed tailored to user's assigned roles
        $feedItems = collect();

        // A. Doctor Task Items (waiting & in-consultation encounters)
        if ($isDoctor) {
            $doctor = Doctor::where('email', $user->email)->first()
                ?? Doctor::where('name', $user->name)->first();
            $doctorId = $doctor?->id;

            $doctorEncounters = Encounter::whereDate('arrived_at', $today)
                ->when($doctorId && ! $isSuperAdmin, fn ($q) => $q->where('doctor_id', $doctorId))
                ->whereIn('status', [EncounterStatus::Arrived, EncounterStatus::InConsultation])
                ->with(['patient:id,medical_record_number,name,gender', 'unit:id,name', 'queue'])
                ->orderBy('arrived_at', 'asc')
                ->limit(10)
                ->get()
                ->map(fn ($enc) => [
                    'id' => 'enc-'.$enc->id,
                    'category' => 'clinical',
                    'badge' => $enc->unit->name,
                    'title' => $enc->patient->name,
                    'subtitle' => 'RM: '.$enc->patient->medical_record_number.($enc->queue ? ' • Antrean '.$enc->queue->queue_code : ''),
                    'status' => $enc->status->value,
                    'status_label' => $enc->status->label(),
                    'time' => $enc->arrived_at->format('H:i'),
                    'timestamp' => $enc->arrived_at->timestamp,
                    'action_label' => 'Buka EMR',
                    'action_route' => route('medical-record.encounters.show', $enc->id),
                    'action_icon' => 'stethoscope',
                ]);

            $feedItems = $feedItems->concat($doctorEncounters);
        }

        // B. Pharmacist Task Items (prescriptions waiting verification/dispensing)
        if ($isPharmacist) {
            $pharmacyOrders = Prescription::whereIn('status', ['submitted', 'verified'])
                ->with(['patient:id,name,medical_record_number', 'unit:id,name', 'items'])
                ->orderBy('created_at', 'asc')
                ->limit(8)
                ->get()
                ->map(fn ($rx) => [
                    'id' => 'rx-'.$rx->id,
                    'category' => 'pharmacy',
                    'badge' => 'Farmasi',
                    'title' => 'Resep '.$rx->prescription_number,
                    'subtitle' => $rx->patient->name.' (RM: '.$rx->patient->medical_record_number.') • '.$rx->items->count().' R/ obat',
                    'status' => $rx->status,
                    'status_label' => $rx->status === 'submitted' ? 'Menunggu Telaah' : 'Siap Racik',
                    'time' => $rx->created_at?->format('H:i') ?? '-',
                    'timestamp' => $rx->created_at?->timestamp ?? 0,
                    'action_label' => 'Telaah & Racik',
                    'action_route' => route('pharmacy.prescriptions.show', $rx->id),
                    'action_icon' => 'pill',
                ]);

            $feedItems = $feedItems->concat($pharmacyOrders);
        }

        // C. Cashier Task Items (invoices waiting for payment)
        if ($isCashier) {
            $invoices = Invoice::whereIn('status', ['draft', 'finalized'])
                ->with(['patient:id,name,medical_record_number', 'guarantor:id,name'])
                ->latest('created_at')
                ->limit(8)
                ->get()
                ->map(fn ($inv) => [
                    'id' => 'inv-'.$inv->id,
                    'category' => 'cashier',
                    'badge' => 'Kasir Billing',
                    'title' => 'Invoice '.$inv->invoice_number,
                    'subtitle' => $inv->patient->name.' • '.($inv->guarantor?->name ?? 'Pribadi').' • Rp '.number_format((float) $inv->total_amount, 0, ',', '.'),
                    'status' => $inv->status,
                    'status_label' => $inv->status === 'finalized' ? 'Siap Bayar' : 'Draft Tagihan',
                    'time' => $inv->created_at?->format('H:i') ?? '-',
                    'timestamp' => $inv->created_at?->timestamp ?? 0,
                    'action_label' => 'Detail Tagihan',
                    'action_route' => route('cashier.invoices.show', $inv->id),
                    'action_icon' => 'wallet',
                ]);

            $feedItems = $feedItems->concat($invoices);
        }

        // D. Diagnostics Task Items (orders waiting sample / result entry)
        if ($isDiagnostics) {
            $diagOrders = DiagnosticOrder::whereIn('status', ['ordered', 'in_progress'])
                ->with(['patient:id,name,medical_record_number', 'doctor:id,name'])
                ->orderBy('created_at', 'asc')
                ->limit(8)
                ->get()
                ->map(fn ($order) => [
                    'id' => 'diag-'.$order->id,
                    'category' => 'diagnostics',
                    'badge' => $order->type === 'laboratory' ? 'Laboratorium' : 'Radiologi',
                    'title' => 'Order '.$order->order_number,
                    'subtitle' => $order->patient->name.' • DPJP: '.$order->doctor->name,
                    'status' => $order->status,
                    'status_label' => $order->status === 'ordered' ? 'Sampel Masuk' : 'Sedang Diperiksa',
                    'time' => $order->created_at?->format('H:i') ?? '-',
                    'timestamp' => $order->created_at?->timestamp ?? 0,
                    'action_label' => 'Input Hasil',
                    'action_route' => route('diagnostics.orders.show', $order->id),
                    'action_icon' => 'microscope',
                ]);

            $feedItems = $feedItems->concat($diagOrders);
        }

        // E. Registration & Queue Items (waiting queues)
        if ($isRegistration) {
            $waitingQueues = Queue::whereDate('queue_date', $today)
                ->where('status', QueueStatus::Waiting)
                ->with(['encounter.patient:id,name,medical_record_number', 'unit:id,name'])
                ->orderBy('queue_number', 'asc')
                ->limit(8)
                ->get()
                ->map(fn ($q) => [
                    'id' => 'queue-'.$q->id,
                    'category' => 'registration',
                    'badge' => $q->unit->name,
                    'title' => 'Antrean '.$q->queue_code,
                    'subtitle' => ($q->encounter?->patient->name ?? 'Pasien').' • RM: '.($q->encounter?->patient->medical_record_number ?? '-'),
                    'status' => 'waiting',
                    'status_label' => 'Menunggu Panggilan',
                    'time' => $q->created_at?->format('H:i') ?? '-',
                    'timestamp' => $q->created_at?->timestamp ?? 0,
                    'action_label' => 'Papan Antrean',
                    'action_route' => route('registration.queues.board'),
                    'action_icon' => 'ticket',
                ]);

            $feedItems = $feedItems->concat($waitingQueues);
        }

        // F. Nurse / Inpatient Items (Active admitted patients)
        if ($isNurse) {
            $admissions = Admission::where('status', 'admitted')
                ->with(['patient:id,name,medical_record_number', 'doctor:id,name', 'currentAssignment.bed'])
                ->latest('admitted_at')
                ->limit(6)
                ->get()
                ->map(fn ($adm) => [
                    'id' => 'adm-'.$adm->id,
                    'category' => 'nurse',
                    'badge' => 'Rawat Inap',
                    'title' => $adm->patient->name.' ('.$adm->admission_number.')',
                    'subtitle' => ($adm->currentAssignment?->bed ? $adm->currentAssignment->bed->room_name.' - '.$adm->currentAssignment->bed->bed_number : 'Bed belum dialokasikan').' • DPJP: '.$adm->doctor->name,
                    'status' => $adm->status,
                    'status_label' => 'Dirawat',
                    'time' => $adm->admitted_at->format('d/m H:i'),
                    'timestamp' => $adm->admitted_at->timestamp,
                    'action_label' => 'Detail Admisi',
                    'action_route' => route('inpatient.admissions.show', $adm->id),
                    'action_icon' => 'bed',
                ]);

            $feedItems = $feedItems->concat($admissions);
        }

        // G. Auditor / Break-Glass Items
        if ($isExecutive) {
            $pendingBreakGlass = BreakGlassGrant::whereNull('reviewed_at')
                ->with(['patient:id,name,medical_record_number', 'user:id,name'])
                ->latest('granted_at')
                ->limit(5)
                ->get()
                ->map(fn ($bg) => [
                    'id' => 'bg-'.$bg->id,
                    'category' => 'audit',
                    'badge' => 'Break-Glass',
                    'title' => 'Akses Darurat: '.$bg->user->name,
                    'subtitle' => 'Pasien: '.$bg->patient->name.' • "'.$bg->reason.'"',
                    'status' => 'pending_review',
                    'status_label' => 'Perlu Review',
                    'time' => $bg->granted_at ? Carbon::parse($bg->granted_at)->format('H:i') : '-',
                    'timestamp' => $bg->granted_at ? Carbon::parse($bg->granted_at)->timestamp : 0,
                    'action_label' => 'Tinjau Audit',
                    'action_route' => route('rbac.break-glass.index'),
                    'action_icon' => 'shield',
                ]);

            $feedItems = $feedItems->concat($pendingBreakGlass);
        }

        // Sort all feed items by timestamp ascending (prioritas waktu datang / first-come)
        $actionFeed = $feedItems->sortBy('timestamp')->values()->all();

        // 3. Facility Snapshot (Bed occupancy, active doctors, and alerts)
        $bedClasses = Bed::selectRaw('class, count(*) as total, sum(case when status = "occupied" then 1 else 0 end) as occupied')
            ->groupBy('class')
            ->get()
            ->map(fn ($b) => [
                'class' => $b->class,
                'class_label' => match ($b->class) {
                    'vip' => 'Paviliun VIP',
                    'class_1' => 'Kelas I',
                    'class_2' => 'Kelas II',
                    'class_3' => 'Kelas III',
                    'icu' => 'ICU / ICCU',
                    default => ucfirst($b->class),
                },
                'total' => (int) $b->total,
                'occupied' => (int) $b->occupied,
                'available' => (int) $b->total - (int) $b->occupied,
                'percentage' => (int) $b->total > 0 ? round(((int) $b->occupied / (int) $b->total) * 100) : 0,
            ]);

        $activeDoctors = DoctorSchedule::where('day_of_week', $today->dayOfWeek)
            ->where('is_active', true)
            ->with(['doctor:id,name,specialization', 'unit:id,name'])
            ->limit(6)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'doctor_name' => $s->doctor->name,
                'specialization' => $s->doctor->specialization ?? 'Dokter Spesialis',
                'unit_name' => $s->unit->name,
                'time_range' => substr($s->start_time, 0, 5).' - '.substr($s->end_time, 0, 5),
                'quota' => $s->quota,
            ]);

        // Alerts (low stock, expiring drugs)
        $criticalAlerts = collect();
        if ($isPharmacist || $isExecutive) {
            $expiringBatches = DrugBatch::where('is_active', true)
                ->where('current_quantity', '>', 0)
                ->whereDate('expiry_date', '<=', $today->copy()->addDays(30))
                ->with('drug:id,name,code')
                ->limit(3)
                ->get()
                ->map(fn ($b) => [
                    'id' => 'exp-'.$b->id,
                    'type' => 'warning',
                    'message' => 'Batch '.$b->batch_number.' ('.$b->drug->name.') kedaluwarsa '.$b->expiry_date->format('d/m/Y'),
                ]);

            $lowStock = DrugBatch::where('is_active', true)
                ->where('current_quantity', '<=', 10)
                ->with('drug:id,name,code,unit_of_measure')
                ->limit(3)
                ->get()
                ->map(fn ($b) => [
                    'id' => 'low-'.$b->id,
                    'type' => 'critical',
                    'message' => 'Stok kritis '.$b->drug->name.' tersisa '.$b->current_quantity.' '.$b->drug->unit_of_measure,
                ]);

            $criticalAlerts = $criticalAlerts->concat($expiringBatches)->concat($lowStock);
        }

        return Inertia::render('dashboard/index', [
            'assignedRoles' => $userRoles,
            'isSuperAdmin' => $isSuperAdmin,
            'pipeline' => $pipeline,
            'actionFeed' => $actionFeed,
            'facilitySnapshot' => [
                'beds' => [
                    'total' => $totalBeds,
                    'occupied' => $occupiedBeds,
                    'available' => $totalBeds - $occupiedBeds,
                    'bor_percentage' => $borPercentage,
                    'classes' => $bedClasses,
                ],
                'active_doctors' => $activeDoctors,
                'alerts' => $criticalAlerts->values()->all(),
            ],
        ]);
    }
}
