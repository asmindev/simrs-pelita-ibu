import { router } from '@inertiajs/react';
import { Activity, Search } from 'lucide-react';
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
    actions?: ReactNode;
};

export function MedicalRecordFilters({
    filters,
    units,
    current,
    total,
    actions,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [unitId, setUnitId] = useState(
        filters.unit_id ? String(filters.unit_id) : 'all',
    );
    const [date, setDate] = useState(filters.date || '');

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
        executeFilter();
    }

    function resetPopoverFilters() {
        setStatus('all');
        setUnitId('all');
        setDate('');
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
            actions={actions}
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

                <FilterPopover
                    title="Filter Kunjungan Medis"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
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
                        <Select value={unitId} onValueChange={setUnitId}>
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
                                    <SelectItem key={u.id} value={String(u.id)}>
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
                        <Select value={status} onValueChange={setStatus}>
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
