import { Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BedDouble,
    DollarSign,
    History,
    ShieldAlert,
    Users,
} from 'lucide-react';

import { navigation } from '@/shared/config/navigation';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Card,
    CardAction,
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
    type ExecutiveAuditLogItem,
    type ExecutiveEncounterItem,
    type ExecutiveMetrics,
} from '../types/dashboard';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface ExecutiveDashboardViewProps {
    metrics: ExecutiveMetrics;
    widgets: {
        recent_encounters: ExecutiveEncounterItem[];
        recent_audit_logs: ExecutiveAuditLogItem[];
    };
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function ExecutiveDashboardView({
    metrics,
    widgets,
}: ExecutiveDashboardViewProps) {
    const { can, canAny } = usePermissions();

    const modules = navigation.filter(
        (item) =>
            item.routeName !== 'dashboard' &&
            route().has(item.routeName) &&
            (!item.permission ||
                (typeof item.permission === 'string'
                    ? can(item.permission)
                    : canAny(item.permission))),
    );

    return (
        <div className="space-y-6">
            {/* Break-Glass Alert if any pending review */}
            {metrics.pending_break_glass > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="size-5 shrink-0 text-destructive" />
                        <div>
                            <p className="text-sm font-semibold text-destructive">
                                Perhatian: Ada {metrics.pending_break_glass}{' '}
                                Permintaan Break-Glass Darurat
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Hak akses darurat medis memerlukan peninjauan
                                dan review dari supervisor.
                            </p>
                        </div>
                    </div>
                    {route().has('rbac.break-glass.index') && (
                        <Button variant="destructive" size="sm" asChild>
                            <Link href={route('rbac.break-glass.index')}>
                                <ShieldAlert className="mr-1.5 size-3.5" />
                                Review Sekarang
                            </Link>
                        </Button>
                    )}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardKpiCard
                    title="Kunjungan Hari Ini"
                    value={metrics.total_encounters_today}
                    description="Total pasien Rawat Jalan & IGD"
                    icon={Users}
                />
                <DashboardKpiCard
                    title="Keterisian Bed (BOR)"
                    value={`${metrics.bor_percentage}%`}
                    description={`${metrics.occupied_beds} dari ${metrics.total_beds} bed terisi`}
                    icon={BedDouble}
                />
                <DashboardKpiCard
                    title="Omzet Kasir Hari Ini"
                    value={formatRupiah(metrics.today_revenue)}
                    description="Penerimaan pembayaran kasir"
                    icon={DollarSign}
                />
                <DashboardKpiCard
                    title="Pasien Rawat Inap"
                    value={metrics.total_admitted_patients}
                    description="Pasien aktif di bangsal"
                    icon={Activity}
                />
            </div>

            {/* Recent Encounters & Audit Logs */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Kunjungan Terbaru */}
                <Card className="border-border/80 bg-card lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base">
                                Kunjungan Terdaftar Hari Ini
                            </CardTitle>
                            <CardDescription>
                                Ringkasan pasien yang masuk instalasi rawat
                                jalan & darurat.
                            </CardDescription>
                        </div>
                        {route().has('registration.encounters.index') && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={route(
                                        'registration.encounters.index',
                                    )}
                                >
                                    Lihat Semua
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {widgets.recent_encounters.length > 0 ? (
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-24">
                                                No. Registrasi
                                            </TableHead>
                                            <TableHead>Pasien / RM</TableHead>
                                            <TableHead>
                                                Unit / Poliklinik
                                            </TableHead>
                                            <TableHead>Dokter</TableHead>
                                            <TableHead className="w-20">
                                                Jam
                                            </TableHead>
                                            <TableHead className="w-24">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {widgets.recent_encounters.map(
                                            (enc) => (
                                                <TableRow key={enc.id}>
                                                    <TableCell className="font-mono text-xs font-semibold text-primary">
                                                        {enc.encounter_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">
                                                            {enc.patient_name}
                                                        </div>
                                                        <div className="font-mono text-xs text-muted-foreground">
                                                            {enc.patient_mrn}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {enc.unit_name}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {enc.doctor_name}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {enc.arrived_at}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                            {enc.status_label}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada kunjungan tercatat hari ini.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Audit Log Terakhir */}
                <Card className="border-border/80 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <History className="size-4.5 text-primary" />
                            Aktivitas Sistem Terakhir
                        </CardTitle>
                        <CardDescription>
                            Jejak audit aksi pengguna terkini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.recent_audit_logs.length > 0 ? (
                            <div className="space-y-3">
                                {widgets.recent_audit_logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="space-y-1 rounded-lg border border-border/80 bg-muted/20 p-3"
                                    >
                                        <p className="text-xs font-medium text-foreground">
                                            {log.description}
                                        </p>
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>Oleh: {log.causer_name}</span>
                                            <span>{log.created_at}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada aktivitas tercatat.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modul Rumah Sakit */}
            <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                    Pintasan Modul Rumah Sakit
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {modules.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.routeName}
                                href={route(item.routeName)}
                                className="group"
                            >
                                <Card className="h-full border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:bg-accent/30 hover:shadow-xs">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2.5">
                                            {Icon && (
                                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                                    <Icon className="size-4.5" />
                                                </span>
                                            )}
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription>
                                            Buka modul {item.title}.
                                        </CardDescription>
                                        <CardAction>
                                            <ArrowUpRight className="size-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Kelola data dan operasional{' '}
                                            {item.title.toLowerCase()}.
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
