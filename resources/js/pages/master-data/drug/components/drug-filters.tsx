import { router } from '@inertiajs/react';
import { Pill, Search } from 'lucide-react';
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

import type { DrugCategory, DrugFilters as Filters } from '../types/drug';

type Props = {
    filters: Filters;
    categories: DrugCategory[];
    current: number;
    total: number;
};

export function DrugFilters({ filters, categories, current, total }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            route('master-data.drugs.index'),
            {
                search: search || undefined,
                category_id: categoryId === 'all' ? undefined : categoryId,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function reset() {
        setSearch('');
        setCategoryId('all');
        setStatus('all');

        router.get(
            route('master-data.drugs.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Katalog Obat"
            description="Manajemen data master obat, sediaan, golongan, dan harga dasar."
            icon={Pill}
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
                        id="drug-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Nama, kode, atau produsen"
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari obat"
                    />
                </div>

                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger
                        id="drug-category"
                        className="h-8 w-36 bg-background text-xs"
                        aria-label="Kategori obat"
                    >
                        <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua kategori</SelectItem>
                        {categories.map((category) => (
                            <SelectItem
                                key={category.id}
                                value={String(category.id)}
                            >
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                        id="drug-status"
                        className="h-8 w-32 bg-background text-xs"
                        aria-label="Status obat"
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
