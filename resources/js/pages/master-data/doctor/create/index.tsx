import { Head } from '@inertiajs/react';

import { DoctorForm } from '../components/doctor-form';

export default function DoctorCreate() {
    return (
        <div className="space-y-4">
            <Head title="Tambah Dokter — SIMRS" />
            <DoctorForm />
        </div>
    );
}
