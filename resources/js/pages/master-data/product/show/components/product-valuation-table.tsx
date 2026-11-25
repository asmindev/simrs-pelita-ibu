import { Layers, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

import type { Product } from '../../types/product';

type LayerRow = NonNullable<Product['valuation_layers']>[number];

type Props = {
    layers?: Product['valuation_layers'];
    unitOfMeasure: string;
};

export function ProductValuationTable({ layers = [], unitOfMeasure }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return layers;
        const q = search.toLowerCase();
        return layers.filter(
            (item) =>
                (item.reference && item.reference.toLowerCase().includes(q)) ||
                (item.product_batch?.batch_number &&
                    item.product_batch.batch_number
                        .toLowerCase()
                        .includes(q)) ||
                (item.description &&
                    item.description.toLowerCase().includes(q)),
        );
    }, [layers, search]);

    const columns = useMemo<DataTableColumn<LayerRow>[]>(
        () => [
            {
                key: 'reference',
                header: 'Referensi & Waktu',
                render: (layer) => (
                    <div className="space-y-0.5">
                        <div className="font-mono text-xs font-semibold text-foreground">
                            {layer.reference ??
                                layer.stock_movement?.reference_number ??
                                `SVL-${layer.id}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            {formatDateTime(layer.created_at)}
                        </div>
                    </div>
                ),
            },
            {
                key: 'batch_location',
                header: 'Batch & Lokasi',
                render: (layer) => (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs text-foreground">
                            {layer.product_batch?.batch_number ?? '-'}
                        </span>
                        {layer.location && (
                            <Badge
                                variant="outline"
                                className="px-1.5 py-0 font-mono text-[10px]"
                            >
                                {layer.location.code}
                            </Badge>
                        )}
                    </div>
                ),
            },
            {
                key: 'quantity',
                header: 'Qty Layer',
                className: 'text-right',
                render: (layer) => {
                    const isPositive = layer.quantity > 0;
                    return (
                        <span
                            className={`font-mono text-xs font-bold tabular-nums ${
                                isPositive ? 'text-primary' : 'text-destructive'
                            }`}
                        >
                            {isPositive ? `+${layer.quantity}` : layer.quantity}{' '}
                            {unitOfMeasure}
                        </span>
                    );
                },
            },
            {
                key: 'remaining_qty',
                header: 'Sisa Layer',
                className: 'text-right',
                render: (layer) => (
                    <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                        {layer.remaining_qty.toLocaleString('id-ID')}{' '}
                        {unitOfMeasure}
                    </span>
                ),
            },
            {
                key: 'unit_cost',
                header: 'Unit Cost',
                className: 'text-right',
                render: (layer) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(layer.unit_cost)}
                    </span>
                ),
            },
            {
                key: 'value',
                header: 'Nilai Layer',
                className: 'text-right',
                render: (layer) => (
                    <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                            layer.value >= 0
                                ? 'text-foreground'
                                : 'text-destructive'
                        }`}
                    >
                        {formatCurrency(layer.value)}
                    </span>
                ),
            },
            {
                key: 'remaining_value',
                header: 'Nilai Tersisa',
                className: 'text-right',
                render: (layer) => (
                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                        {formatCurrency(layer.remaining_value)}
                    </span>
                ),
            },
        ],
        [unitOfMeasure],
    );

    return (
        <DataTable<LayerRow>
            columns={columns}
            rows={filtered}
            rowKey={(layer) => layer.id}
            empty="Belum ada catatan Inventory Valuation Layer untuk produk ini."
            toolbar={
                <TableToolbar
                    title="Inventory Valuation Layers"
                    description="Lapisan nilai persediaan masuk, konsumsi keluar (FEFO/Batch), dan nilai sisa."
                    icon={Layers}
                    current={filtered.length}
                    total={layers.length}
                >
                    <div className="relative min-w-48 sm:w-64">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari referensi atau batch..."
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
