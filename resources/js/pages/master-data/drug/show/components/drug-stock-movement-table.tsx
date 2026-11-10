import {
    ArrowDownRight,
    ArrowUpRight,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react';

import { formatDateTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type { Drug } from '../../types/drug';

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
    movements,
    unitOfMeasure,
}: DrugStockMovementTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs">
                            No.
                        </TableHead>
                        <TableHead className="text-xs">
                            Tanggal & Waktu
                        </TableHead>
                        <TableHead className="text-xs">Jenis Mutasi</TableHead>
                        <TableHead className="text-xs">Batch Terkait</TableHead>
                        <TableHead className="text-right text-xs">
                            Kuantitas
                        </TableHead>
                        <TableHead className="text-right text-xs">
                            Stok Sebelum
                        </TableHead>
                        <TableHead className="text-right text-xs">
                            Stok Sesudah
                        </TableHead>
                        <TableHead className="text-xs">Petugas / PIC</TableHead>
                        <TableHead className="text-xs">Keterangan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!movements || movements.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="h-32 text-center text-xs text-muted-foreground"
                            >
                                Belum ada riwayat mutasi / stock move untuk obat
                                ini.
                            </TableCell>
                        </TableRow>
                    ) : (
                        movements.map((move, index) => {
                            const isPositive = move.quantity > 0;
                            return (
                                <TableRow key={move.id}>
                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {formatDateTime(move.created_at)}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {getMovementTypeBadge(move.type)}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-foreground">
                                        {move.drug_batch?.batch_number ?? '-'}
                                    </TableCell>
                                    <TableCell
                                        className={`text-right font-mono text-xs font-bold ${
                                            isPositive
                                                ? 'text-primary'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {isPositive
                                            ? `+${move.quantity}`
                                            : move.quantity}{' '}
                                        {unitOfMeasure}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {move.balance_before.toLocaleString(
                                            'id-ID',
                                        )}{' '}
                                        {unitOfMeasure}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                                        {move.balance_after.toLocaleString(
                                            'id-ID',
                                        )}{' '}
                                        {unitOfMeasure}
                                    </TableCell>
                                    <TableCell className="text-xs text-foreground">
                                        {move.user?.name ?? '-'}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                        {move.reason || '-'}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
