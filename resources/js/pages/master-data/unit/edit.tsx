import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';

import { UnitForm } from '../components/unit-form';
import type { Unit } from '../types/unit';

type Props = {
    unit: Unit;
};

export default function UnitEdit({ unit }: Props) {
    return (
        <>
            <Head title="Ubah unit" />
            <PageHeader
                title="Ubah unit"
                description={`Perbarui data ${unit.name}.`}
            />
            <UnitForm unit={unit} />
        </>
    );
}
