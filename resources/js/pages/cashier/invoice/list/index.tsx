import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';

import { PaymentDialog } from '../components/payment-dialog';
import type { Invoice, PaginatedData } from '../../types/cashier';
import { getInvoiceColumns } from './components/invoice-columns';
import { InvoiceFilters } from './components/invoice-filters';
import { InvoiceStatistics } from './components/invoice-statistics';
import { useInvoiceList } from './hooks/use-invoice-list';

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
        <div className="space-y-4">
            <Head title="Kasir & Tagihan Pasien — SIMRS" />

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
