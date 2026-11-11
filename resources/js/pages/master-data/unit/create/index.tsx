import { Head } from '@inertiajs/react';

import { UnitForm } from '../components/unit-form';

export default function UnitCreate() {
    return (
        <div className="space-y-4">
            <Head title="Tambah Unit — SIMRS" />
            <UnitForm />
        </div>
    );
}
