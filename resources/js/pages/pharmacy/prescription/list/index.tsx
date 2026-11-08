import { Head, Link } from '@inertiajs/react';
import {
    Boxes,
    CheckCircle2,
    Clock,
    Eye,
    Pill,
    ShieldCheck,
} from 'lucide-react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type {
    PaginatedData,
    Prescription,
    PrescriptionStatus,
} from '../../types/pharmacy';
import { PrescriptionFilters } from '../components/prescription-filters';

type Props = {
    prescriptions: PaginatedData<Prescription>;
    units: Array<{ id: number; name: string; code: string }>;
    filters: {
        search: string;
        status: string;
        unit_id: number | null;
        date: string;
    };
    statistics: {
        total_today: number;
        submitted: number;
        verified: number;
        dispensed: number;
    };
};

function getStatusBadge(status: PrescriptionStatus) {
    switch (status) {
        case 'submitted':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 size-3" />
                    Menunggu Verifikasi
                </Badge>
            );
        case 'verified':
            return (
                <Badge variant="default" className="text-xs">
                    <ShieldCheck className="mr-1 size-3" />
                    Siap Dispensing
                </Badge>
            );
        case 'dispensed':
            return (
                <Badge variant="outline" className="border-border text-xs">
                    <CheckCircle2 className="mr-1 size-3" />
                    Selesai Dispensing
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="border-destructive text-xs text-destructive"
                >
                    Dibatalkan
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function PrescriptionList({
    prescriptions,
    units,
    filters,
    statistics,
}: Props) {
    const columns: DataTableColumn<Prescription>[] = [
        {
            key: 'prescription_number',
            header: 'No. Resep',
            className: 'w-36',
            render: (rx) => (
                <div className="space-y-0.5">
                    <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                        {rx.prescription_number}
                    </span>
                    {rx.encounter?.queue?.queue_code && (
                        <div className="text-[11px] text-muted-foreground">
                            Antrean: {rx.encounter.queue.queue_code}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (rx) => (
                <div>
                    <div className="font-medium text-foreground">
                        {rx.patient?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        RM: {rx.patient?.medical_record_number} •{' '}
                        {rx.patient?.gender === 'male' ? 'L' : 'P'}
                    </div>
                </div>
            ),
        },
        {
            key: 'doctor_unit',
            header: 'Dokter & Unit',
            render: (rx) => (
                <div>
                    <div className="text-sm font-medium text-foreground">
                        {rx.unit?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {rx.doctor?.name || '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Daftar Obat',
            render: (rx) => {
                const items = rx.items || [];
                return (
                    <div className="flex max-w-md flex-wrap gap-1">
                        {items.slice(0, 3).map((item) => (
                            <Badge
                                key={item.id}
                                variant="outline"
                                className="text-[11px] font-normal"
                            >
                                {item.drug?.name} ({item.quantity})
                            </Badge>
                        ))}
                        {items.length > 3 && (
                            <Badge
                                variant="secondary"
                                className="text-[11px] font-normal"
                            >
                                +{items.length - 3} obat lainnya
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            render: (rx) => getStatusBadge(rx.status),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-24 text-right',
            render: (rx) => (
                <Button asChild size="sm" variant="outline">
                    <Link href={route('pharmacy.prescriptions.show', rx.id)}>
                        <Eye className="mr-1.5 size-3.5" />
                        Proses
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Head title="Pelayanan Resep Farmasi" />

            <PageHeader
                title="Pelayanan Resep Farmasi"
                description="Verifikasi resep dokter, pengalokasian batch obat FEFO, dan penyerahan obat kepada pasien."
                actions={
                    <Button asChild variant="outline">
                        <Link href={route('pharmacy.stock.index')}>
                            <Boxes className="mr-1.5 size-4" />
                            Stok & Batch Obat
                        </Link>
                    </Button>
                }
            />

            {/* Statistik Ringkasan */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Resep Hari Ini
                        </CardTitle>
                        <Pill className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.total_today}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Kunjungan poli & gawat darurat
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Menunggu Verifikasi
                        </CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.submitted}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Perlu telaah klinis apoteker
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Siap Dispensing
                        </CardTitle>
                        <ShieldCheck className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.verified}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Resep siap disiapkan & diserahkan
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Selesai Dispensing
                        </CardTitle>
                        <CheckCircle2 className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.dispensed}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Obat telah diterima pasien
                        </p>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                rows={prescriptions.data}
                rowKey={(rx) => rx.id}
                empty="Belum ada data resep yang sesuai dengan kriteria."
                toolbar={
                    <PrescriptionFilters
                        filters={filters}
                        units={units}
                        current={prescriptions.data.length}
                        total={prescriptions.total}
                    />
                }
                footer={
                    <Pagination
                        links={prescriptions.links}
                        from={prescriptions.from}
                        to={prescriptions.to}
                        total={prescriptions.total}
                    />
                }
            />
        </div>
    );
}
