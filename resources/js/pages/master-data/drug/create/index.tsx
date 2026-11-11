import { Head } from '@inertiajs/react';

import { Card, CardContent } from '@/shared/ui/card';

import { DrugForm } from '../components/drug-form';
import type { DrugCategory } from '../types/drug';

type Props = {
    categories: DrugCategory[];
};

export default function DrugCreate({ categories }: Props) {
    return (
        <div className="space-y-4">
            <Head title="Tambah Obat — SIMRS" />

            <Card>
                <CardContent className="pt-6">
                    <DrugForm categories={categories} />
                </CardContent>
            </Card>
        </div>
    );
}
