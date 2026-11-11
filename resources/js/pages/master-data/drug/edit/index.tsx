import { Head } from '@inertiajs/react';

import { Card, CardContent } from '@/shared/ui/card';

import { DrugForm } from '../components/drug-form';
import type { Drug, DrugCategory } from '../types/drug';

type Props = {
    drug: Drug;
    categories: DrugCategory[];
};

export default function DrugEdit({ drug, categories }: Props) {
    return (
        <div className="space-y-4">
            <Head title={`Edit Obat — ${drug.name}`} />

            <Card>
                <CardContent className="pt-6">
                    <DrugForm drug={drug} categories={categories} />
                </CardContent>
            </Card>
        </div>
    );
}
