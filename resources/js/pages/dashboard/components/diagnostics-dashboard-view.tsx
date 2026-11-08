import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FlaskConical,
    Radio,
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
    type DiagnosticsMetrics,
    type DiagnosticsOrderItem,
} from '../types/dashboard';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface DiagnosticsDashboardViewProps {
    metrics: DiagnosticsMetrics;
    widgets: {
        pending_orders: DiagnosticsOrderItem[];
    };
}

export function DiagnosticsDashboardView({
    metrics,
    widgets,
}: DiagnosticsDashboardViewProps) {
    return (
        <div className="space-y-6">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-xs sm:p-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Instalasi Penunjang Medis (Lab & Radiologi)
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Penerimaan sampel, pemeriksaan radiologi, dan input
                        validasi hasil penunjang.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('diagnostics.orders.index')}>
                            <FileSpreadsheet className="mr-1.5 size-3.5" />
                            Daftar Order Penunjang
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardKpiCard
                    title="Order Lab Menunggu"
                    value={metrics.pending_lab_orders}
                    description="Permintaan laboratorium baru"
                    icon={FlaskConical}
                />
                <DashboardKpiCard
                    title="Order Radiologi Menunggu"
                    value={metrics.pending_rad_orders}
                    description="Permintaan foto / rontgen baru"
                    icon={Radio}
                />
                <DashboardKpiCard
                    title="Sedang Diproses"
                    value={metrics.in_progress_orders}
                    description="Pemeriksaan dalam tindakan"
                    icon={Clock}
                />
                <DashboardKpiCard
                    title="Selesai Hari Ini"
                    value={metrics.completed_today}
                    description="Hasil telah divalidasi hari ini"
                    icon={CheckCircle2}
                />
            </div>

            {/* Antrean Order Penunjang */}
            <Card className="border-border/80 bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="text-base">
                            Daftar Order Penunjang Masuk
                        </CardTitle>
                        <CardDescription>
                            Permintaan tes laboratorium dan radiologi yang perlu
                            ditindaklanjuti.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('diagnostics.orders.index')}>
                            Semua Order
                            <ArrowRight className="ml-1 size-3.5" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {widgets.pending_orders.length > 0 ? (
                        <div className="rounded-md border border-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">
                                            No. Order
                                        </TableHead>
                                        <TableHead className="w-24">
                                            Jenis
                                        </TableHead>
                                        <TableHead>Pasien / RM</TableHead>
                                        <TableHead>Dokter Pemohon</TableHead>
                                        <TableHead className="w-20">
                                            Jam
                                        </TableHead>
                                        <TableHead className="w-24">
                                            Status
                                        </TableHead>
                                        <TableHead className="w-28 text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {widgets.pending_orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono text-xs font-semibold text-primary">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary uppercase">
                                                    {order.type === 'laboratory'
                                                        ? 'Lab'
                                                        : 'Radiologi'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-foreground">
                                                    {order.patient_name}
                                                </div>
                                                <div className="font-mono text-xs text-muted-foreground">
                                                    {order.patient_mrn}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {order.doctor_name}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {order.created_at}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground uppercase">
                                                    {order.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={route(
                                                            'diagnostics.orders.show',
                                                            order.id,
                                                        )}
                                                    >
                                                        Input Hasil
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
                            Tidak ada order penunjang yang pending saat ini.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
