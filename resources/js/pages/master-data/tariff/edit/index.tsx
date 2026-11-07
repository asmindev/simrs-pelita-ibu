import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';
import { Card, CardContent } from '@/shared/ui/card';

import { TariffForm } from '../components/tariff-form';
import type { Tariff, UnitOption } from '../types/tariff';

type Props = {
    tariff: Tariff;
    units: UnitOption[];
};

export default function TariffEdit({ tariff, units }: Props) {
    return (
        <>
            <Head title={`Edit Tarif — ${tariff.name}`} />
            <PageHeader
                title="Edit Tarif"
                description={`Ubah data tarif ${tariff.name}.`}
            />

            <Card>
                <CardContent className="pt-6">
                    <TariffForm tariff={tariff} units={units} />
                </CardContent>
            </Card>
        </>
    );
}
