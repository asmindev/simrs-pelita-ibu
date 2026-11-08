export type DiagnosticOrderType = 'laboratory' | 'radiology';
export type DiagnosticOrderStatus =
    | 'ordered'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export type DiagnosticOrderItem = {
    id: number;
    diagnostic_order_id: number;
    tariff_id: number | null;
    test_name: string;
    status: 'pending' | 'completed';
    notes: string | null;
    results?: DiagnosticResult[];
};

export type DiagnosticResult = {
    id: number;
    diagnostic_order_id: number;
    diagnostic_order_item_id: number | null;
    parameter_name: string;
    result_value: string;
    reference_range: string | null;
    unit: string | null;
    is_critical: boolean;
    interpretation: string | null;
    attachment_path: string | null;
    performed_at: string;
    performed_by?: {
        id: number;
        name: string;
    };
};

export type DiagnosticOrder = {
    id: number;
    order_number: string;
    encounter_id: number;
    patient_id: number;
    doctor_id: number;
    unit_id: number | null;
    type: DiagnosticOrderType;
    status: DiagnosticOrderStatus;
    clinical_notes: string | null;
    completed_at: string | null;
    created_at: string;
    patient?: {
        id: number;
        name: string;
        medical_record_number: string;
        gender: string;
        birth_date: string;
    };
    doctor?: {
        id: number;
        name: string;
    };
    unit?: {
        id: number;
        name: string;
    };
    encounter?: {
        id: number;
        encounter_number: string;
    };
    items?: DiagnosticOrderItem[];
    results?: DiagnosticResult[];
    completed_by?: {
        id: number;
        name: string;
    };
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
