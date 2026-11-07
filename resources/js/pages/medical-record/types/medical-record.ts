import type { Paginated } from '@/shared/types/pagination';

export type AssessmentType = 'initial' | 'soap' | 'triage' | 'nursing';
export type DiagnosisType = 'primary' | 'secondary';
export type SensitiveCategory =
    | 'psychiatry'
    | 'hiv'
    | 'substance_use'
    | 'domestic_violence'
    | 'other';
export type ClinicalReportType = 'surgery' | 'birth' | 'death';

export type VitalSigns = {
    systolic?: number | string | null;
    diastolic?: number | string | null;
    heart_rate?: number | string | null;
    respiratory_rate?: number | string | null;
    temperature?: number | string | null;
    spo2?: number | string | null;
    weight?: number | string | null;
    height?: number | string | null;
};

export type RecordAddendum = {
    id: number;
    assessment_id: number;
    reason: string;
    content: string;
    created_by: number;
    created_at: string;
    created_by_user?: { id: number; name: string } | null;
};

export type Assessment = {
    id: number;
    encounter_id: number;
    patient_id: number;
    created_by: number;
    type: AssessmentType;
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
    vital_signs: VitalSigns | null;
    triage_level: string | null;
    allergies: string | null;
    is_final: boolean;
    finalized_at: string | null;
    finalized_by: number | null;
    created_at: string;
    updated_at: string;
    created_by_user?: { id: number; name: string } | null;
    finalized_by_user?: { id: number; name: string } | null;
    addenda?: RecordAddendum[];
};

export type Diagnosis = {
    id: number;
    encounter_id: number;
    patient_id: number;
    icd10_code: string;
    icd10_name: string;
    type: DiagnosisType;
    notes: string | null;
    created_by: number;
    created_at: string;
    created_by_user?: { id: number; name: string } | null;
};

export type Procedure = {
    id: number;
    encounter_id: number;
    patient_id: number;
    icd9_code: string | null;
    name: string;
    notes: string | null;
    performed_by: number | null;
    created_by: number;
    created_at: string;
    performed_by_doctor?: { id: number; name: string } | null;
    created_by_user?: { id: number; name: string } | null;
};

export type SensitiveNote = {
    id: number;
    encounter_id: number;
    patient_id: number;
    category: SensitiveCategory;
    content: string;
    created_by: number;
    created_at: string;
    created_by_user?: { id: number; name: string } | null;
};

export type ClinicalReport = {
    id: number;
    encounter_id: number;
    patient_id: number;
    report_type: ClinicalReportType;
    title: string;
    content: string;
    reported_at: string;
    doctor_id: number | null;
    created_by: number;
    created_at: string;
    doctor?: { id: number; name: string } | null;
    patient?: {
        id: number;
        medical_record_number: string;
        name: string;
        birth_date: string;
        gender: string;
    };
    encounter?: {
        id: number;
        encounter_number: string;
        unit_id: number;
        unit?: { id: number; name: string; code: string };
    };
    created_by_user?: { id: number; name: string } | null;
};

export type EncounterWithEmr = {
    id: number;
    encounter_number: string;
    patient_id: number;
    unit_id: number;
    doctor_id: number | null;
    type: string;
    status: string;
    guarantor_id: number;
    arrived_at: string;
    notes: string | null;
    can_view_sensitive: boolean;
    patient?: {
        id: number;
        medical_record_number: string;
        nik: string | null;
        name: string;
        gender: string;
        birth_date: string;
        address?: string | null;
        phone?: string | null;
    };
    unit?: {
        id: number;
        name: string;
        code: string;
    };
    doctor?: {
        id: number;
        name: string;
    } | null;
    guarantor?: {
        id: number;
        name: string;
        type?: string;
    };
    queue?: {
        id: number;
        queue_code: string;
        queue_number: number;
        status: string;
    } | null;
    assessments?: Assessment[];
    diagnoses?: Diagnosis[];
    procedures?: Procedure[];
    sensitive_notes?: SensitiveNote[];
    clinical_reports?: ClinicalReport[];
};

export type PaginatedEncounters = Paginated<EncounterWithEmr>;
export type PaginatedReports = Paginated<ClinicalReport>;
