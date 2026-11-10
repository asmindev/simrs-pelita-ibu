import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Printer, Wallet, XCircle } from 'lucide-react';
import { useState } from 'react';

import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type { Invoice, InvoiceItem } from '../../types/cashier';
import { InvoiceStatusBadge } from '../components/invoice-status-badge';
import { PaymentDialog } from '../components/payment-dialog';
import { PaymentHistoryDialog } from './components/payment-history-dialog';
import { VoidInvoiceDialog } from './components/void-invoice-dialog';

type Props = {
    invoice: Invoice;
};

function getItemTypeBadge(type: InvoiceItem['item_type']) {
    switch (type) {
        case 'registration':
            return (
                <Badge variant="outline" className="text-[11px]">
                    Registrasi
                </Badge>
            );
        case 'consultation':
            return (
                <Badge variant="secondary" className="text-[11px]">
                    Konsultasi
                </Badge>
            );
        case 'tariff':
            return (
                <Badge variant="secondary" className="text-[11px]">
                    Tindakan
                </Badge>
            );
        case 'drug':
            return (
                <Badge variant="default" className="text-[11px]">
                    Farmasi / Obat
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-[11px]">
                    Lainnya
                </Badge>
            );
    }
}

function getPaymentMethodLabel(method: string) {
    switch (method) {
        case 'cash':
            return 'Tunai (Cash)';
        case 'qris':
            return 'QRIS';
        case 'bank_transfer':
            return 'Transfer Bank';
        case 'debit_card':
            return 'Kartu Debit';
        case 'credit_card':
            return 'Kartu Kredit';
        default:
            return method;
    }
}

export default function InvoiceShowIndex({ invoice }: Props) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isVoidOpen, setIsVoidOpen] = useState(false);

    const remainingBalance = Math.max(
        0,
        invoice.total_amount - invoice.paid_amount,
    );

    function handlePrint() {
        window.print();
    }

    return (
        <div className="space-y-6">
            <Head title={`Invoice #${invoice.invoice_number} — SIMRS`} />

            {/* Back Button & Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-xs text-muted-foreground hover:text-foreground"
                    asChild
                >
                    <Link href={route('cashier.invoices.index')}>
                        <ArrowLeft className="mr-1.5 size-3.5" />
                        Kembali ke Daftar Tagihan
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <PaymentHistoryDialog
                        invoice={invoice}
                        getPaymentMethodLabel={getPaymentMethodLabel}
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={handlePrint}
                    >
                        <Printer className="mr-1.5 size-3.5" />
                        Cetak Kuitansi
                    </Button>

                    {invoice.status !== 'paid' &&
                        invoice.status !== 'voided' && (
                            <Button
                                size="sm"
                                className="h-8 text-xs font-medium"
                                onClick={() => setIsPaymentOpen(true)}
                            >
                                <Wallet className="mr-1.5 size-3.5" />
                                Payment
                            </Button>
                        )}

                    {invoice.status !== 'voided' &&
                        invoice.paid_amount === 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:bg-destructive/10"
                                onClick={() => setIsVoidOpen(true)}
                            >
                                <XCircle className="mr-1.5 size-3.5" />
                                Batalkan (Void)
                            </Button>
                        )}
                </div>
            </div>

            {/* Ringkasan Invoice Card */}
            <Card className="border-border">
                <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="font-mono text-lg font-bold">
                                {invoice.invoice_number}
                            </CardTitle>
                            <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Kunjungan:{' '}
                            <span className="font-mono font-medium">
                                {invoice.encounter?.encounter_number}
                            </span>{' '}
                            &bull; Dibuat: {formatDateTime(invoice.created_at)}
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                            Total Tagihan:
                        </div>
                        <div className="text-xl font-bold text-foreground">
                            {formatCurrency(invoice.total_amount)}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-4 border-t border-border pt-4 text-xs sm:grid-cols-3">
                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            Data Pasien
                        </span>
                        <div className="font-semibold text-foreground">
                            {invoice.patient?.name}
                        </div>
                        <div className="font-mono text-muted-foreground">
                            RM: {invoice.patient?.medical_record_number} &bull;{' '}
                            {invoice.patient?.gender === 'M'
                                ? 'Laki-laki'
                                : 'Perempuan'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            Pelayanan Medis
                        </span>
                        <div className="font-semibold text-foreground">
                            {invoice.encounter?.unit?.name ?? 'Poliklinik'}
                        </div>
                        <div className="text-muted-foreground">
                            Dokter: {invoice.encounter?.doctor?.name ?? '-'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            Penjamin Pembayaran
                        </span>
                        <div className="font-semibold text-foreground">
                            {invoice.guarantor?.name ??
                                'Umum / Pembayaran Pribadi'}
                        </div>
                        <div className="text-muted-foreground">
                            Tipe: {invoice.guarantor?.type ?? 'Umum'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Rincian Item Tagihan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="size-4 text-muted-foreground" />
                        Rincian Tagihan & Biaya Pelayanan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">No.</TableHead>
                                <TableHead className="text-xs">
                                    Kategori
                                </TableHead>
                                <TableHead className="text-xs">
                                    Deskripsi Layanan / Item
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Harga Satuan
                                </TableHead>
                                <TableHead className="text-center text-xs">
                                    Jumlah
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!invoice.items || invoice.items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-xs text-muted-foreground"
                                    >
                                        Tidak ada item tagihan tercatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoice.items.map((item, idx) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell>
                                            {getItemTypeBadge(item.item_type)}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <div className="font-medium text-foreground">
                                                {item.name}
                                            </div>
                                            {item.notes && (
                                                <div className="text-[11px] text-muted-foreground">
                                                    {item.notes}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {formatCurrency(item.unit_price)}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-xs">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs font-semibold">
                                            {formatCurrency(item.total)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Ringkasan Perhitungan */}
                    <div className="flex justify-end border-t border-border p-4">
                        <div className="w-full max-w-xs space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal Biaya:
                                </span>
                                <span className="font-mono">
                                    {formatCurrency(invoice.subtotal)}
                                </span>
                            </div>
                            {invoice.discount_amount > 0 && (
                                <div className="flex justify-between text-destructive">
                                    <span>Diskon:</span>
                                    <span className="font-mono">
                                        -
                                        {formatCurrency(
                                            invoice.discount_amount,
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                                <span>Total Tagihan:</span>
                                <span>
                                    {formatCurrency(invoice.total_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Total Telah Dibayar:</span>
                                <span className="font-mono font-medium">
                                    {formatCurrency(invoice.paid_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-primary">
                                <span>Sisa Tagihan:</span>
                                <span>{formatCurrency(remainingBalance)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Pembayaran */}
            <PaymentDialog
                invoice={invoice}
                open={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
            />

            {/* Dialog Batalkan (Void) Invoice */}
            <VoidInvoiceDialog
                invoice={invoice}
                open={isVoidOpen}
                onOpenChange={setIsVoidOpen}
            />
        </div>
    );
}
