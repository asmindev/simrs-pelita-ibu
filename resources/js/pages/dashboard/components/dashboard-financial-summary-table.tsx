import { useMemo } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';

import type { FinancialSummaryItem } from '../types/dashboard';

interface Props {
    items: FinancialSummaryItem[];
}

export function DashboardFinancialSummaryTable({ items }: Props) {
    const columns: DataTableColumn<FinancialSummaryItem>[] = useMemo(
        () => [
            {
                key: 'guarantor',
                header: 'Penjamin',
                className: 'font-medium',
                render: (item) => (
                    <span className="font-semibold text-foreground">
                        {item.guarantor_name}
                    </span>
                ),
            },
            {
                key: 'count',
                header: 'Invoice',
                className: 'text-center font-mono text-muted-foreground',
                render: (item) => item.invoice_count,
            },
            {
                key: 'billed',
                header: 'Total Tagihan',
                className: 'text-right font-mono text-foreground',
                render: (item) => formatCurrency(item.total_billed),
            },
            {
                key: 'paid',
                header: 'Realisasi Terbayar',
                className: 'text-right font-mono font-semibold text-primary',
                render: (item) => formatCurrency(item.total_paid),
            },
            {
                key: 'status',
                header: 'Status',
                className: 'text-right',
                render: (item) => (
                    <Badge
                        variant={
                            item.total_paid >= item.total_billed &&
                            item.total_billed > 0
                                ? 'default'
                                : 'outline'
                        }
                        className="text-[10px]"
                    >
                        {item.status_label}
                    </Badge>
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">
                        Ringkasan Billing & Penjamin Hari Ini
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Rekapitulasi tagihan pasien rawat jalan/inap berdasarkan
                        penjamin.
                    </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                    {items.length} Kelompok Penjamin
                </Badge>
            </div>

            <DataTable<FinancialSummaryItem>
                columns={columns}
                rows={items}
                rowKey={(item) => item.guarantor_id ?? item.guarantor_name}
                empty="Belum ada transaksi invoice kasir tercatat hari ini."
            />
        </div>
    );
}
