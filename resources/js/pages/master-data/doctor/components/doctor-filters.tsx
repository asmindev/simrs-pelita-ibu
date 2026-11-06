import { router } from '@inertiajs/react';
import { Search, Stethoscope } from 'lucide-react';
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

import type { DoctorFilters as Filters } from '../types/doctor';

type Props = {
    filters: Filters;
    current: number;
    total: number;
};

export function DoctorFilters({ filters, current, total }: Props) {
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
        <TableToolbar
            title="Daftar Dokter"
            description="Profil dokter dan nomor izin praktik."
            icon={Stethoscope}
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
                        id="doctor-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Nama, kode, spesialisasi, atau SIP"
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari dokter"
                    />
                </div>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                        id="doctor-status"
                        className="h-8 w-36 bg-background text-xs"
                        aria-label="Status dokter"
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
