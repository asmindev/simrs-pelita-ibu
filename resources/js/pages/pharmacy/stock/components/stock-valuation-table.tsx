import { router } from '@inertiajs/react';
import { Layers, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { FilterPopover } from '@/shared/components/filter-popover';
import { Pagination } from '@/shared/components/pagination';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import type { PaginatedData, StockValuationLayer } from '../../types/pharmacy';

type Props = {
    layers: PaginatedData<StockValuationLayer>;
    filters: {
        layer_search: string;
        layer_direction: string;
    };
};

export function StockValuationTable({ layers, filters }: Props) {
    const [search, setSearch] = useState(filters.layer_search || '');
    const [direction, setDirection] = useState(
        filters.layer_direction || 'all',
    );

    const activeFilterCount = direction !== 'all' ? 1 : 0;

    function executeFilter(next?: { search?: string; direction?: string }) {
        const s = next?.search !== undefined ? next.search : search;
        const d = next?.direction !== undefined ? next.direction : direction;

        router.get(
            route('pharmacy.stock.index'),
            {
                tab: 'layers',
                layer_search: s || undefined,
                layer_direction: d === 'all' ? undefined : d,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function resetFilters() {
        setDirection('all');
        executeFilter({ direction: 'all' });
    }

    const columns: DataTableColumn<StockValuationLayer>[] = [
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
            key: 'drug_batch',
            header: 'Obat & Batch',
            render: (layer) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {layer.drug?.name ?? '-'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-mono">
                            {layer.drug_batch?.batch_number ?? '-'}
                        </span>
                        {layer.location && (
                            <Badge
                                variant="outline"
                                className="px-1 py-0 font-mono text-[10px]"
                            >
                                {layer.location.code}
                            </Badge>
                        )}
                    </div>
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
                        {layer.drug?.unit_of_measure ?? ''}
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
                    {layer.drug?.unit_of_measure ?? ''}
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
            render: (layer) => {
                const isPositive = layer.value >= 0;
                return (
                    <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                            isPositive ? 'text-foreground' : 'text-destructive'
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
            className: 'text-right',
            render: (layer) => (
                <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                    {formatCurrency(layer.remaining_value)}
                </span>
            ),
        },
        {
            key: 'description',
            header: 'Keterangan',
            render: (layer) => (
                <div className="max-w-48 space-y-0.5">
                    <div className="truncate text-xs text-muted-foreground">
                        {layer.description ?? '-'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                        PIC: {layer.user?.name ?? 'Sistem'}
                    </div>
                </div>
            ),
        },
    ];

    return (
        <DataTable<StockValuationLayer>
            columns={columns}
            rows={layers.data}
            rowKey={(layer) => layer.id}
            empty="Belum ada catatan Inventory Valuation Layer."
            toolbar={
                <TableToolbar
                    title="Inventory Valuation Layers (Specific Batch / FEFO)"
                    description="Jejak lapisan nilai persediaan masuk, konsumsi layer keluar, dan sisa nilai batch."
                    icon={Layers}
                    current={layers.data.length}
                    total={layers.total}
                >
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
                    >
                        <div className="relative min-w-44 flex-1 sm:w-56 sm:flex-none">
                            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="layer-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Referensi, Obat, Batch..."
                                className="h-8 bg-background pl-8 text-xs"
                                aria-label="Cari valuation layer"
                            />
                        </div>

                        <Button
                            type="submit"
                            size="sm"
                            className="h-8 shrink-0 text-xs"
                        >
                            Cari
                        </Button>

                        <FilterPopover
                            title="Filter Valuation Layer"
                            activeCount={activeFilterCount}
                            onApply={() => executeFilter()}
                            onReset={resetFilters}
                        >
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Tipe Layer
                                </Label>
                                <Select
                                    value={direction}
                                    onValueChange={setDirection}
                                >
                                    <SelectTrigger className="h-8 bg-background text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Layer
                                        </SelectItem>
                                        <SelectItem value="remaining">
                                            Masih Memiliki Sisa (Remaining &gt;
                                            0)
                                        </SelectItem>
                                        <SelectItem value="in">
                                            Layer Masuk (+)
                                        </SelectItem>
                                        <SelectItem value="out">
                                            Layer Keluar (-)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </FilterPopover>
                    </form>
                </TableToolbar>
            }
            footer={
                <Pagination
                    links={layers.links}
                    from={layers.from}
                    to={layers.to}
                    total={layers.total}
                />
            }
        />
    );
}
