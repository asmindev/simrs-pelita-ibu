import { router } from '@inertiajs/react';
import { Building2, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

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

import { unitTypeOptions, type UnitFilters as Filters } from '../types/unit';

type Props = {
    filters: Filters;
    current: number;
    total: number;
};

export function UnitFilters({ filters, current, total }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [type, setType] = useState(filters.type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            route('master-data.units.index'),
            {
                search: search || undefined,
                type: type === 'all' ? undefined : type,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function reset() {
        setSearch('');
        setType('all');
        setStatus('all');

        router.get(
            route('master-data.units.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Unit"
            description="Poli, ruang rawat, laboratorium, radiologi, dan farmasi."
            icon={Building2}
            current={current}
            total={total}
        >
            <form
                onSubmit={submit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="unit-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Kode atau nama unit"
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari unit"
                    />
                </div>

                <Select value={type} onValueChange={setType}>
                    <SelectTrigger
                        id="unit-type"
                        className="h-8 w-36 bg-background text-xs"
                        aria-label="Tipe unit"
                    >
                        <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua tipe</SelectItem>
                        {unitTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                        id="unit-status"
                        className="h-8 w-36 bg-background text-xs"
                        aria-label="Status unit"
                    >
                        <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua status</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    type="submit"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                >
                    Cari
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                    onClick={reset}
                >
                    Reset
                </Button>
            </form>
        </TableToolbar>
    );
}
