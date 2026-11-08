import { Link } from '@inertiajs/react';
import {
    BedDouble,
    CheckCircle2,
    HeartPulse,
    LogIn,
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
    type NurseBedClassSummary,
    type NurseInpatientItem,
    type NurseMetrics,
} from '../types/dashboard';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface NurseDashboardViewProps {
    metrics: NurseMetrics;
    widgets: {
        bed_classes: NurseBedClassSummary[];
        active_inpatients: NurseInpatientItem[];
    };
}

export function NurseDashboardView({
    metrics,
    widgets,
}: NurseDashboardViewProps) {
    return (
        <div className="space-y-6">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-xs sm:p-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Rawat Inap & Asuhan Keperawatan
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Pemantauan ketersediaan tempat tidur, admisi bangsal,
                        dan catatan pasien rawat inap.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('inpatient.beds.index')}>
                            <BedDouble className="mr-1.5 size-3.5" />
                            Katalog Bed
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={route('inpatient.admissions.index')}>
                            <LogIn className="mr-1.5 size-3.5" />
                            Admisi Pasien
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardKpiCard
                    title="Keterisian Bed (BOR)"
                    value={`${metrics.bor_percentage}%`}
                    description={`${metrics.occupied_beds} terisi dari ${metrics.total_beds} bed aktif`}
                    icon={BedDouble}
                />
                <DashboardKpiCard
                    title="Bed Tersedia"
                    value={metrics.available_beds}
                    description="Siap ditempati pasien baru"
                    icon={CheckCircle2}
                />
                <DashboardKpiCard
                    title="Pasien Dirawat Aktif"
                    value={metrics.active_inpatients_count}
                    description="Total pasien di seluruh bangsal"
                    icon={Users}
                />
                <DashboardKpiCard
                    title="Admisi Masuk Hari Ini"
                    value={metrics.today_admissions}
                    description="Pasien baru masuk rawat inap"
                    icon={LogIn}
                />
            </div>

            {/* Main Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Pasien Rawat Inap Aktif */}
                <Card className="border-border/80 bg-card lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base">
                                Daftar Pasien Rawat Inap Aktif
                            </CardTitle>
                            <CardDescription>
                                Pasien yang sedang menjalani rawat inap saat
                                ini.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('inpatient.admissions.index')}>
                                Semua Admisi
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {widgets.active_inpatients.length > 0 ? (
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-24">
                                                No. Admisi
                                            </TableHead>
                                            <TableHead>Pasien / RM</TableHead>
                                            <TableHead>Dokter DPJP</TableHead>
                                            <TableHead>
                                                Diagnosis Awal
                                            </TableHead>
                                            <TableHead className="w-24 text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {widgets.active_inpatients.map(
                                            (item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-mono text-xs font-semibold text-primary">
                                                        {item.admission_number}
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
                                                        {item.doctor_name}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                        {item.initial_diagnosis}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'inpatient.admissions.show',
                                                                    item.id,
                                                                )}
                                                            >
                                                                CPPT
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                Tidak ada pasien rawat inap yang sedang aktif.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Keterisian Bed per Kelas */}
                <Card className="border-border/80 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <HeartPulse className="size-4.5 text-primary" />
                            Keterisian Bed per Kelas
                        </CardTitle>
                        <CardDescription>
                            Distribusi kapasitas tempat tidur per kelas rawat.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.bed_classes.length > 0 ? (
                            <div className="space-y-3">
                                {widgets.bed_classes.map((cls) => (
                                    <div
                                        key={cls.class}
                                        className="space-y-1.5 rounded-lg border border-border/80 bg-muted/20 p-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold tracking-wide text-foreground uppercase">
                                                {cls.class.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {cls.occupied} / {cls.total} Bed
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                Terisi:{' '}
                                                <strong className="text-primary">
                                                    {cls.occupied}
                                                </strong>
                                            </span>
                                            <span>
                                                Tersedia:{' '}
                                                <strong className="text-foreground">
                                                    {cls.available}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada data bed terdaftar.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
