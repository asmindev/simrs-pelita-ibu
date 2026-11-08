import { Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calendar,
    PlusCircle,
    Tv,
    UserPlus,
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
    type RegistrationActiveDoctor,
    type RegistrationEncounterItem,
    type RegistrationMetrics,
    type RegistrationQueueUnit,
} from '../types/dashboard';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface RegistrationDashboardViewProps {
    metrics: RegistrationMetrics;
    widgets: {
        queues_by_unit: RegistrationQueueUnit[];
        recent_encounters: RegistrationEncounterItem[];
        active_doctors_today: RegistrationActiveDoctor[];
    };
}

export function RegistrationDashboardView({
    metrics,
    widgets,
}: RegistrationDashboardViewProps) {
    return (
        <div className="space-y-6">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-xs sm:p-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Pusat Pendaftaran & Antrean
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Kelola alur masuk pasien dan antrean poliklinik hari
                        ini.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('registration.queues.index')}>
                            <Tv className="mr-1.5 size-3.5" />
                            Papan Antrean
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('master-data.patients.create')}>
                            <UserPlus className="mr-1.5 size-3.5" />
                            Pasien Baru
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={route('registration.encounters.create')}>
                            <PlusCircle className="mr-1.5 size-3.5" />
                            Daftar Kunjungan
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardKpiCard
                    title="Total Kunjungan"
                    value={metrics.total_encounters}
                    description="Pasien masuk hari ini"
                    icon={Users}
                />
                <DashboardKpiCard
                    title="Rawat Jalan (Poli)"
                    value={metrics.outpatient_count}
                    description="Kunjungan poliklinik reguler"
                    icon={Activity}
                />
                <DashboardKpiCard
                    title="Instalasi Gawat Darurat"
                    value={metrics.emergency_count}
                    description="Pasien gawat darurat (IGD)"
                    icon={AlertCircle}
                />
                <DashboardKpiCard
                    title="Pasien Baru Terdaftar"
                    value={metrics.new_patients_today}
                    description="Rekam medis baru hari ini"
                    icon={UserPlus}
                />
            </div>

            {/* Main Sections */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Antrean per Poliklinik */}
                <Card className="border-border/80 bg-card lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="size-4.5 text-primary" />
                            Beban Antrean per Poliklinik
                        </CardTitle>
                        <CardDescription>
                            Status antrean aktif di masing-masing poliklinik
                            hari ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.queues_by_unit.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {widgets.queues_by_unit.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-foreground">
                                                {unit.unit_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Total: {unit.total}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/50 pt-1 text-xs">
                                            <span className="text-muted-foreground">
                                                Menunggu:{' '}
                                                <strong className="text-foreground">
                                                    {unit.waiting}
                                                </strong>
                                            </span>
                                            <span className="text-muted-foreground">
                                                Dilayani:{' '}
                                                <strong className="text-primary">
                                                    {unit.serving}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-xs text-muted-foreground">
                                Belum ada data antrean unit hari ini.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Dokter Bertugas Hari Ini */}
                <Card className="border-border/80 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="size-4.5 text-primary" />
                            Dokter Praktik Hari Ini
                        </CardTitle>
                        <CardDescription>
                            Jadwal poliklinik aktif hari ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.active_doctors_today.length > 0 ? (
                            <div className="space-y-3">
                                {widgets.active_doctors_today.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="space-y-1 rounded-lg border border-border/70 bg-card p-3 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="text-sm font-medium text-foreground">
                                            {doc.doctor_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {doc.specialization} &bull;{' '}
                                            {doc.unit_name}
                                        </div>
                                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                                            <span>
                                                Jam: {doc.schedule_time}
                                            </span>
                                            {doc.quota !== null && (
                                                <span>Kuota: {doc.quota}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-xs text-muted-foreground">
                                Tidak ada jadwal dokter terdaftar untuk hari
                                ini.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Pendaftaran Terakhir Hari Ini */}
            <Card className="border-border/80 bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="text-base">
                            Pendaftaran Pasien Terbaru
                        </CardTitle>
                        <CardDescription>
                            Daftar registrasi kunjungan yang masuk hari ini.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('registration.encounters.index')}>
                            Lihat Semua
                        </Link>
                    </Button>
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
                                            Tujuan Poli / Unit
                                        </TableHead>
                                        <TableHead>Dokter</TableHead>
                                        <TableHead className="w-20">
                                            Tipe
                                        </TableHead>
                                        <TableHead className="w-20">
                                            Jam Tiba
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {widgets.recent_encounters.map((enc) => (
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
                                            <TableCell>
                                                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground uppercase">
                                                    {enc.type === 'outpatient'
                                                        ? 'Poli'
                                                        : 'IGD'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {enc.arrived_at}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                            Belum ada pendaftaran pasien hari ini.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
