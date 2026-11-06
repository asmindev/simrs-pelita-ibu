import { router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';

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
};

export function UnitFilters({ filters }: Props) {
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
        <form onSubmit={submit} className="mb-4 flex flex-wrap items-end gap-2">
            <div className="min-w-56 flex-1 space-y-1.5">
                <label htmlFor="unit-search" className="text-sm font-medium">
                    Cari unit
                </label>
                <Input
                    id="unit-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Kode atau nama unit"
                />
            </div>

            <div className="w-44 space-y-1.5">
                <label htmlFor="unit-type" className="text-sm font-medium">
                    Tipe
                </label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="unit-type">
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
            </div>

            <div className="w-44 space-y-1.5">
                <label htmlFor="unit-status" className="text-sm font-medium">
                    Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="unit-status">
                        <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua status</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit">Terapkan</Button>
            <Button type="button" variant="outline" onClick={reset}>
                Reset
            </Button>
        </form>
    );
}
