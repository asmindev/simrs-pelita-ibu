import { Head, Link } from '@inertiajs/react';
import {
    BedDouble,
    CheckCircle2,
    Hospital,
    Plus,
    Users,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type {
    Bed,
    BedClass,
    BedStatus,
    PaginatedData,
} from '../../types/inpatient';
import { BedFilters } from '../components/bed-filters';
import { NewBedDialog } from '../components/new-bed-dialog';

type Props = {
    beds: PaginatedData<Bed>;
    filters: {
        search: string;
        status: string;
        class: string;
    };
    statistics: {
        total_beds: number;
        available_beds: number;
        occupied_beds: number;
        maintenance_beds: number;
    };
};

function getClassBadge(bedClass: BedClass) {
    switch (bedClass) {
        case 'vip':
            return (
                <Badge variant="default" className="text-xs">
                    VIP
                </Badge>
            );
        case 'icu':
            return (
                <Badge variant="destructive" className="text-xs">
                    ICU
                </Badge>
            );
        case 'class_1':
            return (
                <Badge variant="secondary" className="text-xs">
                    Kelas 1
                </Badge>
            );
        case 'class_2':
            return (
                <Badge variant="outline" className="text-xs">
                    Kelas 2
                </Badge>
            );
        case 'class_3':
            return (
                <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                >
                    Kelas 3
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    {bedClass}
                </Badge>
            );
    }
}

function getStatusBadge(status: BedStatus) {
    switch (status) {
        case 'available':
            return (
                <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="mr-1 size-3 text-primary" />
                    Tersedia
                </Badge>
            );
        case 'occupied':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Users className="mr-1 size-3 text-foreground" />
                    Terisi Pasien
                </Badge>
            );
        case 'maintenance':
            return (
                <Badge variant="destructive" className="text-xs">
                    <Wrench className="mr-1 size-3" />
                    Perawatan
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    {status}
                </Badge>
            );
    }
}

export default function BedIndexPage({ beds, filters, statistics }: Props) {
    const [newBedOpen, setNewBedOpen] = useState(false);

    const columns: DataTableColumn<Bed>[] = [
        {
            key: 'bed_info',
            header: 'Bed & Ruangan',
            render: (bed: Bed) => (
                <div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <BedDouble className="size-3.5 text-muted-foreground" />
                        {bed.bed_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {bed.room_name}
                    </div>
                </div>
            ),
        },
        {
            key: 'class',
            header: 'Kelas',
            render: (bed: Bed) => getClassBadge(bed.class),
        },
        {
            key: 'daily_rate',
            header: 'Tarif / Hari',
            render: (bed: Bed) => (
                <div className="text-xs font-medium">
                    {formatCurrency(bed.daily_rate)}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (bed: Bed) => getStatusBadge(bed.status),
        },
        {
            key: 'current_patient',
            header: 'Pasien Terdaftar',
            render: (bed: Bed) => {
                const admission = bed.current_assignment?.admission;
                if (!admission || !admission.patient) {
                    return (
                        <span className="text-xs text-muted-foreground">-</span>
                    );
                }
                return (
                    <div>
                        <Link
                            href={route(
                                'inpatient.admissions.show',
                                admission.id,
                            )}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            {admission.patient.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                            RM: {admission.patient.medical_record_number}
                        </div>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <Head title="Manajemen Bed & Kamar — SIMRS" />
            <PageHeader
                title="Manajemen Bed & Kamar"
                description="Kelola ketersediaan tempat tidur, status kamar, dan pantau pasien rawat inap."
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('inpatient.admissions.index')}>
                                <Hospital className="mr-1.5 size-4" />
                                Daftar Pasien Rawat Inap
                            </Link>
                        </Button>
                        <Button size="sm" onClick={() => setNewBedOpen(true)}>
                            <Plus className="mr-1.5 size-4" />
                            Tambah Bed
                        </Button>
                    </div>
                }
            />

            {/* Statistic Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Total Tempat Tidur
                        </CardTitle>
                        <BedDouble className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.total_beds}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Kapasitas seluruh ruangan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Bed Tersedia (Kosong)
                        </CardTitle>
                        <CheckCircle2 className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.available_beds}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Siap digunakan admisi baru
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Bed Terisi Pasien
                        </CardTitle>
                        <Users className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.occupied_beds}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Pasien aktif rawat inap
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Dalam Perawatan / Rusak
                        </CardTitle>
                        <Wrench className="size-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.maintenance_beds}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Bed sedang diservis / perbaikan
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Bed Table */}
            <DataTable<Bed>
                columns={columns}
                rows={beds.data}
                rowKey={(bed) => bed.id}
                empty="Belum ada data tempat tidur yang terdaftar."
                toolbar={
                    <BedFilters
                        filters={filters}
                        current={beds.data.length}
                        total={beds.total}
                    />
                }
                footer={
                    <Pagination
                        links={beds.links}
                        from={beds.from}
                        to={beds.to}
                        total={beds.total}
                    />
                }
            />

            <NewBedDialog open={newBedOpen} onOpenChange={setNewBedOpen} />
        </div>
    );
}
