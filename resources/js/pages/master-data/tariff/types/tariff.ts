export type TariffCategory =
    | 'consultation'
    | 'procedure'
    | 'laboratory'
    | 'radiology'
    | 'administration'
    | 'other';

export const tariffCategoryOptions: { value: TariffCategory; label: string }[] =
    [
        { value: 'consultation', label: 'Konsultasi' },
        { value: 'procedure', label: 'Tindakan Medis' },
        { value: 'laboratory', label: 'Laboratorium' },
        { value: 'radiology', label: 'Radiologi' },
        { value: 'administration', label: 'Administrasi' },
        { value: 'other', label: 'Lainnya' },
    ];

export const tariffCategoryLabels = Object.fromEntries(
    tariffCategoryOptions.map((option) => [option.value, option.label]),
) as Record<TariffCategory, string>;

export type UnitOption = {
    id: number;
    code: string;
    name: string;
};

export type Tariff = {
    id: number;
    code: string;
    name: string;
    category: TariffCategory;
    price: number;
    unit_id: number | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    unit?: UnitOption | null;
};

export type TariffInput = {
    code: string;
    name: string;
    category: TariffCategory;
    price: number | '';
    unit_id: number | null;
    description: string;
    is_active: boolean;
};

export type TariffFilters = {
    search: string;
    category: string;
    unit_id: string;
    status: string;
};

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
