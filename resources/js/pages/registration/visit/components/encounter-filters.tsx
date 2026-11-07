import { router } from '@inertiajs/react';
import { ClipboardList, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import type { EncounterFilters as Filters } from '../../types/registration';

type Props = {
    filters: Filters;
    units: Array<{ id: number; name: string; code: string }>;
    current: number;
    total: number;
};

export function EncounterFiltersComponent({
    filters,
    units,
    current,
    total,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status || 'all');
    const [unitId, setUnitId] = useState<string>(
        filters.unit_id ? String(filters.unit_id) : 'all',
    );
    const [date, setDate] = useState(filters.date);

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            route('registration.visits.index'),
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
                unit_id: unitId === 'all' ? undefined : unitId,
                date: date || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function reset() {
        setSearch('');
        setStatus('all');
        setUnitId('all');
        const today = new Date().toISOString().slice(0, 10);
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
        >
            <form
                onSubmit={submit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-8 w-36 bg-background text-xs"
                    aria-label="Filter tanggal"
                />

                <Select value={unitId} onValueChange={setUnitId}>
                    <SelectTrigger
                        className="h-8 w-40 bg-background text-xs"
                        aria-label="Filter unit"
                    >
                        <SelectValue placeholder="Semua Unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Unit</SelectItem>
                        {units.map((unit) => (
                            <SelectItem key={unit.id} value={String(unit.id)}>
                                {unit.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                        className="h-8 w-36 bg-background text-xs"
                        aria-label="Filter status"
                    >
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="arrived">Menunggu</SelectItem>
                        <SelectItem value="in_consultation">
                            Dilayani
                        </SelectItem>
                        <SelectItem value="finished">Selesai</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                </Select>

                <div className="relative min-w-44 flex-1 sm:w-52 sm:flex-none">
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
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={reset}
                    className="h-8 shrink-0 text-xs"
                >
                    Reset
                </Button>
            </form>
        </TableToolbar>
    );
}
