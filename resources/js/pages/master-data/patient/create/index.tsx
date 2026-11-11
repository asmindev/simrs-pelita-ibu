import { Head } from '@inertiajs/react';

import { PatientForm } from '../components/patient-form';

export default function PatientCreate() {
    return (
        <div className="space-y-4">
            <Head title="Tambah Pasien — SIMRS" />
            <PatientForm />
        </div>
    );
}
