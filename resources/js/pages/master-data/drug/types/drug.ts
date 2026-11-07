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
    };
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
