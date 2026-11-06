import { Head } from '@inertiajs/react';

import { EmptyState } from '@/shared/components/empty-state';
import { PageHeader } from '@/shared/components/page-header';

export default function RegistrationIndex() {
    return (
        <>
            <Head title="Pendaftaran" />
            <PageHeader
                title="Pendaftaran"
                description="Pendaftaran pasien, antrean, dan kunjungan."
            />
            <EmptyState
                title="Kerangka modul"
                description="Tambahkan alur pendaftaran sesuai kebutuhan."
            />
        </>
    );
}
