import { router } from '@inertiajs/react';
import { Activity, Search, SlidersHorizontal } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
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
        unit_id: number | null;
        date: string;
    };
    units: Array<{ id: number; name: string; code: string }>;
    current: number;
    total: number;
};

export function MedicalRecordFilters({
    filters,
    units,
    current,
    total,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [unitId, setUnitId] = useState(
        filters.unit_id ? String(filters.unit_id) : 'all',
    );
    const [date, setDate] = useState(filters.date || '');
    const [open, setOpen] = useState(false);

    const activeFilterCount =
        (status !== 'all' ? 1 : 0) +
        (unitId !== 'all' ? 1 : 0) +
        (date !== '' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        status?: string;
        unitId?: string;
        date?: string;
    }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;
        const u = nextParams?.unitId !== undefined ? nextParams.unitId : unitId;
        const d = nextParams?.date !== undefined ? nextParams.date : date;

        router.get(
            route('medical-record.index'),
            {
                search: s || undefined,
                status: st === 'all' ? undefined : st,
                unit_id: u === 'all' ? undefined : u,
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
        setOpen(false);
        executeFilter();
    }

    function resetPopoverFilters() {
        setStatus('all');
        setUnitId('all');
        setDate('');
        setOpen(false);
        executeFilter({ status: 'all', unitId: 'all', date: '' });
    }

    function resetAll() {
        setSearch('');
        setStatus('all');
        setUnitId('all');
        setDate('');

        router.get(
            route('medical-record.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Pelayanan Rekam Medis"
            description="Daftar kunjungan pasien untuk asesmen SOAP, diagnosa, dan tindakan medis."
            icon={Activity}
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
                        id="mr-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nama, NIK, No. Rawat, No. RM..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari pasien"
                    />
                </div>

                <Button
                    type="submit"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                >
                    Cari
                </Button>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant={
                                activeFilterCount > 0 ? 'secondary' : 'outline'
                            }
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="end"
                        className="w-80 space-y-3.5 border-border bg-popover p-4"
                    >
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h4 className="text-sm font-semibold text-foreground">
                                Filter Kunjungan
                            </h4>
                            {activeFilterCount > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetPopoverFilters}
                                    className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="filter-date"
                                    className="text-xs font-medium"
                                >
                                    Tanggal Kunjungan
                                </Label>
                                <Input
                                    id="filter-date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-8 bg-background text-xs"
                                    aria-label="Filter tanggal"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="filter-unit"
                                    className="text-xs font-medium"
                                >
                                    Unit / Poliklinik
                                </Label>
                                <Select
                                    value={unitId}
                                    onValueChange={setUnitId}
                                >
                                    <SelectTrigger
                                        id="filter-unit"
                                        className="h-8 bg-background text-xs"
                                        aria-label="Filter unit"
                                    >
                                        <SelectValue placeholder="Semua Unit / Poli" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Unit / Poli
                                        </SelectItem>
                                        {units.map((u) => (
                                            <SelectItem
                                                key={u.id}
                                                value={String(u.id)}
                                            >
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="filter-status"
                                    className="text-xs font-medium"
                                >
                                    Status Pelayanan
                                </Label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger
                                        id="filter-status"
                                        className="h-8 bg-background text-xs"
                                        aria-label="Filter status"
                                    >
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Status
                                        </SelectItem>
                                        <SelectItem value="arrived">
                                            Menunggu
                                        </SelectItem>
                                        <SelectItem value="in_consultation">
                                            Konsultasi
                                        </SelectItem>
                                        <SelectItem value="finished">
                                            Selesai
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={applyPopoverFilter}
                            >
                                Terapkan Filter
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

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
