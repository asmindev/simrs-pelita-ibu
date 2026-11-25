import { router } from '@inertiajs/react';
import { Search, Warehouse } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
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

import type {
    UsageOption,
    WarehouseFilters as Filters,
} from '../../types/warehouse';

type Props = {
    filters: Filters;
    usageOptions: UsageOption[];
    current: number;
    total: number;
    actions?: ReactNode;
};

export function WarehouseFilters({
    filters,
    usageOptions,
    current,
    total,
    actions,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [usage, setUsage] = useState(filters.usage || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const activeFilterCount =
        (usage !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0);

    function executeFilter(next?: {
        search?: string;
        usage?: string;
        status?: string;
    }) {
        const s = next?.search !== undefined ? next.search : search;
        const u = next?.usage !== undefined ? next.usage : usage;
        const st = next?.status !== undefined ? next.status : status;

        router.get(
            route('inventory.warehouses.index'),
            {
                search: s || undefined,
                usage: u === 'all' ? undefined : u,
                status: st === 'all' ? undefined : st,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function resetFilters() {
        setUsage('all');
        setStatus('all');
        executeFilter({ usage: 'all', status: 'all' });
    }

    return (
        <TableToolbar
            title="Gudang & Lokasi Stok"
            description="Master gudang pusat, depo layanan, karantina, dan lokasi virtual Odoo."
            icon={Warehouse}
            current={current}
            total={total}
            actions={actions}
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-44 flex-1 sm:w-56 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="warehouse-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode atau nama gudang..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari gudang"
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
                    title="Filter Gudang & Lokasi"
                    activeCount={activeFilterCount}
                    onApply={() => executeFilter()}
                    onReset={resetFilters}
                >
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                Tipe Lokasi
                            </Label>
                            <Select value={usage} onValueChange={setUsage}>
                                <SelectTrigger className="h-8 bg-background text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Tipe
                                    </SelectItem>
                                    {usageOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                Status Lokasi
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-8 bg-background text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
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
