import { Head, Link } from '@inertiajs/react';

import { Can } from '@/shared/components/can';
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
                <Can permission="master-data.unit.view">
                    <Link
                        href={route('master-data.units.index')}
                        className="rounded-lg border p-4 hover:bg-muted/50"
                    >
                        <p className="font-medium">Unit</p>
                        <p className="text-sm text-muted-foreground">
                            Poli, ruang rawat, laboratorium, radiologi, dan
                            farmasi.
                        </p>
                    </Link>
                </Can>

                <Can permission="master-data.doctor.view">
                    <Link
                        href={route('master-data.doctors.index')}
                        className="rounded-lg border p-4 hover:bg-muted/50"
                    >
                        <p className="font-medium">Dokter</p>
                        <p className="text-sm text-muted-foreground">
                            Profil dokter dan nomor izin praktik.
                        </p>
                    </Link>
                </Can>

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
