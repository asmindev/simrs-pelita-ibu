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

import type { WarehouseMovement } from '../../types/warehouse';

type Props = {
    movements: WarehouseMovement[];
};

const MOVE_TYPE_LABELS: Record<WarehouseMovement['type'], string> = {
    in: 'Masuk (In)',
    out: 'Keluar (Out)',
    transfer: 'Transfer',
    dispensing: 'Dispensing',
    adjustment: 'Penyesuaian',
    return: 'Retur',
    opname: 'Opname',
};

export function WarehouseMovementTable({ movements }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return movements;
        const q = search.toLowerCase();
        return movements.filter(
            (m) =>
                (m.reference_number &&
                    m.reference_number.toLowerCase().includes(q)) ||
                (m.product?.name && m.product.name.toLowerCase().includes(q)) ||
                (m.product_batch?.batch_number &&
                    m.product_batch.batch_number.toLowerCase().includes(q)) ||
                (m.reason && m.reason.toLowerCase().includes(q)),
        );
    }, [movements, search]);

    const columns = useMemo<DataTableColumn<WarehouseMovement>[]>(
        () => [
            {
                key: 'reference',
                header: 'Referensi & Waktu',
                render: (move) => (
                    <div className="space-y-0.5">
                        <div className="font-mono text-xs font-semibold text-foreground">
                            {move.reference_number ?? `MOV-${move.id}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            {formatDateTime(move.created_at)}
                        </div>
                    </div>
                ),
            },
            {
                key: 'type',
                header: 'Operasi',
                render: (move) => (
                    <Badge variant="outline" className="text-[11px]">
                        {MOVE_TYPE_LABELS[move.type] ?? move.type}
                    </Badge>
                ),
            },
            {
                key: 'product',
                header: 'Produk & Batch',
                render: (move) => (
                    <div className="space-y-0.5">
                        <div className="text-xs font-medium text-foreground">
                            {move.product?.name ?? '-'}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                            {move.product_batch?.batch_number ?? '-'}
                        </div>
                    </div>
                ),
            },
            {
                key: 'locations',
                header: 'Rute Lokasi',
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
                header: 'Kuantitas',
                className: 'text-right',
                render: (move) => (
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {move.quantity > 0
                            ? `+${move.quantity}`
                            : move.quantity}{' '}
                        {move.product?.unit_of_measure ?? ''}
                    </span>
                ),
            },
            {
                key: 'value',
                header: 'Nilai Valuasi',
                className: 'text-right',
                render: (move) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(move.total_value)}
                    </span>
                ),
            },
            {
                key: 'reason',
                header: 'Petugas & Keterangan',
                render: (move) => (
                    <div className="max-w-52 space-y-0.5">
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
        ],
        [],
    );

    return (
        <DataTable<WarehouseMovement>
            columns={columns}
            rows={filtered}
            rowKey={(move) => move.id}
            empty="Belum ada riwayat perpindahan stok di lokasi ini."
            toolbar={
                <TableToolbar
                    title="Riwayat Stock Moves Lokasi"
                    description="Mutasi masuk, keluar, transfer, dan penyesuaian yang melibatkan lokasi ini."
                    icon={ArrowLeftRight}
                    current={filtered.length}
                    total={movements.length}
                >
                    <div className="relative min-w-48 sm:w-64">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari referensi, produk, batch..."
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
