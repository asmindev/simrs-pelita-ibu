import { formatCurrency, formatDateTime } from "@/shared/lib/format";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";

import type { Payment } from "../../../types/cashier";

interface PaymentTableProps {
    payments?: Payment[];
}

function getPaymentMethodLabel(method: string) {
    switch (method) {
        case "cash":
            return "Tunai (Cash)";
        case "qris":
            return "QRIS";
        case "bank_transfer":
            return "Transfer Bank";
        case "debit_card":
            return "Kartu Debit";
        case "credit_card":
            return "Kartu Kredit";
        default:
            return method;
    }
}

export function PaymentTable({ payments }: PaymentTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-border px-2">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs">
                            No.
                        </TableHead>
                        <TableHead className="text-xs">
                            No. Transaksi / Kuitansi
                        </TableHead>
                        <TableHead className="text-xs">
                            Tanggal & Waktu
                        </TableHead>
                        <TableHead className="text-xs">Metode</TableHead>
                        <TableHead className="text-xs">No. Referensi</TableHead>
                        <TableHead className="text-right text-xs">
                            Jumlah Bayar
                        </TableHead>
                        <TableHead className="text-right text-xs">
                            Kembalian
                        </TableHead>
                        <TableHead className="text-xs">
                            Kasir / Petugas
                        </TableHead>
                        <TableHead className="text-xs">Catatan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!payments || payments.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="h-32 text-center text-xs text-muted-foreground"
                            >
                                Belum ada riwayat pembayaran yang tercatat untuk
                                faktur ini.
                            </TableCell>
                        </TableRow>
                    ) : (
                        payments.map((payment, index) => (
                            <TableRow key={payment.id}>
                                <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-mono text-xs font-semibold text-foreground">
                                    {payment.payment_number}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {formatDateTime(payment.paid_at)}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                    {getPaymentMethodLabel(payment.method)}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {payment.reference_number || "-"}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                                    {formatCurrency(payment.amount)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                    {formatCurrency(payment.change_amount)}
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                    {payment.received_by?.name ?? "-"}
                                </TableCell>
                                <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                                    {payment.notes || "-"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
