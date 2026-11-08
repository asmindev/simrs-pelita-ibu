import { Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    FileText,
    FlaskConical,
    Stethoscope,
    Users,
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
    type DoctorDiagnosticItem,
    type DoctorMetrics,
    type DoctorPatientQueueItem,
} from '../types/dashboard';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface DoctorDashboardViewProps {
    metrics: DoctorMetrics;
    widgets: {
        patient_queue: DoctorPatientQueueItem[];
        recent_diagnostics: DoctorDiagnosticItem[];
    };
}

export function DoctorDashboardView({
    metrics,
    widgets,
}: DoctorDashboardViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Selamat bertugas, {metrics.doctor_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Ringkasan antrean poliklinik dan pemeriksaan pasien Anda
                    hari ini.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <DashboardKpiCard
                    title="Pasien Menunggu"
                    value={metrics.waiting_count}
                    description="Menunggu di ruang tunggu"
                    icon={Users}
                />
                <DashboardKpiCard
                    title="Sedang Dilayani"
                    value={metrics.in_consultation_count}
                    description="Pemeriksaan aktif saat ini"
                    icon={Activity}
                />
                <DashboardKpiCard
                    title="Selesai Hari Ini"
                    value={metrics.finished_today_count}
                    description="Pemeriksaan tuntas hari ini"
                    icon={CheckCircle2}
                />
            </div>

            {/* Main Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Antrean Pasien Saya */}
                <Card className="border-border/80 bg-card lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Stethoscope className="size-4.5 text-primary" />
                                Antrean Pasien Saya
                            </CardTitle>
                            <CardDescription>
                                Pasien terdaftar yang siap diperiksa hari ini.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('medical-record.index')}>
                                Buka EMR
                                <ArrowRight className="ml-1 size-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {widgets.patient_queue.length > 0 ? (
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">
                                                Antrean
                                            </TableHead>
                                            <TableHead>Pasien / RM</TableHead>
                                            <TableHead>Poliklinik</TableHead>
                                            <TableHead className="w-20">
                                                Jam Tiba
                                            </TableHead>
                                            <TableHead className="w-24">
                                                Status
                                            </TableHead>
                                            <TableHead className="w-24 text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {widgets.patient_queue.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-semibold text-primary">
                                                    {item.queue_code}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">
                                                        {item.patient_name}
                                                    </div>
                                                    <div className="font-mono text-xs text-muted-foreground">
                                                        {item.patient_mrn}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {item.unit_name}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {item.arrived_at}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                        {item.status_label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={route(
                                                                'medical-record.encounters.show',
                                                                item.id,
                                                            )}
                                                        >
                                                            Periksa
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Users className="mb-2 size-10 text-muted-foreground/40" />
                                <p className="text-sm font-medium text-foreground">
                                    Tidak ada antrean menunggu
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Semua pasien yang terdaftar telah selesai
                                    dilayani.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Hasil Penunjang Siap */}
                <Card className="border-border/80 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FlaskConical className="size-4.5 text-primary" />
                            Hasil Penunjang Siap
                        </CardTitle>
                        <CardDescription>
                            Hasil Lab & Radiologi pasien Anda yang baru selesai.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.recent_diagnostics.length > 0 ? (
                            <div className="space-y-3">
                                {widgets.recent_diagnostics.map((diag) => (
                                    <div
                                        key={diag.id}
                                        className="flex items-start justify-between gap-3 rounded-lg border border-border/70 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase">
                                                    {diag.type === 'laboratory'
                                                        ? 'Lab'
                                                        : 'Radiologi'}
                                                </span>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {diag.order_number}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-foreground">
                                                {diag.patient_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Selesai {diag.completed_at}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'diagnostics.orders.show',
                                                    diag.id,
                                                )}
                                            >
                                                <FileText className="size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <FlaskConical className="mb-2 size-8 text-muted-foreground/40" />
                                <p className="text-xs text-muted-foreground">
                                    Belum ada hasil penunjang baru.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
