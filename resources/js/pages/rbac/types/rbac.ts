export type Role = {
    id: number;
    name: string;
    guard_name: string;
    permissions?: Array<{ id: number; name: string }>;
    users_count?: number;
    created_at?: string;
};

export type Unit = {
    id: number;
    name: string;
    code: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    roles?: Role[];
    units?: Unit[];
    created_at: string;
    updated_at: string;
};

export type PermissionItem = {
    name: string;
    resource: string;
    action: string;
};

export type GroupedPermission = {
    domain: string;
    label: string;
    permissions: PermissionItem[];
};

export type BreakGlassGrant = {
    id: number;
    user_id: number;
    patient_id: number;
    reason: string;
    granted_at: string;
    expires_at: string;
    revoked_at: string | null;
    reviewed_by_id: number | null;
    reviewed_at: string | null;
    review_notes: string | null;
    created_at: string;
    user?: User;
    patient?: {
        id: number;
        name: string;
        medical_record_number: string;
        gender: 'male' | 'female';
    };
    reviewed_by?: User;
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
