export type ProductType = 'drug' | 'medical_supply' | 'reagent' | 'general';

export type ProductTypeOption = {
    value: ProductType;
    label: string;
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    drug: 'Obat',
    medical_supply: 'Alkes & BMHP',
    reagent: 'Reagen & Penunjang',
    general: 'Produk Umum',
};

export type ProductCategory = {
    id: number;
    name: string;
    description: string | null;
};

export type Product = {
    id: number;
    code: string;
    name: string;
    product_type: ProductType;
    product_category_id: number;
    form: string | null;
    strength: string | null;
    unit_of_measure: string;
    price: number;
    manufacturer: string | null;
    description: string | null;
    image_path?: string | null;
    image_url?: string | null;
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
        product_id: number;
        batch_number: string;
        expiry_date: string;
        initial_quantity: number;
        current_quantity: number;
        buy_price: number;
        is_active: boolean;
        created_at: string;
        stock_quants?: Array<{
            id: number;
            stock_location_id: number;
            quantity: number;
            location?: {
                id: number;
                code: string;
                name: string;
            } | null;
        }>;
    }>;
    stock_quants?: Array<{
        id: number;
        stock_location_id: number;
        product_id: number;
        product_batch_id: number;
        quantity: number;
        location?: {
            id: number;
            code: string;
            name: string;
            usage: string;
        } | null;
        product_batch?: {
            id: number;
            batch_number: string;
            expiry_date: string;
            buy_price: number;
        } | null;
    }>;
    valuation_layers?: Array<{
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
            type: string;
        } | null;
        user?: {
            id: number;
            name: string;
        } | null;
    }>;
    stock_movements?: Array<{
        id: number;
        reference_number?: string | null;
        product_id: number;
        product_batch_id: number | null;
        type:
            | 'in'
            | 'out'
            | 'transfer'
            | 'dispensing'
            | 'adjustment'
            | 'return'
            | 'opname';
        quantity: number;
        balance_before: number;
        balance_after: number;
        unit_cost?: number;
        total_value?: number;
        origin?: string | null;
        reason: string | null;
        created_at: string;
        product_batch?: {
            id: number;
            batch_number: string;
        };
        source_location?: {
            id: number;
            code: string;
            name: string;
        } | null;
        destination_location?: {
            id: number;
            code: string;
            name: string;
        } | null;
        user?: {
            id: number;
            name: string;
        };
    }>;
};

export type ProductFilters = {
    search?: string;
    product_type?: string;
    category_id?: string;
    status?: string;
};

export type ProductInput = {
    code: string;
    name: string;
    product_type: ProductType;
    product_category_id: number | '';
    form: string;
    strength: string;
    unit_of_measure: string;
    price: number | '';
    manufacturer: string;
    description: string;
    image: File | null;
    remove_image: boolean;
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

export const commonProductUnits = [
    'Pcs',
    'Box',
    'Pack',
    'Unit',
    'Set',
    'Roll',
    'Tablet',
    'Kapsul',
    'Kaplet',
    'Botol',
    'Tube',
    'Ampul',
    'Vial',
    'Strip',
    'Sachet',
    'Kit',
];

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
