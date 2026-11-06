export type PatientGender = 'male' | 'female';

export type Patient = {
    id: number;
    medical_record_number: string;
    nik: string | null;
    name: string;
    gender: PatientGender;
    birth_date: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type PatientInput = {
    medical_record_number: string;
    nik: string;
    name: string;
    gender: PatientGender;
    birth_date: string;
    address: string;
    phone: string;
    is_active: boolean;
};

export type PatientFilters = {
    search: string;
    status: string;
};

export type PatientDuplicate = Pick<
    Patient,
    | 'id'
    | 'medical_record_number'
    | 'nik'
    | 'name'
    | 'gender'
    | 'birth_date'
    | 'is_active'
>;

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
