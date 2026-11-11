import { Head } from '@inertiajs/react';

import { Card, CardContent } from '@/shared/ui/card';

import { GuarantorForm } from '../components/guarantor-form';
import type { Guarantor } from '../types/guarantor';

type Props = {
    guarantor: Guarantor;
};

export default function GuarantorEdit({ guarantor }: Props) {
    return (
        <div className="space-y-4">
            <Head title={`Edit Penjamin — ${guarantor.name}`} />

            <Card>
                <CardContent className="pt-6">
                    <GuarantorForm guarantor={guarantor} />
                </CardContent>
            </Card>
        </div>
    );
}
