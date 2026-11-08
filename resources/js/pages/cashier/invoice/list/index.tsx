import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';

import { getInvoiceColumns } from '../components/invoice-columns';
import { InvoiceFilters } from '../components/invoice-filters';
import { InvoiceStatistics } from '../components/invoice-statistics';
import { PaymentDialog } from '../components/payment-dialog';
import { useInvoiceList } from '../hooks/use-invoice-list';
import type { Invoice, PaginatedData } from '../../types/cashier';

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

export default function InvoiceListIndex({
    invoices,
    filters,
    statistics,
}: Props) {
    const { payingInvoice, handleOpenPayment, handleClosePayment } =
        useInvoiceList();

    const columns = useMemo(
        () => getInvoiceColumns({ onPay: handleOpenPayment }),
        [handleOpenPayment],
    );

    return (
        <div className="space-y-6">
            <Head title="Kasir & Tagihan Pasien — SIMRS" />

            <PageHeader
                title="Kasir & Billing Tagihan"
                description="Pengelolaan dan penerimaan pembayaran langsung untuk layanan poli, tindakan, dan obat farmasi."
            />

            <InvoiceStatistics statistics={statistics} />

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

            <PaymentDialog
                invoice={payingInvoice}
                open={payingInvoice !== null}
                onOpenChange={(open) => !open && handleClosePayment()}
            />
        </div>
    );
}
