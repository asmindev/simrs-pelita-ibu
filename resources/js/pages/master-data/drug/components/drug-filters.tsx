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

    const hasActiveFilters =
        search !== '' || categoryId !== 'all' || status !== 'all';

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari nama obat, kode, atau produsen..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
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
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button type="submit" variant="secondary">
                        Filter
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={reset}
                            className="text-muted-foreground"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            <TableToolbar
                icon={Pill}
                title="Katalog Obat"
                current={current}
                total={total}
            />
        </form>
    );
}
