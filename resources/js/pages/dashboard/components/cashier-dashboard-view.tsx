import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Receipt,
    Wallet,
} from 'lucide-react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
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

import {
    type CashierInvoiceItem,
    type CashierMetrics,
    type CashierPaymentMethodBreakdown,
} from '../types/dashboard';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface CashierDashboardViewProps {
    metrics: CashierMetrics;
    widgets: {
        pending_invoices: CashierInvoiceItem[];
        payment_methods_breakdown: CashierPaymentMethodBreakdown[];
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function CashierDashboardView({
    metrics,
    widgets,
}: CashierDashboardViewProps) {
    return (
        <div className="space-y-6">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-xs sm:p-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Pusat Kasir & Billing Pembayaran
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Penerimaan pembayaran pasien, pelunasan tagihan, dan
                        rincian kas harian.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('cashier.invoices.index')}>
                            <Receipt className="mr-1.5 size-3.5" />
                            Semua Invoice
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardKpiCard
                    title="Pendapatan Hari Ini"
                    value={formatRupiah(metrics.today_revenue)}
                    description="Total penerimaan kas hari ini"
                    icon={DollarSign}
                />
                <DashboardKpiCard
                    title="Tagihan Menunggu"
                    value={metrics.pending_invoices_count}
                    description="Invoice belum dilunasi"
                    icon={Clock}
                />
                <DashboardKpiCard
                    title="Transaksi Lunas"
                    value={metrics.paid_today_count}
                    description="Pembayaran lunas hari ini"
                    icon={CheckCircle2}
                />
                <DashboardKpiCard
                    title="Piutang Tertunda"
                    value={formatRupiah(metrics.total_pending_amount)}
                    description="Akumulasi tagihan terbuka"
                    icon={Wallet}
                />
            </div>

            {/* Main Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Antrean Tagihan Kasir */}
                <Card className="border-border/80 bg-card lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base">
                                Tagihan Menunggu Pembayaran
                            </CardTitle>
                            <CardDescription>
                                Invoice pasien yang siap diproses pelunasannya
                                di kasir.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('cashier.invoices.index')}>
                                Buka Billing
                                <ArrowRight className="ml-1 size-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {widgets.pending_invoices.length > 0 ? (
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-24">
                                                No. Invoice
                                            </TableHead>
                                            <TableHead>Pasien / RM</TableHead>
                                            <TableHead>Penjamin</TableHead>
                                            <TableHead className="text-right">
                                                Total Tagihan
                                            </TableHead>
                                            <TableHead className="w-24 text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {widgets.pending_invoices.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-mono text-xs font-semibold text-primary">
                                                    {inv.invoice_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">
                                                        {inv.patient_name}
                                                    </div>
                                                    <div className="font-mono text-xs text-muted-foreground">
                                                        {inv.patient_mrn}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {inv.guarantor_name}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-foreground">
                                                    {formatRupiah(
                                                        inv.total_amount,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={route(
                                                                'cashier.invoices.show',
                                                                inv.id,
                                                            )}
                                                        >
                                                            Bayar
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                Tidak ada tagihan tertunda saat ini.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Metode Pembayaran Hari Ini */}
                <Card className="border-border/80 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="size-4.5 text-primary" />
                            Metode Pembayaran
                        </CardTitle>
                        <CardDescription>
                            Distribusi kas masuk berdasarkan kanal bayar hari
                            ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.payment_methods_breakdown.length > 0 ? (
                            <div className="space-y-3">
                                {widgets.payment_methods_breakdown.map(
                                    (item) => (
                                        <div
                                            key={item.method}
                                            className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 p-3"
                                        >
                                            <div className="space-y-0.5">
                                                <span className="text-sm font-medium tracking-wide text-foreground uppercase">
                                                    {item.method.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.count} transaksi
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-primary">
                                                {formatRupiah(item.total)}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada transaksi kasir tercatat hari ini.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
