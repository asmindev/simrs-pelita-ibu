import { router } from '@inertiajs/react';
import { ArrowLeftRight, Boxes, Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { FilterPopover } from '@/shared/components/filter-popover';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
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

import type { StockLocation } from '../../types/inventory';

type Props = {
    filters: {
        search: string;
        location_id: string;
        expiry: string;
    };
    locations: StockLocation[];
    current: number;
    total: number;
    onAddStockClick?: () => void;
    onCreateMoveClick?: () => void;
};

export function StockFilters({
    filters,
    locations,
    current,
    total,
    onAddStockClick,
    onCreateMoveClick,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [locationId, setLocationId] = useState(filters.location_id || 'all');
    const [expiry, setExpiry] = useState(filters.expiry || 'all');

    const internalLocations = locations.filter((l) => l.usage === 'internal');
    const activeFilterCount =
        (locationId !== 'all' ? 1 : 0) + (expiry !== 'all' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        locationId?: string;
        expiry?: string;
    }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const loc =
            nextParams?.locationId !== undefined
                ? nextParams.locationId
                : locationId;
        const exp =
            nextParams?.expiry !== undefined ? nextParams.expiry : expiry;

        router.get(
            route('inventory.stock.index'),
            {
                search: s || undefined,
                location_id: loc === 'all' ? undefined : loc,
                expiry: exp === 'all' ? undefined : exp,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function resetPopoverFilters() {
        setLocationId('all');
        setExpiry('all');
        executeFilter({ locationId: 'all', expiry: 'all' });
    }

    return (
        <TableToolbar
            title="Stok Produk per Gudang"
            description="Posisi stok per produk di setiap gudang. Klik baris untuk melihat rincian kedaluwarsa, transfer, atau opname."
            icon={Boxes}
            current={current}
            total={total}
            actions={
                <Can permission="pharmacy.stock.adjust">
                    <div className="flex items-center gap-2">
                        {onCreateMoveClick && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onCreateMoveClick}
                                className="h-8 gap-1.5 bg-background text-xs font-medium"
                            >
                                <ArrowLeftRight className="size-3.5" />
                                Catat Pergerakan
                            </Button>
                        )}
                        {onAddStockClick && (
                            <Button
                                size="sm"
                                onClick={onAddStockClick}
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Plus className="size-3.5" />
                                Tambah Stok
                            </Button>
                        )}
                    </div>
                </Can>
            }
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-44 flex-1 sm:w-60 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="stock-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nama produk, kode, gudang..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari stok produk"
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
                    title="Filter Stok"
                    activeCount={activeFilterCount}
                    onApply={() => executeFilter()}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="stock-filter-location"
                                className="text-xs font-medium"
                            >
                                Gudang (WH)
                            </Label>
                            <Select
                                value={locationId}
                                onValueChange={setLocationId}
                            >
                                <SelectTrigger
                                    id="stock-filter-location"
                                    className="h-8 bg-background text-xs"
                                >
                                    <SelectValue placeholder="Semua Gudang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Gudang
                                    </SelectItem>
                                    {internalLocations.map((loc) => (
                                        <SelectItem
                                            key={loc.id}
                                            value={String(loc.id)}
                                        >
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="stock-filter-expiry"
                                className="text-xs font-medium"
                            >
                                Status Kedaluwarsa
                            </Label>
                            <Select value={expiry} onValueChange={setExpiry}>
                                <SelectTrigger
                                    id="stock-filter-expiry"
                                    className="h-8 bg-background text-xs"
                                >
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="expiring_soon">
                                        Mendekati ED (&le; 30 hari)
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        Sudah Kedaluwarsa
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </FilterPopover>
            </form>
        </TableToolbar>
    );
}
