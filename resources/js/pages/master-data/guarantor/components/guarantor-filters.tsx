import { router } from '@inertiajs/react';
import { Search, ShieldCheck } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
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

import {
    guarantorTypeOptions,
    type GuarantorFilters as Filters,
} from '../types/guarantor';

type Props = {
    filters: Filters;
    current: number;
    total: number;
    actions?: ReactNode;
};

export function GuarantorFilters({ filters, current, total, actions }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [type, setType] = useState(filters.type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            route('master-data.guarantors.index'),
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
            route('master-data.guarantors.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Penjamin"
            description="Kelola penjamin pembayaran pasien (BPJS, Umum, Asuransi, Perusahaan)."
            icon={ShieldCheck}
            current={current}
            total={total}
            actions={
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={reset}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Reset
                    </Button>
                    {actions}
                </div>
            }
        >
            <form
                onSubmit={submit}
                className="flex flex-1 flex-wrap items-center gap-2"
            >
                <div className="relative min-w-48 flex-1 sm:max-w-xs">
                    <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari kode atau nama..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-8 bg-background pl-8 text-xs"
                    />
                </div>

                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-8 w-40 bg-background text-xs">
                        <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua tipe</SelectItem>
                        {guarantorTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-8 w-32 bg-background text-xs">
                        <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua status</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                </Select>

                <Button type="submit" size="sm" className="h-8 text-xs">
                    Terapkan
                </Button>
            </form>
        </TableToolbar>
    );
}
