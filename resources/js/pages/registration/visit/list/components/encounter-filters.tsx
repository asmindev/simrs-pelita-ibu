import { router } from '@inertiajs/react';
import { ClipboardList, Search } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';

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

import type { EncounterFilters as Filters } from '../../../types/registration';

type Props = {
    filters: Filters;
    units: Array<{ id: number; name: string; code: string }>;
    current: number;
    total: number;
    actions?: ReactNode;
};

export function EncounterFiltersComponent({
    filters,
    units,
    current,
    total,
    actions,
}: Props) {
    const today = new Date().toISOString().slice(0, 10);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [unitId, setUnitId] = useState<string>(
        filters.unit_id ? String(filters.unit_id) : 'all',
    );
    const [date, setDate] = useState(filters.date || today);

    const activeFilterCount =
        (status !== 'all' ? 1 : 0) +
        (unitId !== 'all' ? 1 : 0) +
        (date !== today ? 1 : 0);

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
            route('registration.visits.index'),
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
        setDate(today);
        executeFilter({ status: 'all', unitId: 'all', date: today });
    }

    function resetAll() {
        setSearch('');
        setStatus('all');
        setUnitId('all');
        setDate(today);

        router.get(
            route('registration.visits.index'),
            { date: today },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Kunjungan"
            description="Kunjungan pasien rawat jalan dan gawat darurat."
            icon={ClipboardList}
            current={current}
            total={total}
            actions={actions}
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari pasien / No. RM..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari kunjungan"
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
                    title="Filter Kunjungan Pasien"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="reg-filter-date"
                            className="text-xs font-medium"
                        >
                            Tanggal Kunjungan
                        </Label>
                        <Input
                            id="reg-filter-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-8 bg-background text-xs"
                            aria-label="Filter tanggal"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="reg-filter-unit"
                            className="text-xs font-medium"
                        >
                            Unit / Poliklinik
                        </Label>
                        <Select value={unitId} onValueChange={setUnitId}>
                            <SelectTrigger
                                id="reg-filter-unit"
                                className="h-8 bg-background text-xs"
                                aria-label="Filter unit"
                            >
                                <SelectValue placeholder="Semua Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Unit</SelectItem>
                                {units.map((unit) => (
                                    <SelectItem
                                        key={unit.id}
                                        value={String(unit.id)}
                                    >
                                        {unit.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="reg-filter-status"
                            className="text-xs font-medium"
                        >
                            Status Kunjungan
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                id="reg-filter-status"
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
                                    Dilayani
                                </SelectItem>
                                <SelectItem value="finished">
                                    Selesai
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Dibatalkan
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
