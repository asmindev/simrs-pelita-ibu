import { router } from '@inertiajs/react';
import { ArrowLeftRight, MapPin, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { FilterPopover } from '@/shared/components/filter-popover';
import { Pagination } from '@/shared/components/pagination';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency } from '@/shared/lib/format';
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

import type {
    PaginatedData,
    StockLocation,
    StockQuant,
} from '../../types/pharmacy';
import { getExpiryBadge } from './stock-batch-columns';

type Props = {
    quants: PaginatedData<StockQuant>;
    locations: StockLocation[];
    filters: {
        quant_search: string;
        quant_location_id: string;
    };
    onTransferQuant: (quant: StockQuant) => void;
};

export function StockQuantTable({
    quants,
    locations,
    filters,
    onTransferQuant,
}: Props) {
    const [search, setSearch] = useState(filters.quant_search || '');
    const [locationId, setLocationId] = useState(
        filters.quant_location_id || 'all',
    );

    const internalLocations = locations.filter((l) => l.usage === 'internal');
    const activeFilterCount = locationId !== 'all' ? 1 : 0;

    function executeFilter(next?: { search?: string; locationId?: string }) {
        const s = next?.search !== undefined ? next.search : search;
        const loc =
            next?.locationId !== undefined ? next.locationId : locationId;

        router.get(
            route('pharmacy.stock.index'),
            {
                tab: 'quants',
                quant_search: s || undefined,
                quant_location_id: loc === 'all' ? undefined : loc,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function resetFilters() {
        setLocationId('all');
        executeFilter({ locationId: 'all' });
    }

    const columns: DataTableColumn<StockQuant>[] = [
        {
            key: 'location',
            header: 'Lokasi Simpan',
            render: (quant) => (
                <div className="space-y-0.5">
                    <Badge variant="outline" className="font-mono text-[10px]">
                        {quant.location?.code ?? '-'}
                    </Badge>
                    <div className="text-xs font-medium text-foreground">
                        {quant.location?.name ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'product_batch',
            header: 'Produk & No. Batch',
            render: (quant) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {quant.product?.name ?? '-'}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                        {quant.product_batch?.batch_number ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'expiry',
            header: 'Kedaluwarsa',
            render: (quant) =>
                quant.product_batch?.expiry_date ? (
                    getExpiryBadge(quant.product_batch.expiry_date)
                ) : (
                    <span className="text-xs text-muted-foreground">-</span>
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
            key: 'valuation',
            header: 'Nilai Lokasi',
            className: 'text-right',
            render: (quant) => {
                const buyPrice = quant.product_batch?.buy_price ?? 0;
                return (
                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                        {formatCurrency(quant.quantity * buyPrice)}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            className: 'w-28 text-right',
            render: (quant) => (
                <Can permission="pharmacy.stock.adjust">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTransferQuant(quant)}
                        className="h-7 gap-1 bg-background text-xs"
                    >
                        <ArrowLeftRight className="size-3" />
                        Transfer
                    </Button>
                </Can>
            ),
        },
    ];

    return (
        <DataTable<StockQuant>
            columns={columns}
            rows={quants.data}
            rowKey={(quant) => quant.id}
            empty="Belum ada stok tersedia di lokasi internal."
            toolbar={
                <TableToolbar
                    title="Posisi Stok per Lokasi (Stock Quants)"
                    description="Distribusi fisik stok obat per gudang pusat, depo layanan, dan karantina."
                    icon={MapPin}
                    current={quants.data.length}
                    total={quants.total}
                >
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
                    >
                        <div className="relative min-w-44 flex-1 sm:w-56 sm:flex-none">
                            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="quant-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Lokasi, Obat, Batch..."
                                className="h-8 bg-background pl-8 text-xs"
                                aria-label="Cari posisi stok lokasi"
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
                            title="Filter Lokasi"
                            activeCount={activeFilterCount}
                            onApply={() => executeFilter()}
                            onReset={resetFilters}
                        >
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Lokasi Internal
                                </Label>
                                <Select
                                    value={locationId}
                                    onValueChange={setLocationId}
                                >
                                    <SelectTrigger className="h-8 bg-background text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Lokasi Internal
                                        </SelectItem>
                                        {internalLocations.map((loc) => (
                                            <SelectItem
                                                key={loc.id}
                                                value={String(loc.id)}
                                            >
                                                {loc.code} — {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </FilterPopover>
                    </form>
                </TableToolbar>
            }
            footer={
                <Pagination
                    links={quants.links}
                    from={quants.from}
                    to={quants.to}
                    total={quants.total}
                />
            }
        />
    );
}
