import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { Invoice } from '../../types/cashier';
import { PaymentDialog } from '../components/payment-dialog';
import { InvoicePaymentSummary } from './components/invoice-payment-summary';
import { PaymentTable } from './components/payment-table';

interface Props {
    invoice: Invoice;
}

export default function InvoicePaymentIndex({ invoice }: Props) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    return (
        <div className="space-y-6">
            <Head
                title={`Riwayat Pembayaran #${invoice.invoice_number} — SIMRS`}
            />

            {/* Header & Back Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-xs text-muted-foreground hover:text-foreground"
                    asChild
                >
                    <Link href={route('cashier.invoices.show', invoice.id)}>
                        <ArrowLeft className="mr-1.5 size-3.5" />
                        Kembali ke Detail Faktur
                    </Link>
                </Button>

                <div className="flex items-center gap-2">
                    {invoice.status !== 'paid' &&
                        invoice.status !== 'voided' && (
                            <Button
                                size="sm"
                                className="h-8 text-xs font-medium"
                                onClick={() => setIsPaymentOpen(true)}
                            >
                                <Plus className="mr-1.5 size-3.5" />
                                Tambah Pembayaran
                            </Button>
                        )}
                </div>
            </div>

            {/* Ringkasan Faktur */}
            <InvoicePaymentSummary invoice={invoice} />

            {/* Riwayat Pembayaran */}
            <PaymentTable payments={invoice.payments} />

            {/* Dialog Catat Pembayaran Baru */}
            <PaymentDialog
                invoice={invoice}
                open={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
            />
        </div>
    );
}
