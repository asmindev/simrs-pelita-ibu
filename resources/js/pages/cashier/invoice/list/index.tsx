import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    Receipt,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type {
    Invoice,
    InvoiceStatus,
    PaginatedData,
} from '../../types/cashier';
import { InvoiceFilters } from '../components/invoice-filters';
import { PaymentDialog } from '../components/payment-dialog';

type Props = {
    invoices: PaginatedData<Invoice>;
    filters: {
        search: string;
        status: string;
        date: string;
    };
    statistics: {
        total_today: number;
        draft: number;
        paid: number;
        revenue_today: number;
    };
};

function getStatusBadge(status: InvoiceStatus) {
    switch (status) {
        case 'draft':
        case 'finalized':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 size-3 text-muted-foreground" />
                    Menunggu Pembayaran
                </Badge>
            );
        case 'partially_paid':
            return (
                <Badge
                    variant="outline"
                    className="border-primary/50 text-xs text-primary"
                >
                    <CreditCard className="mr-1 size-3" />
                    Sebagian Terbayar
                </Badge>
            );
        case 'paid':
            return (
                <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="mr-1 size-3" />
                    Lunas
                </Badge>
            );
        case 'voided':
            return (
                <Badge variant="destructive" className="text-xs">
                    <XCircle className="mr-1 size-3" />
                    Dibatalkan (Void)
                </Badge>
            );
    }
}

export default function InvoiceListIndex({
    invoices,
    filters,
    statistics,
}: Props) {
    const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

    const columns: DataTableColumn<Invoice>[] = [
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
            key: 'amounts',
            header: 'Total & Terbayar',
            render: (invoice) => {
                const remaining = Math.max(
                    0,
                    invoice.total_amount - invoice.paid_amount,
                );
                return (
                    <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground">
                            {formatCurrency(invoice.total_amount)}
                        </div>
                        {invoice.paid_amount > 0 && (
                            <div className="text-[11px] text-muted-foreground">
                                Terbayar: {formatCurrency(invoice.paid_amount)}
                            </div>
                        )}
                        {remaining > 0 && invoice.status !== 'voided' && (
                            <div className="text-[11px] font-semibold text-primary">
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
            render: (invoice) => getStatusBadge(invoice.status),
        },
        {
            key: 'actions',
            header: 'Aksi',
            className: 'text-right',
            render: (invoice) => (
                <div className="flex items-center justify-end gap-1.5">
                    {invoice.status !== 'paid' &&
                        invoice.status !== 'voided' && (
                            <Button
                                size="sm"
                                className="h-7 text-xs font-medium"
                                onClick={() => setPayingInvoice(invoice)}
                            >
                                <Wallet className="mr-1 size-3" />
                                Bayar
                            </Button>
                        )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        asChild
                    >
                        <Link href={route('cashier.invoices.show', invoice.id)}>
                            <Eye className="mr-1 size-3" />
                            Rincian
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Head title="Kasir & Tagihan Pasien — SIMRS" />

            <PageHeader
                title="Kasir & Billing Tagihan"
                description="Pengelolaan dan penerimaan pembayaran langsung untuk layanan poli, tindakan, dan obat farmasi."
            />

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Tagihan Hari Ini
                        </CardTitle>
                        <Receipt className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.total_today}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Total invoice dibuat
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Menunggu Pembayaran
                        </CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.draft}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Belum diselesaikan kasir
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Tagihan Lunas
                        </CardTitle>
                        <CheckCircle2 className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {statistics.paid}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Pembayaran telah diterima
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Pendapatan Hari Ini
                        </CardTitle>
                        <DollarSign className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {formatCurrency(statistics.revenue_today)}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Total penerimaan kasir
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabel Tagihan */}
            <DataTable<Invoice>
                columns={columns}
                rows={invoices.data}
                rowKey={(inv) => inv.id}
                empty="Tidak ada tagihan yang sesuai dengan pencarian."
                toolbar={
                    <InvoiceFilters
                        filters={filters}
                        current={invoices.data.length}
                        total={invoices.total}
                    />
                }
                footer={
                    <Pagination
                        links={invoices.links}
                        from={invoices.from}
                        to={invoices.to}
                        total={invoices.total}
                    />
                }
            />

            {/* Modal Pembayaran */}
            <PaymentDialog
                invoice={payingInvoice}
                open={payingInvoice !== null}
                onOpenChange={(open) => !open && setPayingInvoice(null)}
            />
        </div>
    );
}
