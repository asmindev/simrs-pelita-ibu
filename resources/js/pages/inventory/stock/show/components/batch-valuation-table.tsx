import { Layers, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { Input } from '@/shared/ui/input';

import type { StockValuationLayer } from '../../types/stock';

type Props = {
    layers: StockValuationLayer[];
};

export function BatchValuationTable({ layers }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return layers;
        const q = search.toLowerCase();
        return layers.filter(
            (l) =>
                (l.reference && l.reference.toLowerCase().includes(q)) ||
                (l.description && l.description.toLowerCase().includes(q)) ||
                (l.location?.name && l.location.name.toLowerCase().includes(q)),
        );
    }, [layers, search]);

    const columns = useMemo<DataTableColumn<StockValuationLayer>[]>(
        () => [
            {
                key: 'reference',
                header: 'Referensi',
                className: 'py-1.5',
                render: (layer) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {layer.reference ??
                            layer.stock_movement?.reference_number ??
                            `SVL-${layer.id}`}
                    </span>
                ),
            },
            {
                key: 'created_at',
                header: 'Waktu',
                className: 'py-1.5',
                render: (layer) => (
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(layer.created_at)}
                    </span>
                ),
            },
            {
                key: 'location',
                header: 'Lokasi',
                className: 'py-1.5',
                render: (layer) =>
                    layer.location ? (
                        <span className="text-xs text-foreground">
                            {layer.location.name}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                    ),
            },
            {
                key: 'quantity',
                header: 'Qty Layer',
                className: 'py-1.5 text-right',
                render: (layer) => {
                    const isPositive = layer.quantity > 0;
                    return (
                        <span
                            className={`font-mono text-xs font-bold tabular-nums ${
                                isPositive ? 'text-primary' : 'text-destructive'
                            }`}
                        >
                            {isPositive ? `+${layer.quantity}` : layer.quantity}{' '}
                            {layer.product?.unit_of_measure ?? ''}
                        </span>
                    );
                },
            },
            {
                key: 'remaining_qty',
                header: 'Sisa Layer',
                className: 'py-1.5 text-right',
                render: (layer) => (
                    <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                        {layer.remaining_qty.toLocaleString('id-ID')}{' '}
                        {layer.product?.unit_of_measure ?? ''}
                    </span>
                ),
            },
            {
                key: 'unit_cost',
                header: 'Unit Cost',
                className: 'py-1.5 text-right',
                render: (layer) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(layer.unit_cost)}
                    </span>
                ),
            },
            {
                key: 'value',
                header: 'Nilai Layer',
                className: 'py-1.5 text-right',
                render: (layer) => {
                    const isPositive = layer.value >= 0;
                    return (
                        <span
                            className={`font-mono text-xs font-semibold tabular-nums ${
                                isPositive
                                    ? 'text-foreground'
                                    : 'text-destructive'
                            }`}
                        >
                            {formatCurrency(layer.value)}
                        </span>
                    );
                },
            },
            {
                key: 'remaining_value',
                header: 'Nilai Tersisa',
                className: 'py-1.5 text-right',
                render: (layer) => (
                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                        {formatCurrency(layer.remaining_value)}
                    </span>
                ),
            },
            {
                key: 'description',
                header: 'Keterangan',
                className: 'max-w-44 py-1.5',
                render: (layer) => (
                    <span
                        className="block truncate text-xs text-muted-foreground"
                        title={layer.description ?? undefined}
                    >
                        {layer.description ?? '-'}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <DataTable<StockValuationLayer>
            columns={columns}
            rows={filtered}
            rowKey={(layer) => layer.id}
            empty="Belum ada Inventory Valuation Layer untuk batch ini."
            toolbar={
                <TableToolbar
                    title="Inventory Valuation Layers"
                    description="Jejak lapisan valuasi persediaan untuk batch ini."
                    icon={Layers}
                    current={filtered.length}
                    total={layers.length}
                >
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari referensi atau lokasi..."
                            className="h-8 bg-background pl-8 text-xs"
                            aria-label="Cari layer valuasi batch"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
