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
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;
        const d = nextParams?.date !== undefined ? nextParams.date : date;

        router.get(
            route('cashier.invoices.index'),
            {
                search: s || undefined,
                status: st === 'all' ? undefined : st,
                date: d || undefined,
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
        setDate('');
        executeFilter({ status: 'all', date: '' });
    }

    function resetAll() {
        setSearch('');
        setStatus('all');
        setDate('');

        router.get(
            route('cashier.invoices.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Tagihan Kasir"
            description="Pengelolaan tagihan kunjungan pasien, penerimaan pembayaran langsung, dan kuitansi."
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
                        id="invoice-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="No. Invoice, Pasien, No. RM..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari tagihan"
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
                    title="Filter Tagihan"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="inv-filter-date"
                            className="text-xs font-medium"
                        >
                            Tanggal Tagihan
                        </Label>
                        <Input
                            id="inv-filter-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-8 bg-background text-xs"
                            aria-label="Filter tanggal"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="inv-filter-status"
                            className="text-xs font-medium"
                        >
                            Status Tagihan
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                id="inv-filter-status"
                                className="h-8 bg-background text-xs"
                                aria-label="Filter status tagihan"
                            >
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="draft">
                                    Menunggu Pembayaran (Draft)
                                </SelectItem>
                                <SelectItem value="finalized">
                                    Siap Bayar
                                </SelectItem>
                                <SelectItem value="partially_paid">
                                    Sebagian Terbayar
                                </SelectItem>
                                <SelectItem value="paid">
                                    Lunas (Paid)
                                </SelectItem>
                                <SelectItem value="voided">
                                    Dibatalkan (Void)
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
                        onClick={resetAll}
                    >
                        Reset
                    </Button>
                )}
            </form>
        </TableToolbar>
    );
}
