import { router } from '@inertiajs/react';
import { Hospital, Search } from 'lucide-react';
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
    };
    current: number;
    total: number;
    actions?: ReactNode;
};

export function AdmissionFilters({ filters, current, total, actions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'active');

    const activeFilterCount = status !== 'all' && status !== 'active' ? 1 : 0;

    function executeFilter(nextParams?: { search?: string; status?: string }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;

        router.get(
            route('inpatient.admissions.index'),
            {
                search: s || undefined,
                status: st === 'all' ? undefined : st,
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
        setStatus('active');
        executeFilter({ status: 'active' });
    }

    function resetAll() {
        setSearch('');
        setStatus('active');

        router.get(
            route('inpatient.admissions.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Pasien Rawat Inap"
            description="Pantau pasien yang sedang dirawat, histori admisi, dan alokasi tempat tidur."
            icon={Hospital}
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
                        id="admission-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="No. Admisi, Nama Pasien, No. RM..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari admisi rawat inap"
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
                    title="Filter Admisi"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="filter-admission-status"
                            className="text-xs font-medium"
                        >
                            Status Rawat Inap
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                id="filter-admission-status"
                                className="h-8 bg-background text-xs"
                            >
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    Sedang Dirawat (Aktif)
                                </SelectItem>
                                <SelectItem value="discharged">
                                    Sudah Pulang
                                </SelectItem>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </FilterPopover>

                {(activeFilterCount > 0 ||
                    search !== '' ||
                    status !== 'active') && (
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
