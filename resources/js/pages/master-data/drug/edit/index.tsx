import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';
import { Card, CardContent } from '@/shared/ui/card';

import { DrugForm } from '../components/drug-form';
import type { Drug, DrugCategory } from '../types/drug';

type Props = {
    drug: Drug;
    categories: DrugCategory[];
};

export default function DrugEdit({ drug, categories }: Props) {
    return (
        <>
            <Head title={`Edit Obat — ${drug.name}`} />
            <PageHeader
                title={`Edit Obat — ${drug.name}`}
                description="Perbarui informasi sediaan, dosis, produsen, harga, atau status obat."
            />

            <Card>
                <CardContent className="pt-6">
                    <DrugForm drug={drug} categories={categories} />
                </CardContent>
            </Card>
        </>
    );
}
