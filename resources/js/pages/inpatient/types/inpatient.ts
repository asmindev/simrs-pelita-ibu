export type BedClass = 'vip' | 'class_1' | 'class_2' | 'class_3' | 'icu';

export type BedStatus = 'available' | 'occupied' | 'maintenance';

export type AdmissionStatus = 'active' | 'discharged' | 'transferred';

export type DailyNoteType = 'nurse' | 'doctor_visit';

export interface Bed {
    id: number;
    room_name: string;
    bed_number: string;
    class: BedClass;
    status: BedStatus;
    daily_rate: number;
    notes?: string | null;
    created_at?: string;
    current_assignment?: BedAssignment | null;
}

export interface BedAssignment {
    id: number;
    admission_id: number;
    bed_id: number;
    assigned_at: string;
    released_at: string | null;
    assigned_by: number;
    reason: string | null;
    bed?: Bed;
    assigned_by_user?: { id: number; name: string } | null;
    admission?: Admission | null;
}

export interface VitalSigns {
    blood_pressure?: string;
    heart_rate?: string;
    respiratory_rate?: string;
    temperature?: string;
    oxygen_saturation?: string;
}

export interface InpatientDailyNote {
    id: number;
    admission_id: number;
    author_id: number;
    note_type: DailyNoteType;
    vital_signs?: VitalSigns | null;
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
    created_at: string;
    author?: { id: number; name: string } | null;
}

export interface AdmissionPatient {
    id: number;
    name: string;
    medical_record_number: string;
    nik?: string;
    gender?: 'male' | 'female';
    birth_date?: string;
}

export interface AdmissionDoctor {
    id: number;
    name?: string;
    user?: { name: string };
}

export interface AdmissionEncounter {
    id: number;
    encounter_number: string;
    patient?: AdmissionPatient;
    doctor?: AdmissionDoctor;
}

export interface Admission {
    id: number;
    admission_number: string;
    encounter_id: number;
    patient_id: number;
    doctor_id: number;
    admitted_at: string;
    discharged_at: string | null;
    initial_diagnosis: string | null;
    discharge_diagnosis: string | null;
    discharge_summary: string | null;
    status: AdmissionStatus;
    created_at: string;
    patient?: AdmissionPatient;
    doctor?: AdmissionDoctor;
    encounter?: AdmissionEncounter;
    current_assignment?: BedAssignment | null;
    assignments?: BedAssignment[];
    daily_notes?: InpatientDailyNote[];
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
