import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Receipt } from 'lucide-react';
import type { Invoice } from '../../../types/cashier';

interface Props {
    invoice: Invoice;
    getPaymentMethodLabel: (method: string) => string;
}

export function PaymentHistoryDialog({
    invoice,
    getPaymentMethodLabel,
}: Props) {
    const paymentCount = invoice.payments?.length ?? 0;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                >
                    <Receipt className="size-3.5" />
                    <span>Riwayat Pembayaran</span>
                    {paymentCount > 0 && (
                        <Badge
                            variant="secondary"
                            className="px-1.5 py-0 font-mono text-[10px]"
                        >
                            {paymentCount}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                        <Receipt className="size-4 text-primary" />
                        Riwayat Pembayaran Diterima
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Daftar transaksi setoran kasir dan pelunasan untuk
                        Invoice #{invoice.invoice_number}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-hidden rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs">
                                    No. Transaksi
                                </TableHead>
                                <TableHead className="text-xs">Waktu</TableHead>
                                <TableHead className="text-xs">
                                    Metode
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Nominal Dibayar
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Kembalian
                                </TableHead>
                                <TableHead className="text-xs">Kasir</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!invoice.payments ||
                            invoice.payments.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-xs text-muted-foreground"
                                    >
                                        Belum ada pembayaran yang tercatat untuk
                                        tagihan ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoice.payments.map((pay) => (
                                    <TableRow key={pay.id}>
                                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                                            {pay.payment_number}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDateTime(pay.paid_at)}
                                        </TableCell>
                                        <TableCell className="text-xs font-medium">
                                            {getPaymentMethodLabel(pay.method)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                                            {formatCurrency(pay.amount)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                            {formatCurrency(pay.change_amount)}
                                        </TableCell>
                                        <TableCell className="text-xs text-foreground">
                                            {pay.received_by?.name ?? 'Kasir'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
