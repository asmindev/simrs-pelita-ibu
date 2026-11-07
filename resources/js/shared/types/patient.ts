export type PatientSearchResult = {
    id: number;
    medical_record_number: string;
    nik: string | null;
    name: string;
    gender: 'male' | 'female';
    birth_date: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    merged_to_patient_id: number | null;
};
