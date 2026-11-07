import type { Paginated } from '@/shared/types/pagination';

export type EncounterType = 'outpatient' | 'emergency';
export type EncounterStatus =
    | 'arrived'
    | 'in_consultation'
    | 'finished'
    | 'cancelled';

export type QueueStatus =
    | 'waiting'
    | 'calling'
    | 'serving'
    | 'completed'
    | 'skipped'
    | 'cancelled';

export type Queue = {
    id: number;
    encounter_id: number;
    unit_id: number;
    queue_date: string;
    queue_number: number;
    queue_code: string;
    status: QueueStatus;
    called_at: string | null;
    served_at: string | null;
    completed_at: string | null;
    called_by?: { id: number; name: string } | null;
    encounter?: Encounter;
    unit?: { id: number; name: string; code: string };
};

export type InsuranceCoverage = {
    id: number;
    encounter_id: number;
    guarantor_id: number;
    card_number: string | null;
    claim_number: string | null;
    notes: string | null;
};

export type Encounter = {
    id: number;
    encounter_number: string;
    patient_id: number;
    unit_id: number;
    doctor_id: number | null;
    type: EncounterType;
    status: EncounterStatus;
    guarantor_id: number;
    arrived_at: string;
    consultation_started_at: string | null;
    consultation_ended_at: string | null;
    cancellation_reason: string | null;
    cancelled_at: string | null;
    notes: string | null;
    patient?: {
        id: number;
        medical_record_number: string;
        nik: string | null;
        name: string;
        gender: 'male' | 'female';
        birth_date: string;
    };
    unit?: {
        id: number;
        name: string;
        code: string;
        type?: string;
    };
    doctor?: {
        id: number;
        name: string;
        code?: string;
        specialization?: string | null;
    } | null;
    guarantor?: {
        id: number;
        name: string;
        type?: string;
    };
    queue?: Queue | null;
    insurance_coverage?: InsuranceCoverage | null;
    cancelled_by?: { id: number; name: string } | null;
    created_by?: { id: number; name: string } | null;
};

export type EncounterFilters = {
    search: string;
    status: string;
    unit_id: number | null;
    date: string;
};

export type UnitSummary = {
    id: number;
    name: string;
    code: string;
    type: string;
    total_today: number;
    waiting_count: number;
    calling_count: number;
    serving_count: number;
    completed_count: number;
};

export type RegistrationMetrics = {
    total_encounters_today: number;
    active_encounters_today: number;
    completed_today: number;
};

export type PaginatedEncounters = Paginated<Encounter>;
