import { Receipt, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

import type { FinancialSummaryItem } from '../types/dashboard';

interface Props {
    items: FinancialSummaryItem[];
}

export function DashboardFinancialSummaryTable({ items }: Props) {
    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((item) =>
            item.guarantor_name.toLowerCase().includes(q),
        );
    }, [items, search]);

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
        <DataTable<FinancialSummaryItem>
            columns={columns}
            rows={filteredItems}
            rowKey={(item) => item.guarantor_id ?? item.guarantor_name}
            empty="Belum ada transaksi invoice kasir tercatat hari ini."
            toolbar={
                <TableToolbar
                    title="Ringkasan Billing & Penjamin Hari Ini"
                    description="Rekapitulasi tagihan pasien rawat jalan/inap berdasarkan penjamin."
                    icon={Receipt}
                    current={filteredItems.length}
                    total={items.length}
                >
                    <div className="relative min-w-44 sm:w-60">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari penjamin..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 bg-background pl-8 text-xs"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
