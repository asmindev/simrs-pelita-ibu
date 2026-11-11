import { History, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    ArrowDownRight,
    ArrowUpRight,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatDateTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

import type { Drug } from '../../types/drug';

type NonNullableMovement = NonNullable<Drug['stock_movements']>[number];

interface DrugStockMovementTableProps {
    movements?: Drug['stock_movements'];
    unitOfMeasure: string;
}

function getMovementTypeBadge(type: string) {
    switch (type) {
        case 'in':
            return (
                <Badge variant="default" className="gap-1 text-[10px]">
                    <ArrowDownRight className="size-3" />
                    Penerimaan Masuk
                </Badge>
            );
        case 'dispensing':
        case 'out':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-destructive/40 text-[10px] text-destructive"
                >
                    <ArrowUpRight className="size-3" />
                    Keluar / Resep
                </Badge>
            );
        case 'adjustment':
        case 'opname':
            return (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                    <SlidersHorizontal className="size-3" />
                    Penyesuaian (Opname)
                </Badge>
            );
        case 'return':
            return (
                <Badge variant="outline" className="gap-1 text-[10px]">
                    <RotateCcw className="size-3" />
                    Retur Obat
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-[10px]">
                    {type}
                </Badge>
            );
    }
}

export function DrugStockMovementTable({
    movements = [],
    unitOfMeasure,
}: DrugStockMovementTableProps) {
    const [search, setSearch] = useState('');

    const filteredMovements = useMemo(() => {
        if (!search.trim()) return movements;
        const q = search.toLowerCase();
        return movements.filter(
            (m) =>
                (m.drug_batch?.batch_number &&
                    m.drug_batch.batch_number.toLowerCase().includes(q)) ||
                (m.reason && m.reason.toLowerCase().includes(q)) ||
                (m.user?.name && m.user.name.toLowerCase().includes(q)) ||
                m.type.toLowerCase().includes(q),
        );
    }, [movements, search]);

    const columns = useMemo<DataTableColumn<NonNullableMovement>[]>(
        () => [
            {
                key: 'index',
                header: 'No.',
                className: 'w-12 text-center',
                render: (_, index) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {(index ?? 0) + 1}
                    </span>
                ),
            },
            {
                key: 'created_at',
                header: 'Tanggal & Waktu',
                render: (move) => (
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(move.created_at)}
                    </span>
                ),
            },
            {
                key: 'type',
                header: 'Jenis Mutasi',
                render: (move) => getMovementTypeBadge(move.type),
            },
            {
                key: 'batch',
                header: 'Batch Terkait',
                render: (move) => (
                    <span className="font-mono text-xs text-foreground">
                        {move.drug_batch?.batch_number ?? '-'}
                    </span>
                ),
            },
            {
                key: 'quantity',
                header: 'Kuantitas',
                className: 'text-right',
                render: (move) => {
                    const isPositive = move.quantity > 0;
                    return (
                        <span
                            className={`font-mono text-xs font-bold tabular-nums ${
                                isPositive ? 'text-primary' : 'text-destructive'
                            }`}
                        >
                            {isPositive ? `+${move.quantity}` : move.quantity}{' '}
                            {unitOfMeasure}
                        </span>
                    );
                },
            },
            {
                key: 'balance_before',
                header: 'Stok Sebelum',
                className: 'text-right',
                render: (move) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {move.balance_before.toLocaleString('id-ID')}{' '}
                        {unitOfMeasure}
                    </span>
                ),
            },
            {
                key: 'balance_after',
                header: 'Stok Sesudah',
                className: 'text-right',
                render: (move) => (
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {move.balance_after.toLocaleString('id-ID')}{' '}
                        {unitOfMeasure}
                    </span>
                ),
            },
            {
                key: 'user',
                header: 'Petugas / PIC',
                render: (move) => (
                    <span className="text-xs text-foreground">
                        {move.user?.name ?? '-'}
                    </span>
                ),
            },
            {
                key: 'reason',
                header: 'Keterangan',
                render: (move) => (
                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {move.reason || '-'}
                    </span>
                ),
            },
        ],
        [unitOfMeasure],
    );

    return (
        <DataTable<NonNullableMovement>
            columns={columns}
            rows={filteredMovements}
            rowKey={(move) => move.id}
            empty="Belum ada riwayat mutasi / stock move untuk obat ini."
            toolbar={
                <TableToolbar
                    title="Riwayat Mutasi & Pergerakan Stok"
                    description="Catatan audit penerimaan, pengeluaran resep, penyesuaian opname, dan retur."
                    icon={History}
                    current={filteredMovements.length}
                    total={movements.length}
                >
                    <div className="relative min-w-48 sm:w-64">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari mutasi, batch, keterangan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 bg-background pl-8 text-xs"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
