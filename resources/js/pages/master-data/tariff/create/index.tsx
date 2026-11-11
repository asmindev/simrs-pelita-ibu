import { Head } from '@inertiajs/react';

import { Card, CardContent } from '@/shared/ui/card';

import { TariffForm } from '../components/tariff-form';
import type { UnitOption } from '../types/tariff';

type Props = {
    units: UnitOption[];
};

export default function TariffCreate({ units }: Props) {
    return (
        <div className="space-y-4">
            <Head title="Tambah Tarif — SIMRS" />

            <Card>
                <CardContent className="pt-6">
                    <TariffForm units={units} />
                </CardContent>
            </Card>
        </div>
    );
}
