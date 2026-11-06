import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';

import { DoctorForm } from '../components/doctor-form';

export default function DoctorCreate() {
    return (
        <>
            <Head title="Tambah dokter" />
            <PageHeader
                title="Tambah dokter"
                description="Daftarkan profil dokter baru."
            />
            <DoctorForm />
        </>
    );
}
