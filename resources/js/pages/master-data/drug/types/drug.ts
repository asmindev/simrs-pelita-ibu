export type DrugCategory = {
    id: number;
    name: string;
    description: string | null;
};

export type Drug = {
    id: number;
    code: string;
    name: string;
    drug_category_id: number;
    form: string;
    strength: string;
    unit_of_measure: string;
    price: number;
    manufacturer: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
        description?: string | null;
    };
    batches?: Array<{
        id: number;
        drug_id: number;
        batch_number: string;
        expiry_date: string;
        initial_quantity: number;
        current_quantity: number;
        buy_price: number;
        is_active: boolean;
        created_at: string;
    }>;
    stock_movements?: Array<{
        id: number;
        drug_id: number;
        drug_batch_id: number | null;
        type: 'in' | 'out' | 'dispensing' | 'adjustment' | 'return' | 'opname';
        quantity: number;
        balance_before: number;
        balance_after: number;
        reason: string | null;
        created_at: string;
        drug_batch?: {
            id: number;
            batch_number: string;
        };
        user?: {
            id: number;
            name: string;
        };
    }>;
};

export type DrugFilters = {
    search?: string;
    category_id?: string;
    status?: string;
};

export type DrugInput = {
    code: string;
    name: string;
    drug_category_id: number | '';
    form: string;
    strength: string;
    unit_of_measure: string;
    price: number | '';
    manufacturer: string;
    is_active: boolean;
};

export const commonDrugForms = [
    'Tablet',
    'Kapsul',
    'Kaplet',
    'Sirup',
    'Suspensi',
    'Salep',
    'Krim',
    'Gel',
    'Injeksi',
    'Infus',
    'Tetes Mata',
    'Tetes Telinga',
    'Inhaler',
    'Suppositoria',
    'Serbuk',
];

export const commonDrugUnits = [
    'Tablet',
    'Kapsul',
    'Kaplet',
    'Botol',
    'Tube',
    'Ampul',
    'Vial',
    'Strip',
    'Sachet',
    'Pcs',
];

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
