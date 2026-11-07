import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';
import { Card, CardContent } from '@/shared/ui/card';

import { GuarantorForm } from '../components/guarantor-form';
import type { Guarantor } from '../types/guarantor';

type Props = {
    guarantor: Guarantor;
};

export default function GuarantorEdit({ guarantor }: Props) {
    return (
        <>
            <Head title={`Edit Penjamin — ${guarantor.name}`} />
            <PageHeader
                title="Edit Penjamin"
                description={`Ubah data penjamin ${guarantor.name}.`}
            />

            <Card>
                <CardContent className="pt-6">
                    <GuarantorForm guarantor={guarantor} />
                </CardContent>
            </Card>
        </>
    );
}
