import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';

import { PatientForm } from '../components/patient-form';
import type { Patient } from '../types/patient';

type Props = {
    patient: Patient;
};

export default function PatientEdit({ patient }: Props) {
    return (
        <>
            <Head title="Ubah pasien" />
            <PageHeader
                title="Ubah pasien"
                description={`Perbarui data ${patient.name}.`}
            />
            <PatientForm patient={patient} />
        </>
    );
}
