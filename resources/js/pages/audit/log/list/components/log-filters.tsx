import { router } from '@inertiajs/react';
import { FileText, Search } from 'lucide-react';
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
        log_name: string;
        date: string;
    };
    availableLogNames: string[];
    current: number;
    total: number;
    actions?: ReactNode;
};

export function LogFilters({
    filters,
    availableLogNames,
    current,
    total,
    actions,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [logName, setLogName] = useState(filters.log_name || 'all');
    const [date, setDate] = useState(filters.date || '');

    const activeFilterCount =
        (logName !== 'all' && logName !== '' ? 1 : 0) + (date !== '' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        log_name?: string;
        date?: string;
    }) {
        const queryParams: Record<string, string> = {};

        const s =
            nextParams && 'search' in nextParams ? nextParams.search : search;
        const ln =
            nextParams && 'log_name' in nextParams
                ? nextParams.log_name
                : logName;
        const d = nextParams && 'date' in nextParams ? nextParams.date : date;

        if (s) queryParams.search = s;
        if (ln && ln !== 'all') queryParams.log_name = ln;
        if (d) queryParams.date = d;

        router.get(route('audit.logs.index'), queryParams, {
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
        setLogName('all');
        setDate('');
        router.get(
            route('audit.logs.index'),
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
            title="Audit Trail Log Aktivitas"
            description="Rekaman jejak aktivitas sistem, perubahan data, dan tindakan sensitif."
            icon={FileText}
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
                        placeholder="Deskripsi aktivitas atau user..."
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
                            <Label htmlFor="module-filter">Modul Log</Label>
                            <Select
                                value={logName}
                                onValueChange={(val) => {
                                    setLogName(val);
                                    executeFilter({ log_name: val });
                                }}
                            >
                                <SelectTrigger
                                    id="module-filter"
                                    className="bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih Modul" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Modul
                                    </SelectItem>
                                    {availableLogNames.map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
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
