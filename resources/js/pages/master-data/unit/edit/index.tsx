import { Head } from '@inertiajs/react';

import { UnitForm } from '../components/unit-form';
import type { Unit } from '../types/unit';

type Props = {
    unit: Unit;
};

export default function UnitEdit({ unit }: Props) {
    return (
        <div className="space-y-4">
            <Head title={`Ubah Unit — ${unit.name}`} />
            <UnitForm unit={unit} />
        </div>
    );
}
