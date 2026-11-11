import { Head } from '@inertiajs/react';

import type { PatientSearchResult } from '@/shared/types/patient';

import { EncounterForm } from './components/encounter-form';

type UnitOption = {
    id: number;
    name: string;
    code: string;
    type?: string;
};

type DoctorOption = {
    id: number;
    name: string;
    code?: string;
    specialization?: string | null;
    schedules?: Array<{
        day_of_week: number;
        start_time: string;
        end_time: string;
        unit?: { id: number; name: string };
    }>;
};

type GuarantorOption = {
    id: number;
    name: string;
    code: string;
    type: string;
};

type TypeOption = {
    value: string;
    label: string;
};

type Props = {
    units: UnitOption[];
    doctors: DoctorOption[];
    guarantors: GuarantorOption[];
    types: TypeOption[];
    preselectedPatient?: PatientSearchResult | null;
};

export default function EncounterCreate({
    units,
    doctors,
    guarantors,
    types,
    preselectedPatient,
}: Props) {
    return (
        <div className="space-y-4">
            <Head title="Pendaftaran Kunjungan Baru — SIMRS" />

            <EncounterForm
                units={units}
                doctors={doctors}
                guarantors={guarantors}
                types={types}
                preselectedPatient={preselectedPatient}
            />
        </div>
    );
}
