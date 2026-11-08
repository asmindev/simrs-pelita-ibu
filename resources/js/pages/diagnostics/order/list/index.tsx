import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';

import { getDiagnosticOrderColumns } from './components/order-columns';
import { OrderFilters } from './components/order-filters';
import { DiagnosticOrderStatistics } from './components/order-statistics';
import type { DiagnosticOrder, PaginatedData } from '../../types/diagnostics';

type Props = {
    orders: PaginatedData<DiagnosticOrder>;
    filters: {
        search: string;
        type: string;
        status: string;
        date: string;
    };
    statistics: {
        total_today: number;
        lab_orders: number;
        radiology_orders: number;
        completed_today: number;
    };
};

export default function DiagnosticOrderListIndex({
    orders,
    filters,
    statistics,
}: Props) {
    const columns = useMemo(() => getDiagnosticOrderColumns(), []);

    return (
        <div className="space-y-6">
            <Head title="Pemeriksaan Penunjang — SIMRS" />

            <PageHeader
                title="Layanan Penunjang Medis"
                description="Pengelolaan permintaan dan hasil pemeriksaan laboratorium serta radiologi."
            />

            <DiagnosticOrderStatistics statistics={statistics} />

            <DataTable<DiagnosticOrder>
                columns={columns}
                rows={orders.data}
                rowKey={(o) => o.id}
                empty="Tidak ada order pemeriksaan penunjang yang sesuai."
                toolbar={
                    <OrderFilters
                        filters={filters}
                        current={orders.data.length}
                        total={orders.total}
                    />
                }
                footer={
                    <Pagination
                        links={orders.links}
                        from={orders.from}
                        to={orders.to}
                        total={orders.total}
                    />
                }
            />
        </div>
    );
}
