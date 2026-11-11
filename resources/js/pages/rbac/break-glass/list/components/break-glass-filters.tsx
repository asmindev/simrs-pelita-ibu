import { router } from '@inertiajs/react';
import { Search, ShieldAlert } from 'lucide-react';
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

export function BreakGlassFilters({ filters, current, total, actions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const activeFilterCount = status !== 'all' && status !== '' ? 1 : 0;

    function executeFilter(nextParams?: { search?: string; status?: string }) {
        const queryParams: Record<string, string> = {};

        const s =
            nextParams && 'search' in nextParams ? nextParams.search : search;
        const st =
            nextParams && 'status' in nextParams ? nextParams.status : status;

        if (s) queryParams.search = s;
        if (st && st !== 'all') queryParams.status = st;

        router.get(route('rbac.break-glass.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function handleSearchSubmit(e: FormEvent) {
        e.preventDefault();
        executeFilter();
    }

    function handleReset() {
        setSearch('');
        setStatus('all');
        router.get(
            route('rbac.break-glass.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <TableToolbar
            title="Daftar Akses Darurat (Break-Glass)"
            description="Monitoring pembukaan akses darurat rekam medis dan peninjauan alasan klinis."
            icon={ShieldAlert}
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
                        placeholder="Nama dokter, pasien, atau RM..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 bg-background pl-8 text-xs"
                    />
                </div>
                <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                >
                    Cari
                </Button>
                <FilterPopover
                    activeCount={activeFilterCount}
                    onReset={handleReset}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status-filter">Status Review</Label>
                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    setStatus(val);
                                    executeFilter({ status: val });
                                }}
                            >
                                <SelectTrigger
                                    id="status-filter"
                                    className="bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Sedang Aktif
                                    </SelectItem>
                                    <SelectItem value="pending_review">
                                        Perlu Review
                                    </SelectItem>
                                    <SelectItem value="reviewed">
                                        Sudah Ditinjau
                                    </SelectItem>
                                    <SelectItem value="revoked">
                                        Dicabut
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </FilterPopover>
            </form>
        </TableToolbar>
    );
}
