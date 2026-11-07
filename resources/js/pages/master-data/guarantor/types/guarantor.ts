export type GuarantorType = 'bpjs' | 'general' | 'insurance' | 'company';

export const guarantorTypeOptions: { value: GuarantorType; label: string }[] = [
    { value: 'bpjs', label: 'BPJS Kesehatan' },
    { value: 'general', label: 'Umum / Pribadi' },
    { value: 'insurance', label: 'Asuransi Swasta' },
    { value: 'company', label: 'Perusahaan' },
];

export const guarantorTypeLabels = Object.fromEntries(
    guarantorTypeOptions.map((option) => [option.value, option.label]),
) as Record<GuarantorType, string>;

export type Guarantor = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    type: GuarantorType;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type GuarantorInput = {
    code: string;
    name: string;
    description: string;
    type: GuarantorType;
    is_active: boolean;
};

export type GuarantorFilters = {
    search: string;
    type: string;
    status: string;
};

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
