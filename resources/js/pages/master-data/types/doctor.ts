export type Doctor = {
    id: number;
    code: string;
    name: string;
    specialization: string | null;
    license_number: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type DoctorInput = {
    code: string;
    name: string;
    specialization: string;
    license_number: string;
    phone: string;
    email: string;
    is_active: boolean;
};

export type DoctorFilters = {
    search: string;
    status: string;
};

export type UnitOption = {
    id: number;
    name: string;
};

export type DoctorSchedule = {
    id: number;
    doctor_id: number;
    unit_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    quota: number | null;
    is_active: boolean;
    unit: UnitOption;
};

export type DoctorScheduleInput = {
    unit_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    quota: string;
};

export const dayOptions: { value: number; label: string }[] = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
    { value: 7, label: 'Minggu' },
];

export const dayLabels = Object.fromEntries(
    dayOptions.map((option) => [option.value, option.label]),
) as Record<number, string>;

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
