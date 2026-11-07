import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';
import { Card, CardContent } from '@/shared/ui/card';

import { DrugForm } from '../components/drug-form';
import type { DrugCategory } from '../types/drug';

type Props = {
    categories: DrugCategory[];
};

export default function DrugCreate({ categories }: Props) {
    return (
        <>
            <Head title="Tambah Obat" />
            <PageHeader
                title="Tambah Obat Baru"
                description="Daftarkan obat atau alkes baru ke dalam formularium rumah sakit."
            />

            <Card>
                <CardContent className="pt-6">
                    <DrugForm categories={categories} />
                </CardContent>
            </Card>
        </>
    );
}
