export type UnitType =
    | 'outpatient'
    | 'inpatient'
    | 'emergency'
    | 'laboratory'
    | 'radiology'
    | 'pharmacy'
    | 'other';

export const unitTypeOptions: { value: UnitType; label: string }[] = [
    { value: 'outpatient', label: 'Rawat Jalan' },
    { value: 'inpatient', label: 'Rawat Inap' },
    { value: 'emergency', label: 'Gawat Darurat' },
    { value: 'laboratory', label: 'Laboratorium' },
    { value: 'radiology', label: 'Radiologi' },
    { value: 'pharmacy', label: 'Farmasi' },
    { value: 'other', label: 'Lainnya' },
];

export const unitTypeLabels = Object.fromEntries(
    unitTypeOptions.map((option) => [option.value, option.label]),
) as Record<UnitType, string>;

export type Unit = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    type: UnitType;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type UnitInput = {
    code: string;
    name: string;
    description: string;
    type: UnitType;
    is_active: boolean;
};

export type UnitFilters = {
    search: string;
    type: string;
    status: string;
};

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
