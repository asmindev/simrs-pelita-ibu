export type DrugInfo = {
    id: number;
    code: string;
    name: string;
    form: string;
    unit_of_measure: string;
    price?: number;
    category?: {
        id: number;
        name: string;
    };
    batches?: DrugBatch[];
};

export type DrugBatch = {
    id: number;
    drug_id: number;
    batch_number: string;
    expiry_date: string;
    initial_quantity: number;
    current_quantity: number;
    buy_price: number;
    is_active: boolean;
    created_at: string;
    drug?: DrugInfo;
};

export type DispensingRecord = {
    id: number;
    prescription_id: number;
    prescription_item_id: number;
    drug_batch_id: number;
    quantity: number;
    dispensed_by: number;
    dispensed_at: string;
    notes: string | null;
    drug_batch?: DrugBatch;
    dispenser?: {
        id: number;
        name: string;
    };
};

export type StockReturnRecord = {
    id: number;
    prescription_id: number;
    prescription_item_id: number;
    drug_batch_id: number;
    quantity: number;
    return_reason: string;
    returned_by: number;
    returned_at: string;
    drug_batch?: DrugBatch;
    returned_by_user?: {
        id: number;
        name: string;
    };
};

export type PrescriptionItem = {
    id: number;
    prescription_id: number;
    drug_id: number;
    dosage: string;
    frequency: string;
    route: string;
    duration_days: number | null;
    quantity: number;
    dispensed_quantity: number;
    instructions: string | null;
    status: 'pending' | 'dispensed' | 'cancelled';
    drug?: DrugInfo;
    dispensings?: DispensingRecord[];
};

export type PrescriptionStatus =
    | 'draft'
    | 'submitted'
    | 'verified'
    | 'dispensed'
    | 'cancelled';

export type Prescription = {
    id: number;
    prescription_number: string;
    encounter_id: number;
    patient_id: number;
    doctor_id: number;
    unit_id: number;
    status: PrescriptionStatus;
    notes: string | null;
    verification_notes: string | null;
    pharmacist_id: number | null;
    verified_at: string | null;
    dispensed_at: string | null;
    cancelled_at: string | null;
    cancel_reason: string | null;
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
        code?: string;
    };
    pharmacist?: {
        id: number;
        name: string;
    };
    encounter?: {
        id: number;
        encounter_number: string;
        queue?: {
            queue_code: string;
        };
    };
    items?: PrescriptionItem[];
    returns?: StockReturnRecord[];
};

export type StockMovement = {
    id: number;
    drug_id: number;
    drug_batch_id: number | null;
    type: 'in' | 'out' | 'dispensing' | 'adjustment' | 'return' | 'opname';
    quantity: number;
    balance_before: number;
    balance_after: number;
    reason: string | null;
    created_at: string;
    drug?: {
        id: number;
        name: string;
        code: string;
    };
    drug_batch?: {
        id: number;
        batch_number: string;
    };
    user?: {
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
