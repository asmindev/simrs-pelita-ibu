import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';
import { Card, CardContent } from '@/shared/ui/card';

import { TariffForm } from '../components/tariff-form';
import type { UnitOption } from '../types/tariff';

type Props = {
    units: UnitOption[];
};

export default function TariffCreate({ units }: Props) {
    return (
        <>
            <Head title="Tambah Tarif" />
            <PageHeader
                title="Tambah Tarif"
                description="Daftarkan tarif layanan atau tindakan medis baru ke dalam sistem."
            />

            <Card>
                <CardContent className="pt-6">
                    <TariffForm units={units} />
                </CardContent>
            </Card>
        </>
    );
}
