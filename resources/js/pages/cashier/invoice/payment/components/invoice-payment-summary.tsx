import { formatCurrency } from '@/shared/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { Invoice } from '../../../types/cashier';
import { InvoiceStatusBadge } from '../../components/invoice-status-badge';

interface InvoicePaymentSummaryProps {
    invoice: Invoice;
}

export function InvoicePaymentSummary({ invoice }: InvoicePaymentSummaryProps) {
    const remainingBalance = Math.max(
        0,
        invoice.total_amount - invoice.paid_amount,
    );

    return (
        <Card className="border-border">
            <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="font-mono text-lg font-bold">
                            {invoice.invoice_number}
                        </CardTitle>
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Kunjungan:{' '}
                        <span className="font-mono font-medium">
                            {invoice.encounter?.encounter_number ?? '-'}
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-6 text-right sm:flex sm:items-center sm:gap-8">
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Total Tagihan
                        </div>
                        <div className="text-base font-bold text-foreground">
                            {formatCurrency(invoice.total_amount)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Sudah Dibayar
                        </div>
                        <div className="font-mono text-base font-bold text-foreground">
                            {formatCurrency(invoice.paid_amount)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">
                            Sisa Tagihan
                        </div>
                        <div className="font-mono text-base font-bold text-primary">
                            {formatCurrency(remainingBalance)}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 border-t border-border pt-4 text-xs sm:grid-cols-3">
                <div className="space-y-1">
                    <span className="text-muted-foreground">Pasien:</span>
                    <div className="font-semibold text-foreground">
                        {invoice.patient?.name ?? '-'}
                    </div>
                    <div className="font-mono text-muted-foreground">
                        No. RM: {invoice.patient?.medical_record_number ?? '-'}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-muted-foreground">
                        Layanan / Poli:
                    </span>
                    <div className="font-semibold text-foreground">
                        {invoice.encounter?.unit?.name ?? 'Poliklinik'}
                    </div>
                    <div className="text-muted-foreground">
                        Dokter: {invoice.encounter?.doctor?.name ?? '-'}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-muted-foreground">Penjamin:</span>
                    <div className="font-semibold text-foreground">
                        {invoice.guarantor?.name ?? 'Umum / Pembayaran Pribadi'}
                    </div>
                    <div className="text-muted-foreground">
                        Tipe: {invoice.guarantor?.type ?? 'Umum'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
