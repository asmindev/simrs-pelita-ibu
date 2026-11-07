import { router } from '@inertiajs/react';
import { Receipt, Search } from 'lucide-react';
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

import {
    tariffCategoryOptions,
    type TariffFilters as Filters,
    type UnitOption,
} from '../types/tariff';

type Props = {
    filters: Filters;
    units: UnitOption[];
    current: number;
    total: number;
};

export function TariffFilters({ filters, units, current, total }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [category, setCategory] = useState(filters.category || 'all');
    const [unitId, setUnitId] = useState(filters.unit_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            route('master-data.tariffs.index'),
            {
                search: search || undefined,
                category: category === 'all' ? undefined : category,
                unit_id: unitId === 'all' ? undefined : unitId,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function reset() {
        setSearch('');
        setCategory('all');
        setUnitId('all');
        setStatus('all');

        router.get(
            route('master-data.tariffs.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Tarif & Layanan"
            description="Kelola tarif konsultasi, tindakan medis, laboratorium, dan penunjang."
            icon={Receipt}
            current={current}
            total={total}
            actions={
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                    Reset
                </Button>
            }
        >
            <form
                onSubmit={submit}
                className="flex flex-1 flex-wrap items-center gap-2"
            >
                <div className="relative min-w-44 flex-1 sm:max-w-xs">
                    <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari kode atau nama tarif..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-8 pl-8 text-xs"
                    />
                </div>

                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua kategori</SelectItem>
                        {tariffCategoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={unitId} onValueChange={setUnitId}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue placeholder="Semua unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua unit</SelectItem>
                        {units.map((unit) => (
                            <SelectItem key={unit.id} value={String(unit.id)}>
                                {unit.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-8 w-32 text-xs">
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
