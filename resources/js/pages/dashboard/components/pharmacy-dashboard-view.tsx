import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock,
    PackageSearch,
    Pill,
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
    type PharmacyMetrics,
    type PharmacyPrescriptionItem,
} from '../types/dashboard';
import { DashboardKpiCard } from './dashboard-kpi-card';

interface CriticalBatchItem {
    id: number;
    batch_number: string;
    drug_name: string;
    drug_code: string;
    current_quantity: number;
    unit_of_measure: string;
    expiry_date: string;
    is_expired: boolean;
}

interface PharmacyDashboardViewProps {
    metrics: PharmacyMetrics;
    widgets: {
        pending_prescriptions: PharmacyPrescriptionItem[];
        critical_batches: CriticalBatchItem[];
    };
}

export function PharmacyDashboardView({
    metrics,
    widgets,
}: PharmacyDashboardViewProps) {
    return (
        <div className="space-y-6">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-xs sm:p-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Instalasi Farmasi & Apotek
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Pemrosesan telaah resep, dispensing obat, dan pemantauan
                        stok FEFO.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('pharmacy.stock.index')}>
                            <PackageSearch className="mr-1.5 size-3.5" />
                            Manajemen Stok
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={route('pharmacy.prescriptions.index')}>
                            <Pill className="mr-1.5 size-3.5" />
                            Daftar Resep
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardKpiCard
                    title="Menunggu Telaah"
                    value={metrics.submitted_count}
                    description="Resep baru dari dokter"
                    icon={Clock}
                />
                <DashboardKpiCard
                    title="Siap Serah (Verified)"
                    value={metrics.verified_count}
                    description="Sudah diverifikasi, siap serah"
                    icon={Pill}
                />
                <DashboardKpiCard
                    title="Diserahkan Hari Ini"
                    value={metrics.dispensed_today_count}
                    description="Resep tuntas keluar hari ini"
                    icon={CheckCircle2}
                />
                <DashboardKpiCard
                    title="Batch Kritis / ED"
                    value={
                        metrics.expiring_batches_count +
                        metrics.low_stock_drugs_count
                    }
                    description="Stok minim atau ED < 30 hari"
                    icon={AlertTriangle}
                />
            </div>

            {/* Main Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Antrean Resep Masuk */}
                <Card className="border-border/80 bg-card lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base">
                                Antrean Resep Farmasi
                            </CardTitle>
                            <CardDescription>
                                Resep aktif yang memerlukan tindakan apoteker.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('pharmacy.prescriptions.index')}>
                                Semua Resep
                                <ArrowRight className="ml-1 size-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {widgets.pending_prescriptions.length > 0 ? (
                            <div className="rounded-md border border-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-24">
                                                No. Resep
                                            </TableHead>
                                            <TableHead>Pasien / RM</TableHead>
                                            <TableHead>Dokter & Unit</TableHead>
                                            <TableHead className="w-16 text-center">
                                                Item
                                            </TableHead>
                                            <TableHead className="w-24">
                                                Status
                                            </TableHead>
                                            <TableHead className="w-20 text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {widgets.pending_prescriptions.map(
                                            (item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-mono text-xs font-semibold text-primary">
                                                        {
                                                            item.prescription_number
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">
                                                            {item.patient_name}
                                                        </div>
                                                        <div className="font-mono text-xs text-muted-foreground">
                                                            {item.patient_mrn}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-foreground">
                                                            {item.doctor_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.unit_name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-semibold">
                                                        {item.items_count}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground uppercase">
                                                            {item.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'pharmacy.prescriptions.show',
                                                                    item.id,
                                                                )}
                                                            >
                                                                Buka
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
                                Tidak ada resep yang menunggu pemrosesan saat
                                ini.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Peringatan Batch Obat Kritis */}
                <Card className="border-border/80 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertCircle className="size-4.5 text-primary" />
                            Peringatan Batch Kritis
                        </CardTitle>
                        <CardDescription>
                            Batch stok minim atau mendekati kedaluwarsa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {widgets.critical_batches &&
                        widgets.critical_batches.length > 0 ? (
                            <div className="space-y-3">
                                {widgets.critical_batches.map((batch) => (
                                    <div
                                        key={batch.id}
                                        className="space-y-1 rounded-lg border border-border/80 bg-card p-3 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">
                                                {batch.drug_name}
                                            </span>
                                            {batch.is_expired ? (
                                                <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                                                    Expired
                                                </span>
                                            ) : (
                                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                    ED: {batch.expiry_date}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                                            <span className="font-mono">
                                                Batch: {batch.batch_number}
                                            </span>
                                            <span>
                                                Sisa:{' '}
                                                <strong className="text-foreground">
                                                    {batch.current_quantity}
                                                </strong>{' '}
                                                {batch.unit_of_measure}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                Semua batch obat dalam kondisi aman.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
