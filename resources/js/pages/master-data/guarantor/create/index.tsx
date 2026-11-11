import { Head } from '@inertiajs/react';

import { Card, CardContent } from '@/shared/ui/card';

import { GuarantorForm } from '../components/guarantor-form';

export default function GuarantorCreate() {
    return (
        <div className="space-y-4">
            <Head title="Tambah Penjamin — SIMRS" />

            <Card>
                <CardContent className="pt-6">
                    <GuarantorForm />
                </CardContent>
            </Card>
        </div>
    );
}
