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

import type { DoctorFilters as Filters } from '../types/doctor';

type Props = {
    filters: Filters;
};

export function DoctorFilters({ filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status || 'all');

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            route('master-data.doctors.index'),
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function reset() {
        setSearch('');
        setStatus('all');

        router.get(
            route('master-data.doctors.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <form onSubmit={submit} className="mb-4 flex flex-wrap items-end gap-2">
            <div className="min-w-56 flex-1 space-y-1.5">
                <label htmlFor="doctor-search" className="text-sm font-medium">
                    Cari dokter
                </label>
                <Input
                    id="doctor-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nama, kode, spesialisasi, atau SIP"
                />
            </div>

            <div className="w-44 space-y-1.5">
                <label htmlFor="doctor-status" className="text-sm font-medium">
                    Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="doctor-status">
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
