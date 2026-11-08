export interface RoleOption {
    key: string;
    label: string;
}

export interface DoctorMetrics {
    waiting_count: number;
    in_consultation_count: number;
    finished_today_count: number;
    doctor_name: string;
}

export interface DoctorPatientQueueItem {
    id: number;
    encounter_number: string;
    patient_name: string;
    patient_mrn: string;
    unit_name: string;
    queue_code: string;
    status: string;
    status_label: string;
    arrived_at: string;
}

export interface DoctorDiagnosticItem {
    id: number;
    order_number: string;
    patient_name: string;
    patient_mrn: string;
    type: string;
    completed_at: string;
}

export interface RegistrationMetrics {
    total_encounters: number;
    outpatient_count: number;
    emergency_count: number;
    new_patients_today: number;
}

export interface RegistrationQueueUnit {
    id: number;
    unit_name: string;
    waiting: number;
    serving: number;
    total: number;
}

export interface RegistrationEncounterItem {
    id: number;
    encounter_number: string;
    patient_name: string;
    patient_mrn: string;
    unit_name: string;
    doctor_name: string;
    type: string;
    status: string;
    arrived_at: string;
}

export interface RegistrationActiveDoctor {
    id: number;
    doctor_name: string;
    specialization: string;
    unit_name: string;
    schedule_time: string;
    quota: number | null;
}

export interface PharmacyMetrics {
    submitted_count: number;
    verified_count: number;
    dispensed_today_count: number;
    low_stock_drugs_count: number;
    expiring_batches_count: number;
}

export interface PharmacyPrescriptionItem {
    id: number;
    prescription_number: string;
    patient_name: string;
    patient_mrn: string;
    doctor_name: string;
    unit_name: string;
    items_count: number;
    status: string;
    created_at: string;
}

export interface PharmacyCriticalDrug {
    id: number;
    code: string;
    name: string;
    current_stock: number;
    min_stock: number;
    unit_of_measure: string;
}

export interface CashierMetrics {
    pending_invoices_count: number;
    paid_today_count: number;
    today_revenue: number;
    total_pending_amount: number;
}

export interface CashierInvoiceItem {
    id: number;
    invoice_number: string;
    patient_name: string;
    patient_mrn: string;
    guarantor_name: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    created_at: string;
}

export interface CashierPaymentMethodBreakdown {
    method: string;
    total: number;
    count: number;
}

export interface NurseMetrics {
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    bor_percentage: number;
    today_admissions: number;
    active_inpatients_count: number;
}

export interface NurseBedClassSummary {
    class: string;
    total: number;
    occupied: number;
    available: number;
}

export interface NurseInpatientItem {
    id: number;
    admission_number: string;
    patient_name: string;
    patient_mrn: string;
    doctor_name: string;
    admitted_at: string;
    initial_diagnosis: string;
}

export interface DiagnosticsMetrics {
    pending_lab_orders: number;
    pending_rad_orders: number;
    in_progress_orders: number;
    completed_today: number;
}

export interface DiagnosticsOrderItem {
    id: number;
    order_number: string;
    type: string;
    patient_name: string;
    patient_mrn: string;
    doctor_name: string;
    status: string;
    created_at: string;
}

export interface ExecutiveMetrics {
    total_encounters_today: number;
    total_admitted_patients: number;
    bor_percentage: number;
    occupied_beds: number;
    total_beds: number;
    today_revenue: number;
    pending_break_glass: number;
    pending_prescriptions: number;
    pending_diagnostics: number;
}

export interface ExecutiveEncounterItem {
    id: number;
    encounter_number: string;
    patient_name: string;
    patient_mrn: string;
    unit_name: string;
    doctor_name: string;
    type: string;
    status: string;
    status_label: string;
    arrived_at: string;
}

export interface ExecutiveAuditLogItem {
    id: number;
    description: string;
    causer_name: string;
    created_at: string;
}
