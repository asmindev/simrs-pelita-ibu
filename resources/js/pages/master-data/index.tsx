import { Head, Link } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';
import { route } from '@/shared/lib/route';

export default function MasterDataIndex() {
    return (
        <>
            <Head title="Master Data" />
            <PageHeader
                title="Master Data"
                description="Pasien, dokter, poli, obat, dan tarif."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    href={route('master-data.patients.index')}
                    className="rounded-lg border p-4 hover:bg-muted/50"
                >
                    <p className="font-medium">Pasien</p>
                    <p className="text-sm text-muted-foreground">
                        Data identitas dan nomor rekam medis.
                    </p>
                </Link>
            </div>
        </>
    );
}
