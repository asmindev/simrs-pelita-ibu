export type InvoiceStatus =
    | 'draft'
    | 'finalized'
    | 'partially_paid'
    | 'paid'
    | 'voided';

export type InvoiceItem = {
    id: number;
    invoice_id: number;
    item_type: 'registration' | 'consultation' | 'tariff' | 'drug' | 'other';
    reference_id: number | null;
    name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
    discount_amount: number;
    total: number;
    notes: string | null;
};

export type Payment = {
    id: number;
    invoice_id: number;
    payment_number: string;
    method:
        | 'cash'
        | 'debit_card'
        | 'credit_card'
        | 'bank_transfer'
        | 'qris'
        | 'insurance';
    amount: number;
    change_amount: number;
    reference_number: string | null;
    notes: string | null;
    paid_at: string;
    received_by?: {
        id: number;
        name: string;
    };
};

export type Refund = {
    id: number;
    invoice_id: number;
    payment_id: number | null;
    refund_number: string;
    amount: number;
    reason: string;
    processed_at: string;
    approved_by?: {
        id: number;
        name: string;
    };
};

export type Invoice = {
    id: number;
    invoice_number: string;
    encounter_id: number;
    patient_id: number;
    guarantor_id: number | null;
    status: InvoiceStatus;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    notes: string | null;
    finalized_at: string | null;
    voided_at: string | null;
    void_reason: string | null;
    created_at: string;
    patient?: {
        id: number;
        name: string;
        medical_record_number: string;
        nik: string;
        gender: string;
        phone: string | null;
    };
    encounter?: {
        id: number;
        encounter_number: string;
        unit?: {
            id: number;
            name: string;
        };
        doctor?: {
            id: number;
            name: string;
        };
    };
    guarantor?: {
        id: number;
        name: string;
        type: string;
    };
    items?: InvoiceItem[];
    payments?: Payment[];
    refunds?: Refund[];
    finalized_by?: {
        id: number;
        name: string;
    };
    voided_by?: {
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
