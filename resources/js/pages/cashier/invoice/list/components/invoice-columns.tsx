import { Link } from '@inertiajs/react';
import { Eye, MoreHorizontal, Wallet } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

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
            className: 'w-12 text-right',
            render: (invoice) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Buka menu aksi</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {invoice.status !== 'paid' &&
                                invoice.status !== 'voided' && (
                                    <DropdownMenuItem
                                        onClick={() => onPay(invoice)}
                                    >
                                        <Wallet className="mr-2 size-3.5" />
                                        Bayar Tagihan
                                    </DropdownMenuItem>
                                )}
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(
                                        'cashier.invoices.show',
                                        invoice.id,
                                    )}
                                >
                                    <Eye className="mr-2 size-3.5" />
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];
}
