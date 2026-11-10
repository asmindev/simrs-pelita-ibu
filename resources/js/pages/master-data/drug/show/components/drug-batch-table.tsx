import { formatCurrency, formatDate } from '@/shared/lib/format';
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

interface DrugBatchTableProps {
    batches?: Drug['batches'];
    unitOfMeasure: string;
}

function getExpiryBadge(expiryDate: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
        (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
        return (
            <Badge variant="destructive" className="text-xs">
                Kadaluwarsa ({formatDate(expiryDate)})
            </Badge>
        );
    }

    if (diffDays <= 30) {
        return (
            <Badge
                variant="outline"
                className="border-destructive/50 text-xs text-destructive"
            >
                Mendekati ED: {diffDays} hr ({formatDate(expiryDate)})
            </Badge>
        );
    }

    return (
        <span className="font-mono text-xs text-muted-foreground">
            {formatDate(expiryDate)}
        </span>
    );
}

export function DrugBatchTable({
    batches,
    unitOfMeasure,
}: DrugBatchTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs">
                            No.
                        </TableHead>
                        <TableHead className="text-xs">Nomor Batch</TableHead>
                        <TableHead className="text-xs">
                            Tanggal Kedaluwarsa
                        </TableHead>
                        <TableHead className="text-right text-xs">
                            Harga Beli
                        </TableHead>
                        <TableHead className="text-right text-xs">
                            Stok Awal
                        </TableHead>
                        <TableHead className="text-right text-xs">
                            Sisa Stok Fisik
                        </TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!batches || batches.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="h-32 text-center text-xs text-muted-foreground"
                            >
                                Belum ada batch persediaan yang tercatat untuk
                                obat ini.
                            </TableCell>
                        </TableRow>
                    ) : (
                        batches.map((batch, index) => (
                            <TableRow key={batch.id}>
                                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-mono text-xs font-bold text-foreground">
                                    {batch.batch_number}
                                </TableCell>
                                <TableCell className="text-xs">
                                    {getExpiryBadge(batch.expiry_date)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                    {formatCurrency(batch.buy_price)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                    {batch.initial_quantity.toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    {unitOfMeasure}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                                    {batch.current_quantity.toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    {unitOfMeasure}
                                </TableCell>
                                <TableCell className="text-xs">
                                    <Badge
                                        variant={
                                            batch.current_quantity > 0
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="text-[10px]"
                                    >
                                        {batch.current_quantity > 0
                                            ? 'Tersedia'
                                            : 'Habis'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
