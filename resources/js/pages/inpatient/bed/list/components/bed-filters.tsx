import { router } from '@inertiajs/react';
import { BedDouble, Search } from 'lucide-react';
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

type Props = {
    filters: {
        search: string;
        status: string;
        class: string;
    };
    current: number;
    total: number;
    actions?: ReactNode;
};

export function BedFilters({ filters, current, total, actions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [bedClass, setBedClass] = useState(filters.class || 'all');

    const activeFilterCount =
        (status !== 'all' && status !== '' ? 1 : 0) +
        (bedClass !== 'all' && bedClass !== '' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        status?: string;
        class?: string;
    }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;
        const c = nextParams?.class !== undefined ? nextParams.class : bedClass;

        router.get(
            route('inpatient.beds.index'),
            {
                search: s || undefined,
                status: st === 'all' ? undefined : st,
                class: c === 'all' ? undefined : c,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function applyPopoverFilter() {
        executeFilter();
    }

    function resetPopoverFilters() {
        setStatus('all');
        setBedClass('all');
        executeFilter({ status: 'all', class: 'all' });
    }

    function resetAll() {
        setSearch('');
        setStatus('all');
        setBedClass('all');

        router.get(
            route('inpatient.beds.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Bed & Kamar"
            description="Katalog tempat tidur, status ketersediaan, dan alokasi rawat inap."
            icon={BedDouble}
            current={current}
            total={total}
            actions={actions}
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="bed-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nama Ruangan, No. Bed..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari tempat tidur"
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
                    title="Filter Bed"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="filter-bed-status"
                            className="text-xs font-medium"
                        >
                            Status Ketersediaan
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                id="filter-bed-status"
                                className="h-8 bg-background text-xs"
                            >
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="available">
                                    Tersedia (Kosong)
                                </SelectItem>
                                <SelectItem value="occupied">
                                    Terisi (Pasien)
                                </SelectItem>
                                <SelectItem value="maintenance">
                                    Perawatan (Maintenance)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="filter-bed-class"
                            className="text-xs font-medium"
                        >
                            Kelas Kamar
                        </Label>
                        <Select value={bedClass} onValueChange={setBedClass}>
                            <SelectTrigger
                                id="filter-bed-class"
                                className="h-8 bg-background text-xs"
                            >
                                <SelectValue placeholder="Semua Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kelas</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="class_1">Kelas 1</SelectItem>
                                <SelectItem value="class_2">Kelas 2</SelectItem>
                                <SelectItem value="class_3">Kelas 3</SelectItem>
                                <SelectItem value="icu">ICU</SelectItem>
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
                        onClick={resetAll}
                    >
                        Reset
                    </Button>
                )}
            </form>
        </TableToolbar>
    );
}
