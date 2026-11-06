import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';

import { PatientForm } from '../components/patient-form';

export default function PatientCreate() {
    return (
        <>
            <Head title="Tambah pasien" />
            <PageHeader
                title="Tambah pasien"
                description="Daftarkan identitas pasien baru."
            />
            <PatientForm />
        </>
    );
}
