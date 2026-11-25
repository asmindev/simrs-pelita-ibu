import { router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowRight,
    ArrowUpRight,
    Plus,
    RotateCcw,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { FilterPopover } from '@/shared/components/filter-popover';
import { Pagination } from '@/shared/components/pagination';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
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

import type {
    PaginatedData,
    StockLocation,
    StockMovement,
    StockMovementType,
} from '../../types/pharmacy';

type Props = {
    movements: PaginatedData<StockMovement>;
    locations: StockLocation[];
    filters: {
        move_search: string;
        move_type: string;
        move_location_id: string;
    };
    onCreateMoveClick: () => void;
};

function getMovementTypeBadge(type: StockMovementType) {
    switch (type) {
        case 'in':
            return (
                <Badge variant="default" className="gap-1 text-[11px]">
                    <ArrowDownRight className="size-3" />
                    Masuk (In)
                </Badge>
            );
        case 'out':
        case 'dispensing':
            return (
                <Badge variant="destructive" className="gap-1 text-[11px]">
                    <ArrowUpRight className="size-3" />
                    {type === 'dispensing' ? 'Dispensing' : 'Keluar (Out)'}
                </Badge>
            );
        case 'transfer':
            return (
                <Badge variant="secondary" className="gap-1 text-[11px]">
                    <ArrowLeftRight className="size-3" />
                    Transfer
                </Badge>
            );
        case 'adjustment':
        case 'opname':
            return (
                <Badge variant="outline" className="gap-1 text-[11px]">
                    <SlidersHorizontal className="size-3" />
                    Opname
                </Badge>
            );
        case 'return':
            return (
                <Badge variant="secondary" className="gap-1 text-[11px]">
                    <RotateCcw className="size-3" />
                    Retur
                </Badge>
            );
    }
}

export function StockMoveTable({
    movements,
    locations,
    filters,
    onCreateMoveClick,
}: Props) {
    const [search, setSearch] = useState(filters.move_search || '');
    const [moveType, setMoveType] = useState(filters.move_type || 'all');
    const [locationId, setLocationId] = useState(
        filters.move_location_id || 'all',
    );

    const activeFilterCount =
        (moveType !== 'all' ? 1 : 0) + (locationId !== 'all' ? 1 : 0);

    function executeFilter(next?: {
        search?: string;
        moveType?: string;
        locationId?: string;
    }) {
        const s = next?.search !== undefined ? next.search : search;
        const t = next?.moveType !== undefined ? next.moveType : moveType;
        const loc =
            next?.locationId !== undefined ? next.locationId : locationId;

        router.get(
            route('pharmacy.stock.index'),
            {
                tab: 'moves',
                move_search: s || undefined,
                move_type: t === 'all' ? undefined : t,
                move_location_id: loc === 'all' ? undefined : loc,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function handleSearchSubmit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function resetFilters() {
        setMoveType('all');
        setLocationId('all');
        executeFilter({ moveType: 'all', locationId: 'all' });
    }

    const columns: DataTableColumn<StockMovement>[] = [
        {
            key: 'reference',
            header: 'Referensi & Waktu',
            render: (move) => (
                <div className="space-y-0.5">
                    <div className="font-mono text-xs font-semibold text-foreground">
                        {move.reference_number ?? `MOV-${move.id}`}
                    </div>
                    {move.origin && (
                        <div className="font-mono text-[10px] text-primary">
                            Dok: {move.origin}
                        </div>
                    )}
                    <div className="text-[11px] text-muted-foreground">
                        {formatDateTime(move.created_at)}
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Operasi',
            render: (move) => getMovementTypeBadge(move.type),
        },
        {
            key: 'drug_batch',
            header: 'Obat & Batch',
            render: (move) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {move.drug?.name ?? '-'}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                        {move.drug_batch?.batch_number ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'locations',
            header: 'Perpindahan Lokasi',
            render: (move) => (
                <div className="flex flex-wrap items-center gap-1 text-xs">
                    <Badge
                        variant="outline"
                        className="font-mono text-[10px] font-normal"
                    >
                        {move.source_location?.code ?? 'EXT'}
                    </Badge>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <Badge
                        variant="outline"
                        className="font-mono text-[10px] font-normal"
                    >
                        {move.destination_location?.code ?? 'EXT'}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'quantity',
            header: 'Kuantitas & Saldo',
            className: 'text-right',
            render: (move) => {
                const isPositive = move.quantity > 0;
                const isTransfer = move.type === 'transfer';

                return (
                    <div className="space-y-0.5">
                        <div
                            className={`font-mono text-xs font-bold tabular-nums ${
                                isTransfer
                                    ? 'text-foreground'
                                    : isPositive
                                      ? 'text-primary'
                                      : 'text-destructive'
                            }`}
                        >
                            {isTransfer
                                ? move.quantity
                                : isPositive
                                  ? `+${move.quantity}`
                                  : move.quantity}{' '}
                            {move.drug?.unit_of_measure ?? ''}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                            {move.balance_before} &rarr; {move.balance_after}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'value',
            header: 'Nilai Valuasi',
            className: 'text-right',
            render: (move) => (
                <div className="space-y-0.5">
                    <div className="font-mono text-xs font-semibold text-foreground tabular-nums">
                        {formatCurrency(move.total_value)}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                        @ {formatCurrency(move.unit_cost)}
                    </div>
                </div>
            ),
        },
        {
            key: 'reason',
            header: 'Petugas & Keterangan',
            render: (move) => (
                <div className="max-w-56 space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {move.user?.name ?? 'Sistem'}
                    </div>
                    {move.reason && (
                        <div className="truncate text-[11px] text-muted-foreground">
                            {move.reason}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable<StockMovement>
            columns={columns}
            rows={movements.data}
            rowKey={(move) => move.id}
            empty="Belum ada riwayat stock move yang sesuai filter."
            toolbar={
                <TableToolbar
                    title="Riwayat Stock Move (Odoo Ledger)"
                    description="Pelacakan pergerakan obat antar lokasi sumber dan tujuan beserta nilai per unit."
                    icon={ArrowLeftRight}
                    current={movements.data.length}
                    total={movements.total}
                    actions={
                        <Can permission="pharmacy.stock.adjust">
                            <Button
                                size="sm"
                                onClick={onCreateMoveClick}
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Plus className="size-3.5" />
                                Catat Stock Move
                            </Button>
                        </Can>
                    }
                >
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
                    >
                        <div className="relative min-w-44 flex-1 sm:w-56 sm:flex-none">
                            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="move-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ref, Obat, Batch, Origin..."
                                className="h-8 bg-background pl-8 text-xs"
                                aria-label="Cari riwayat stock move"
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
                            title="Filter Stock Move"
                            activeCount={activeFilterCount}
                            onApply={() => executeFilter()}
                            onReset={resetFilters}
                        >
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        Jenis Operasi
                                    </Label>
                                    <Select
                                        value={moveType}
                                        onValueChange={setMoveType}
                                    >
                                        <SelectTrigger className="h-8 bg-background text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Operasi
                                            </SelectItem>
                                            <SelectItem value="in">
                                                Penerimaan (In)
                                            </SelectItem>
                                            <SelectItem value="out">
                                                Pengeluaran (Out)
                                            </SelectItem>
                                            <SelectItem value="transfer">
                                                Transfer Lokasi
                                            </SelectItem>
                                            <SelectItem value="dispensing">
                                                Dispensing Resep
                                            </SelectItem>
                                            <SelectItem value="adjustment">
                                                Penyesuaian / Opname
                                            </SelectItem>
                                            <SelectItem value="return">
                                                Retur Pasien
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        Lokasi Terlibat
                                    </Label>
                                    <Select
                                        value={locationId}
                                        onValueChange={setLocationId}
                                    >
                                        <SelectTrigger className="h-8 bg-background text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Lokasi
                                            </SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem
                                                    key={loc.id}
                                                    value={String(loc.id)}
                                                >
                                                    {loc.code} — {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </FilterPopover>
                    </form>
                </TableToolbar>
            }
            footer={
                <Pagination
                    links={movements.links}
                    from={movements.from}
                    to={movements.to}
                    total={movements.total}
                />
            }
        />
    );
}
