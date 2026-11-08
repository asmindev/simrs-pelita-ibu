export type ActivityLog = {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: Record<string, unknown> | null;
    created_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    subject?: {
        id: number;
        name?: string;
        [key: string]: unknown;
    } | null;
};

export type PatientAccessLog = {
    id: number;
    user_id: number | null;
    patient_id: number;
    unit_id: number | null;
    action: string;
    context: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    accessed_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
    patient?: {
        id: number;
        name: string;
        medical_record_number: string;
    } | null;
    unit?: {
        id: number;
        name: string;
        code: string;
    } | null;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
