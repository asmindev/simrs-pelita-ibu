import { router } from '@inertiajs/react';
import { Boxes, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

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

type Props = {
    filters: {
        search: string;
        status: string;
    };
    current: number;
    total: number;
    onAddBatchClick?: () => void;
};

export function StockFilters({
    filters,
    current,
    total,
    onAddBatchClick,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const activeFilterCount = status !== 'all' ? 1 : 0;

    function executeFilter(nextParams?: { search?: string; status?: string }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;

        router.get(
            route('pharmacy.stock.index'),
            {
                search: s || undefined,
                status: st === 'all' ? undefined : st,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function applyPopoverFilter() {
        executeFilter();
    }

    function resetPopoverFilters() {
        setStatus('all');
        executeFilter({ status: 'all' });
    }

    function resetAll() {
        setSearch('');
        setStatus('all');

        router.get(
            route('pharmacy.stock.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Inventaris Batch & FEFO"
            description="Pelacakan batch obat, kadaluwarsa terdekat (FEFO), dan penyesuaian stok opname."
            icon={Boxes}
            current={current}
            total={total}
            actions={
                onAddBatchClick ? (
                    <Button
                        size="sm"
                        onClick={onAddBatchClick}
                        className="h-8 text-xs font-medium"
                    >
                        Tambah Batch Baru
                    </Button>
                ) : undefined
            }
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="batch-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="No. Batch, Nama Obat..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari batch obat"
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
                    title="Filter Batch"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="batch-filter-status"
                            className="text-xs font-medium"
                        >
                            Status Ketersediaan / Kadaluwarsa
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                id="batch-filter-status"
                                className="h-8 bg-background text-xs"
                                aria-label="Filter status batch"
                            >
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="available">
                                    Tersedia (FEFO Aktif)
                                </SelectItem>
                                <SelectItem value="expired">
                                    Kadaluwarsa (Expired)
                                </SelectItem>
                                <SelectItem value="empty">
                                    Stok Habis (0)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </FilterPopover>

                {(activeFilterCount > 0 || search !== '') && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={resetAll}
                    >
                        Reset
                    </Button>
                )}
            </form>
        </TableToolbar>
    );
}
