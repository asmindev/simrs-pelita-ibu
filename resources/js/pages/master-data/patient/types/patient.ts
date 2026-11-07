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
    merged_to_patient_id?: number | null;
    merged_at?: string | null;
    merged_to?: Pick<Patient, 'id' | 'name' | 'medical_record_number'> | null;
    merged_from?: Array<
        Pick<Patient, 'id' | 'name' | 'medical_record_number'> & {
            merged_at: string;
        }
    >;
    created_at: string;
    updated_at: string;
};

export type PatientSearchResult = {
    id: number;
    medical_record_number: string;
    nik: string | null;
    name: string;
    gender: PatientGender;
    birth_date: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    merged_to_patient_id: number | null;
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
