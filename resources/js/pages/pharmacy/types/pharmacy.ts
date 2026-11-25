export type StockLocationUsage =
    | 'internal'
    | 'supplier'
    | 'customer'
    | 'inventory';

export type StockLocation = {
    id: number;
    code: string;
    name: string;
    usage: StockLocationUsage;
    is_default_warehouse: boolean;
};

export type ProductBatchSummary = {
    id: number;
    product_id: number;
    batch_number: string;
    expiry_date: string;
    current_quantity: number;
    buy_price: number;
};

export type ProductInfo = {
    id: number;
    code: string;
    name: string;
    product_type?: 'drug' | 'medical_supply' | 'reagent' | 'general';
    form: string | null;
    unit_of_measure: string;
    price?: number;
    category?: {
        id: number;
        name: string;
    };
    batches?: ProductBatchSummary[];
};

export type StockQuant = {
    id: number;
    stock_location_id: number;
    product_id: number;
    product_batch_id: number;
    quantity: number;
    location?: StockLocation;
    product?: ProductInfo;
    product_batch?: ProductBatch;
};

export type ProductBatch = {
    id: number;
    product_id: number;
    batch_number: string;
    expiry_date: string;
    initial_quantity: number;
    current_quantity: number;
    buy_price: number;
    is_active: boolean;
    created_at: string;
    product?: ProductInfo;
    stock_quants?: StockQuant[];
};

export type DispensingRecord = {
    id: number;
    prescription_id: number;
    prescription_item_id: number;
    product_batch_id: number;
    quantity: number;
    dispensed_by: number;
    dispensed_at: string;
    notes: string | null;
    product_batch?: ProductBatch;
    dispenser?: {
        id: number;
        name: string;
    };
};

export type StockReturnRecord = {
    id: number;
    prescription_id: number;
    prescription_item_id: number;
    product_batch_id: number;
    quantity: number;
    return_reason: string;
    returned_by: number;
    returned_at: string;
    product_batch?: ProductBatch;
    returned_by_user?: {
        id: number;
        name: string;
    };
};

export type PrescriptionItem = {
    id: number;
    prescription_id: number;
    product_id: number;
    dosage: string;
    frequency: string;
    route: string;
    duration_days: number | null;
    quantity: number;
    dispensed_quantity: number;
    instructions: string | null;
    status: 'pending' | 'dispensed' | 'cancelled';
    product?: ProductInfo;
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

export type StockMovementType =
    | 'in'
    | 'out'
    | 'transfer'
    | 'dispensing'
    | 'adjustment'
    | 'return'
    | 'opname';

export type StockMovement = {
    id: number;
    reference_number: string | null;
    product_id: number;
    product_batch_id: number | null;
    source_location_id: number | null;
    destination_location_id: number | null;
    type: StockMovementType;
    quantity: number;
    balance_before: number;
    balance_after: number;
    unit_cost: number;
    total_value: number;
    origin: string | null;
    state: string;
    reason: string | null;
    created_at: string;
    product?: {
        id: number;
        name: string;
        code: string;
        unit_of_measure?: string;
    };
    product_batch?: {
        id: number;
        batch_number: string;
    };
    source_location?: {
        id: number;
        code: string;
        name: string;
        usage?: StockLocationUsage;
    } | null;
    destination_location?: {
        id: number;
        code: string;
        name: string;
        usage?: StockLocationUsage;
    } | null;
    user?: {
        id: number;
        name: string;
    };
};

export type StockValuationLayer = {
    id: number;
    product_id: number;
    product_batch_id: number | null;
    stock_movement_id: number;
    stock_location_id: number | null;
    quantity: number;
    remaining_qty: number;
    unit_cost: number;
    value: number;
    remaining_value: number;
    reference: string | null;
    description: string | null;
    created_at: string;
    product?: {
        id: number;
        name: string;
        code: string;
        unit_of_measure?: string;
    };
    product_batch?: {
        id: number;
        batch_number: string;
    } | null;
    location?: {
        id: number;
        code: string;
        name: string;
    } | null;
    stock_movement?: {
        id: number;
        reference_number: string | null;
        type: StockMovementType;
    } | null;
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
