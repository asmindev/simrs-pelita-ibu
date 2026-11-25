import { Link } from '@inertiajs/react';
import { Package, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

import type { WarehouseQuant } from '../../types/warehouse';

type Props = {
    quants: WarehouseQuant[];
};

export function WarehouseQuantTable({ quants }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return quants;
        const q = search.toLowerCase();
        return quants.filter(
            (item) =>
                (item.product?.name &&
                    item.product.name.toLowerCase().includes(q)) ||
                (item.product?.code &&
                    item.product.code.toLowerCase().includes(q)) ||
                (item.product_batch?.batch_number &&
                    item.product_batch.batch_number.toLowerCase().includes(q)),
        );
    }, [quants, search]);

    const columns = useMemo<DataTableColumn<WarehouseQuant>[]>(
        () => [
            {
                key: 'product',
                header: 'Produk',
                render: (quant) => (
                    <div className="space-y-0.5">
                        {quant.product ? (
                            <Link
                                href={route(
                                    'master-data.products.show',
                                    quant.product.id,
                                )}
                                className="text-xs font-semibold text-foreground hover:text-primary hover:underline"
                            >
                                {quant.product.name}
                            </Link>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                -
                            </span>
                        )}
                        <div className="font-mono text-[11px] text-muted-foreground">
                            {quant.product?.code ?? '-'}
                        </div>
                    </div>
                ),
            },
            {
                key: 'batch',
                header: 'No. Batch / Lot',
                render: (quant) => (
                    <Badge
                        variant="outline"
                        className="font-mono text-[11px] font-medium"
                    >
                        {quant.product_batch?.batch_number ?? '-'}
                    </Badge>
                ),
            },
            {
                key: 'expiry',
                header: 'Kedaluwarsa',
                render: (quant) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {quant.product_batch?.expiry_date
                            ? formatDate(quant.product_batch.expiry_date)
                            : '-'}
                    </span>
                ),
            },
            {
                key: 'quantity',
                header: 'Stok On-Hand',
                className: 'text-right',
                render: (quant) => (
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {quant.quantity.toLocaleString('id-ID')}{' '}
                        <span className="font-normal text-muted-foreground">
                            {quant.product?.unit_of_measure ?? ''}
                        </span>
                    </span>
                ),
            },
            {
                key: 'value',
                header: 'Nilai Valuasi',
                className: 'text-right',
                render: (quant) => {
                    const price = Number(quant.product_batch?.buy_price ?? 0);
                    return (
                        <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                            {formatCurrency(quant.quantity * price)}
                        </span>
                    );
                },
            },
        ],
        [],
    );

    return (
        <DataTable<WarehouseQuant>
            columns={columns}
            rows={filtered}
            rowKey={(quant) => quant.id}
            empty="Belum ada stok produk tersimpan di lokasi ini."
            toolbar={
                <TableToolbar
                    title="Stok Produk di Lokasi (Stock Quants)"
                    description="Daftar produk dan batch yang saat ini berada di lokasi ini."
                    icon={Package}
                    current={filtered.length}
                    total={quants.length}
                >
                    <div className="relative min-w-48 sm:w-64">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari produk, SKU, batch..."
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
