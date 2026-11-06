import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';

import { UnitForm } from '../components/unit-form';

export default function UnitCreate() {
    return (
        <>
            <Head title="Tambah unit" />
            <PageHeader
                title="Tambah unit"
                description="Daftarkan unit kerja baru."
            />
            <UnitForm />
        </>
    );
}
