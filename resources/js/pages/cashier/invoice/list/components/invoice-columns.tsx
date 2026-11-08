import { Link } from '@inertiajs/react';
import { Eye, Wallet } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { Invoice } from '../../../types/cashier';
import { InvoiceStatusBadge } from '../../components/invoice-status-badge';

type ColumnOptions = {
    onPay: (invoice: Invoice) => void;
};

export function getInvoiceColumns({
    onPay,
}: ColumnOptions): DataTableColumn<Invoice>[] {
    return [
        {
            key: 'invoice_patient',
            header: 'No. Invoice & Pasien',
            render: (invoice) => (
                <div className="space-y-0.5">
                    <Link
                        href={route('cashier.invoices.show', invoice.id)}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                        {invoice.invoice_number}
                    </Link>
                    <div className="text-xs font-medium text-foreground">
                        {invoice.patient?.name}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                        RM: {invoice.patient?.medical_record_number} &bull;{' '}
                        {formatDate(invoice.created_at)}
                    </div>
                </div>
            ),
        },
        {
            key: 'service_guarantor',
            header: 'Layanan & Penjamin',
            render: (invoice) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {invoice.encounter?.unit?.name ?? 'Pelayanan Medis'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {invoice.guarantor?.name ?? 'Umum / Mandiri'}
                    </div>
                </div>
            ),
        },
        {
            key: 'amount_info',
            header: 'Total Tagihan',
            render: (invoice) => {
                const remaining = Math.max(
                    0,
                    invoice.total_amount - invoice.paid_amount,
                );
                return (
                    <div className="space-y-0.5">
                        <div className="font-mono text-xs font-semibold text-foreground">
                            {formatCurrency(invoice.total_amount)}
                        </div>
                        {invoice.paid_amount > 0 && (
                            <div className="font-mono text-[11px] text-muted-foreground">
                                Dibayar: {formatCurrency(invoice.paid_amount)}
                            </div>
                        )}
                        {remaining > 0 && invoice.status !== 'voided' && (
                            <div className="font-mono text-[11px] font-semibold text-destructive">
                                Sisa: {formatCurrency(remaining)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            render: (invoice) => <InvoiceStatusBadge status={invoice.status} />,
        },
        {
            key: 'actions',
            header: '',
            className: 'w-[140px] text-right',
            render: (invoice) => (
                <div className="flex items-center justify-end gap-1">
                    {invoice.status !== 'paid' &&
                        invoice.status !== 'voided' && (
                            <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs"
                                onClick={() => onPay(invoice)}
                            >
                                <Wallet className="mr-1 size-3.5" />
                                Bayar
                            </Button>
                        )}
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        asChild
                    >
                        <Link href={route('cashier.invoices.show', invoice.id)}>
                            <Eye className="mr-1 size-3.5" />
                            Detail
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];
}
