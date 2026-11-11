import { router } from '@inertiajs/react';
import { Search, UserCheck } from 'lucide-react';
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
        action: string;
        date: string;
    };
    current: number;
    total: number;
    actions?: ReactNode;
};

export function PatientAccessFilters({
    filters,
    current,
    total,
    actions,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || 'all');
    const [date, setDate] = useState(filters.date || '');

    const activeFilterCount =
        (action !== 'all' && action !== '' ? 1 : 0) + (date !== '' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        action?: string;
        date?: string;
    }) {
        const queryParams: Record<string, string> = {};

        const s =
            nextParams && 'search' in nextParams ? nextParams.search : search;
        const a =
            nextParams && 'action' in nextParams ? nextParams.action : action;
        const d = nextParams && 'date' in nextParams ? nextParams.date : date;

        if (s) queryParams.search = s;
        if (a && a !== 'all') queryParams.action = a;
        if (d) queryParams.date = d;

        router.get(route('audit.patient-access.index'), queryParams, {
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
        setAction('all');
        setDate('');
        router.get(
            route('audit.patient-access.index'),
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
            title="Log Akses Rekam Medis Pasien"
            description="Audit kepatuhan privasi (UU PDP): pemantauan pembukaan data sensitif pasien."
            icon={UserCheck}
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
                        placeholder="Nama pasien, RM, atau user..."
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
                            <Label htmlFor="action-filter">Tipe Akses</Label>
                            <Select
                                value={action}
                                onValueChange={(val) => {
                                    setAction(val);
                                    executeFilter({ action: val });
                                }}
                            >
                                <SelectTrigger
                                    id="action-filter"
                                    className="bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih Aksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Aksi
                                    </SelectItem>
                                    <SelectItem value="view">
                                        Melihat (View)
                                    </SelectItem>
                                    <SelectItem value="export">
                                        Ekspor Data (Export)
                                    </SelectItem>
                                    <SelectItem value="break_glass">
                                        Break-Glass Darurat
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date-filter">Tanggal</Label>
                            <Input
                                id="date-filter"
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    executeFilter({ date: e.target.value });
                                }}
                                className="bg-background text-xs"
                            />
                        </div>
                    </div>
                </FilterPopover>
            </form>
        </TableToolbar>
    );
}
