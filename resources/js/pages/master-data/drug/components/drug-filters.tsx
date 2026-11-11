import { router } from '@inertiajs/react';
import { Pill, Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { FilterPopover } from '@/shared/components/filter-popover';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
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
    actions?: ReactNode;
};

export function DrugFilters({
    filters,
    categories,
    current,
    total,
    actions,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const activeFilterCount =
        (categoryId !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        categoryId?: string;
        status?: string;
    }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const c =
            nextParams?.categoryId !== undefined
                ? nextParams.categoryId
                : categoryId;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;

        router.get(
            route('master-data.drugs.index'),
            {
                search: s || undefined,
                category_id: c === 'all' ? undefined : c,
                status: st === 'all' ? undefined : st,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function applyPopoverFilter() {
        executeFilter();
    }

    function resetPopoverFilters() {
        setCategoryId('all');
        setStatus('all');
        executeFilter({ categoryId: 'all', status: 'all' });
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
            actions={actions}
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

                <Button
                    type="submit"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                >
                    Cari
                </Button>

                <FilterPopover
                    title="Filter Obat"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="drug-category"
                            className="text-xs font-medium"
                        >
                            Kategori Obat
                        </Label>
                        <Select
                            value={categoryId}
                            onValueChange={setCategoryId}
                        >
                            <SelectTrigger
                                id="drug-category"
                                className="h-8 bg-background text-xs"
                                aria-label="Kategori obat"
                            >
                                <SelectValue placeholder="Semua kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua kategori
                                </SelectItem>
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
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="drug-status"
                            className="text-xs font-medium"
                        >
                            Status Obat
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                id="drug-status"
                                className="h-8 bg-background text-xs"
                                aria-label="Status obat"
                            >
                                <SelectValue placeholder="Semua status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua status
                                </SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">
                                    Nonaktif
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </FilterPopover>

                {(activeFilterCount > 0 || search !== '') && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={reset}
                    >
                        Reset
                    </Button>
                )}
            </form>
        </TableToolbar>
    );
}
