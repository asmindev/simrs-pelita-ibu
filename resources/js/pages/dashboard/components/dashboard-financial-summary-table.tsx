import { DollarSign } from 'lucide-react';

import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type { FinancialSummaryItem } from '../types/dashboard';

interface Props {
    items: FinancialSummaryItem[];
}

export function DashboardFinancialSummaryTable({ items }: Props) {
    return (
        <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <DollarSign className="size-4 text-primary" />
                            Ringkasan Billing & Penjamin Hari Ini
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Rekapitulasi tagihan pasien rawat jalan/inap
                            berdasarkan penjamin.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                        {items.length} Kelompok Penjamin
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                        Belum ada transaksi invoice kasir tercatat hari ini.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs">
                                    Penjamin
                                </TableHead>
                                <TableHead className="text-center text-xs">
                                    Invoice
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Total Tagihan
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Realisasi Terbayar
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, idx) => (
                                <TableRow key={item.guarantor_id ?? idx}>
                                    <TableCell className="text-xs font-medium text-foreground">
                                        {item.guarantor_name}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                        {item.invoice_count}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-foreground">
                                        {formatCurrency(item.total_billed)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs font-semibold text-primary">
                                        {formatCurrency(item.total_paid)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            variant={
                                                item.total_paid >=
                                                    item.total_billed &&
                                                item.total_billed > 0
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="text-[10px]"
                                        >
                                            {item.status_label}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
