import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';
import { Card, CardContent } from '@/shared/ui/card';

import { GuarantorForm } from '../components/guarantor-form';

export default function GuarantorCreate() {
    return (
        <>
            <Head title="Tambah Penjamin" />
            <PageHeader
                title="Tambah Penjamin"
                description="Daftarkan penjamin pembayaran baru ke dalam sistem."
            />

            <Card>
                <CardContent className="pt-6">
                    <GuarantorForm />
                </CardContent>
            </Card>
        </>
    );
}
