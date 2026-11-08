import { router } from '@inertiajs/react';
import { Receipt, Search } from 'lucide-react';
import type { FormEvent } from 'react';
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
        date: string;
    };
    current: number;
    total: number;
};

export function InvoiceFilters({ filters, current, total }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [date, setDate] = useState(filters.date || '');

    const activeFilterCount =
        (status !== 'all' ? 1 : 0) + (date !== '' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        status?: string;
        date?: string;
    }) {
        const queryParams: Record<string, string> = {};

        const s =
            nextParams && 'search' in nextParams ? nextParams.search : search;
        const st =
            nextParams && 'status' in nextParams ? nextParams.status : status;
        const d = nextParams && 'date' in nextParams ? nextParams.date : date;

        if (s) queryParams.search = s;
        if (st && st !== 'all') queryParams.status = st;
        if (d) queryParams.date = d;

        router.get(route('cashier.invoices.index'), queryParams, {
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
        setDate('');
        router.get(
            route('cashier.invoices.index'),
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
            title="Daftar Tagihan & Invoice"
            description="Pengelolaan dan penerimaan pembayaran layanan medis."
            icon={Receipt}
            current={current}
            total={total}
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="No. invoice, pasien, no. RM..."
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
                            <Label htmlFor="status-filter">
                                Status Tagihan
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    setStatus(val);
                                    executeFilter({ status: val });
                                }}
                            >
                                <SelectTrigger
                                    id="status-filter"
                                    className="bg-background"
                                >
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="draft">
                                        Menunggu Pembayaran
                                    </SelectItem>
                                    <SelectItem value="partially_paid">
                                        Sebagian Terbayar
                                    </SelectItem>
                                    <SelectItem value="paid">Lunas</SelectItem>
                                    <SelectItem value="voided">
                                        Dibatalkan (Void)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date-filter">Tanggal Tagihan</Label>
                            <Input
                                id="date-filter"
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    executeFilter({ date: e.target.value });
                                }}
                                className="bg-background"
                            />
                        </div>
                    </div>
                </FilterPopover>
            </form>
        </TableToolbar>
    );
}
