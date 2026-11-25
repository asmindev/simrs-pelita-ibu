import { ArrowLeftRight, ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

import type { StockMovement } from '../../types/stock';

type Props = {
    movements: StockMovement[];
};

const MOVE_TYPE_LABELS: Record<StockMovement['type'], string> = {
    in: 'Masuk (In)',
    out: 'Keluar (Out)',
    transfer: 'Transfer',
    dispensing: 'Dispensing',
    adjustment: 'Penyesuaian',
    return: 'Retur',
    opname: 'Opname',
};

export function BatchMovementTable({ movements }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return movements;
        const q = search.toLowerCase();
        return movements.filter(
            (m) =>
                (m.reference_number &&
                    m.reference_number.toLowerCase().includes(q)) ||
                (m.origin && m.origin.toLowerCase().includes(q)) ||
                (m.reason && m.reason.toLowerCase().includes(q)) ||
                (m.source_location?.name &&
                    m.source_location.name.toLowerCase().includes(q)) ||
                (m.destination_location?.name &&
                    m.destination_location.name.toLowerCase().includes(q)),
        );
    }, [movements, search]);

    const columns = useMemo<DataTableColumn<StockMovement>[]>(
        () => [
            {
                key: 'reference',
                header: 'Referensi',
                className: 'py-1.5',
                render: (move) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {move.reference_number ?? `MOV-${move.id}`}
                    </span>
                ),
            },
            {
                key: 'created_at',
                header: 'Waktu',
                className: 'py-1.5',
                render: (move) => (
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(move.created_at)}
                    </span>
                ),
            },
            {
                key: 'type',
                header: 'Operasi',
                className: 'py-1.5',
                render: (move) => (
                    <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[11px]"
                    >
                        {MOVE_TYPE_LABELS[move.type] ?? move.type}
                    </Badge>
                ),
            },
            {
                key: 'locations',
                header: 'Lokasi',
                className: 'py-1.5',
                render: (move) => (
                    <div className="flex items-center gap-1 text-xs">
                        <Badge
                            variant="outline"
                            className="px-1.5 py-0 font-mono text-[10px] font-normal"
                        >
                            {move.source_location?.code ?? 'EXT'}
                        </Badge>
                        <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                        <Badge
                            variant="outline"
                            className="px-1.5 py-0 font-mono text-[10px] font-normal"
                        >
                            {move.destination_location?.code ?? 'EXT'}
                        </Badge>
                    </div>
                ),
            },
            {
                key: 'quantity',
                header: 'Kuantitas',
                className: 'py-1.5 text-right',
                render: (move) => {
                    const isPositive = move.quantity > 0;
                    const isTransfer = move.type === 'transfer';

                    return (
                        <span
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
                            {move.product?.unit_of_measure ?? ''}
                        </span>
                    );
                },
            },
            {
                key: 'balance',
                header: 'Saldo',
                className: 'py-1.5 text-right',
                render: (move) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {move.balance_before} &rarr; {move.balance_after}
                    </span>
                ),
            },
            {
                key: 'value',
                header: 'Nilai',
                className: 'py-1.5 text-right',
                render: (move) => (
                    <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                        {formatCurrency(move.total_value)}
                    </span>
                ),
            },
            {
                key: 'user',
                header: 'Petugas',
                className: 'py-1.5',
                render: (move) => (
                    <span className="text-xs text-foreground">
                        {move.user?.name ?? 'Sistem'}
                    </span>
                ),
            },
            {
                key: 'reason',
                header: 'Keterangan',
                className: 'max-w-44 py-1.5',
                render: (move) => (
                    <span
                        className="block truncate text-xs text-muted-foreground"
                        title={move.reason ?? undefined}
                    >
                        {move.reason ?? '-'}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <DataTable<StockMovement>
            columns={columns}
            rows={filtered}
            rowKey={(move) => move.id}
            empty="Belum ada riwayat pergerakan stok untuk batch ini."
            toolbar={
                <TableToolbar
                    title="Riwayat Stock Moves Batch"
                    description="Catatan pergerakan masuk, transfer, dispensing, dan opname pada batch ini."
                    icon={ArrowLeftRight}
                    current={filtered.length}
                    total={movements.length}
                >
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari ref, lokasi, alasan..."
                            className="h-8 bg-background pl-8 text-xs"
                            aria-label="Cari riwayat stock move batch"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
