import { router } from '@inertiajs/react';
import { Microscope, Search } from 'lucide-react';
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
        type: string;
        status: string;
        date: string;
    };
    current: number;
    total: number;
};

export function OrderFilters({ filters, current, total }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [date, setDate] = useState(filters.date || '');

    const activeFilterCount =
        (type !== 'all' ? 1 : 0) +
        (status !== 'all' ? 1 : 0) +
        (date !== '' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        type?: string;
        status?: string;
        date?: string;
    }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const t = nextParams?.type !== undefined ? nextParams.type : type;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;
        const d = nextParams?.date !== undefined ? nextParams.date : date;

        router.get(
            route('diagnostics.orders.index'),
            {
                search: s || undefined,
                type: t === 'all' ? undefined : t,
                status: st === 'all' ? undefined : st,
                date: d || undefined,
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
        setType('all');
        setStatus('all');
        setDate('');
        executeFilter({ type: 'all', status: 'all', date: '' });
    }

    function resetAll() {
        setSearch('');
        setType('all');
        setStatus('all');
        setDate('');

        router.get(
            route('diagnostics.orders.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Pemeriksaan Penunjang"
            description="Pengelolaan permintaan & hasil pemeriksaan Laboratorium dan Radiologi."
            icon={Microscope}
            current={current}
            total={total}
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="order-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="No. Order, Pasien, No. RM..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari order penunjang"
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
                    title="Filter Penunjang"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="filter-diag-date"
                            className="text-xs font-medium"
                        >
                            Tanggal Order
                        </Label>
                        <Input
                            id="filter-diag-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-8 bg-background text-xs"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="filter-diag-type"
                            className="text-xs font-medium"
                        >
                            Jenis Layanan
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger
                                id="filter-diag-type"
                                className="h-8 bg-background text-xs"
                            >
                                <SelectValue placeholder="Semua Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                <SelectItem value="laboratory">
                                    Laboratorium
                                </SelectItem>
                                <SelectItem value="radiology">
                                    Radiologi
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="filter-diag-status"
                            className="text-xs font-medium"
                        >
                            Status Pemeriksaan
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                id="filter-diag-status"
                                className="h-8 bg-background text-xs"
                            >
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="ordered">
                                    Menunggu Diproses
                                </SelectItem>
                                <SelectItem value="in_progress">
                                    Sedang Diperiksa
                                </SelectItem>
                                <SelectItem value="completed">
                                    Selesai (Hasil Rilis)
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
