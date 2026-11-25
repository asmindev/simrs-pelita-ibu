import {
    ArrowLeftRight,
    CalendarClock,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import type { ProductBatch, StockQuant } from '../../../types/inventory';
import { getExpiryBadge } from '../../components/stock-item-columns';

type Props = {
    quants: StockQuant[];
    unitOfMeasure: string;
    onTransfer: (quant: StockQuant) => void;
    onAdjust: (batch: ProductBatch) => void;
};

export function StockExpiryTable({
    quants,
    unitOfMeasure,
    onTransfer,
    onAdjust,
}: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return quants;
        const q = search.toLowerCase();
        return quants.filter((item) => {
            const exp = item.product_batch?.expiry_date
                ? formatDate(item.product_batch.expiry_date).toLowerCase()
                : '';
            const price = String(item.product_batch?.buy_price ?? '');
            return exp.includes(q) || price.includes(q);
        });
    }, [quants, search]);

    const columns = useMemo<DataTableColumn<StockQuant>[]>(
        () => [
            {
                key: 'expiry_date',
                header: 'Kedaluwarsa (ED)',
                className: 'py-1.5',
                render: (quant) =>
                    quant.product_batch?.expiry_date ? (
                        getExpiryBadge(quant.product_batch.expiry_date)
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                    ),
            },
            {
                key: 'buy_price',
                header: 'Harga Beli',
                className: 'py-1.5 text-right',
                render: (quant) => (
                    <span className="font-mono text-xs text-foreground tabular-nums">
                        {formatCurrency(quant.product_batch?.buy_price ?? 0)}
                    </span>
                ),
            },
            {
                key: 'quantity',
                header: 'Sisa Stok',
                className: 'py-1.5 text-right',
                render: (quant) => (
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {quant.quantity.toLocaleString('id-ID')}{' '}
                        <span className="font-normal text-muted-foreground">
                            {unitOfMeasure}
                        </span>
                    </span>
                ),
            },
            {
                key: 'value',
                header: 'Nilai Stok',
                className: 'py-1.5 text-right',
                render: (quant) => {
                    const price = quant.product_batch?.buy_price ?? 0;
                    return (
                        <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                            {formatCurrency(quant.quantity * price)}
                        </span>
                    );
                },
            },
            {
                key: 'actions',
                header: '',
                className: 'w-44 py-1.5 text-right',
                render: (quant) => (
                    <Can permission="pharmacy.stock.adjust">
                        <div className="flex justify-end gap-1.5">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onTransfer(quant)}
                                className="h-6 gap-1 bg-background px-2 text-[11px]"
                            >
                                <ArrowLeftRight className="size-3" />
                                Transfer
                            </Button>
                            {quant.product_batch && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                        quant.product_batch &&
                                        onAdjust(quant.product_batch)
                                    }
                                    className="h-6 gap-1 px-2 text-[11px]"
                                >
                                    <SlidersHorizontal className="size-3" />
                                    Opname
                                </Button>
                            )}
                        </div>
                    </Can>
                ),
            },
        ],
        [unitOfMeasure, onTransfer, onAdjust],
    );

    return (
        <DataTable<StockQuant>
            columns={columns}
            rows={filtered}
            rowKey={(quant) => quant.id}
            empty="Tidak ada stok aktif di gudang ini."
            toolbar={
                <TableToolbar
                    title="Rincian Kedaluwarsa & Harga Beli"
                    description="Urutan prioritas pengeluaran FEFO (tanggal kedaluwarsa terdekat lebih dulu)."
                    icon={CalendarClock}
                    current={filtered.length}
                    total={quants.length}
                >
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari tanggal ED atau harga..."
                            className="h-8 bg-background pl-8 text-xs"
                            aria-label="Cari rincian kedaluwarsa"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
