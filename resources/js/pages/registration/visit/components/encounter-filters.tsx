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
                className="flex flex-wrap items-center gap-2"
            >
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 w-36 text-xs"
                />

                <Select value={unitId} onValueChange={setUnitId}>
                    <SelectTrigger className="h-9 w-40 text-xs">
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
                    <SelectTrigger className="h-9 w-36 text-xs">
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

                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari pasien / No. RM..."
                        className="h-9 w-48 pl-8 text-xs"
                    />
                </div>

                <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    className="h-9"
                >
                    Filter
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={reset}
                    className="h-9"
                >
                    Reset
                </Button>
            </form>
        </TableToolbar>
    );
}
