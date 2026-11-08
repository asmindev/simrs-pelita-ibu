import { Head, Link } from '@inertiajs/react';
import {
    BedDouble,
    Eye,
    LogOut,
    Percent,
    Plus,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type {
    Admission,
    AdmissionEncounter,
    AdmissionStatus,
    Bed,
    PaginatedData,
} from '../../types/inpatient';
import { AdmissionFilters } from '../components/admission-filters';
import { NewAdmissionDialog } from '../components/new-admission-dialog';

type Props = {
    admissions: PaginatedData<Admission>;
    availableBeds: Bed[];
    activeEncounters: AdmissionEncounter[];
    filters: {
        search: string;
        status: string;
    };
    statistics: {
        active_patients: number;
        discharged_today: number;
        available_beds: number;
        bed_occupancy_rate: number;
    };
};

function getStatusBadge(status: AdmissionStatus) {
    switch (status) {
        case 'active':
            return (
                <Badge variant="outline" className="text-xs">
                    <UserCheck className="mr-1 size-3 text-primary" />
                    Sedang Dirawat
                </Badge>
            );
        case 'discharged':
            return (
                <Badge variant="secondary" className="text-xs">
                    <LogOut className="mr-1 size-3 text-muted-foreground" />
                    Sudah Pulang
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

export default function AdmissionIndexPage({
    admissions,
    availableBeds,
    activeEncounters,
    filters,
    statistics,
}: Props) {
    const [newAdmissionOpen, setNewAdmissionOpen] = useState(false);

    const columns: DataTableColumn<Admission>[] = [
        {
            key: 'admission_info',
            header: 'No. Admisi & Tanggal',
            render: (adm: Admission) => (
                <div>
                    <div className="font-semibold text-foreground">
                        {adm.admission_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {formatDateTime(adm.admitted_at)}
                    </div>
                </div>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (adm: Admission) => (
                <div>
                    <div className="font-medium text-foreground">
                        {adm.patient?.name ?? '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        RM: {adm.patient?.medical_record_number ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'current_bed',
            header: 'Kamar & Bed',
            render: (adm: Admission) => {
                const bed = adm.current_assignment?.bed;
                if (!bed) {
                    return (
                        <span className="text-xs text-muted-foreground">
                            Belum dialokasikan
                        </span>
                    );
                }
                return (
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <BedDouble className="size-3.5 text-muted-foreground" />
                            {bed.room_name} ({bed.bed_number})
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                            Kelas {bed.class.replace('_', ' ')}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'doctor',
            header: 'DPJP',
            render: (adm: Admission) => (
                <div className="text-xs">
                    {adm.doctor?.name ??
                        adm.doctor?.user?.name ??
                        'Dokter Jaga'}
                </div>
            ),
        },
        {
            key: 'initial_diagnosis',
            header: 'Diagnosa Awal',
            render: (adm: Admission) => (
                <div className="max-w-xs truncate text-xs text-muted-foreground">
                    {adm.initial_diagnosis || '-'}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (adm: Admission) => getStatusBadge(adm.status),
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (adm: Admission) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    asChild
                >
                    <Link href={route('inpatient.admissions.show', adm.id)}>
                        <Eye className="mr-1 size-3.5" />
                        Detail
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Head title="Rawat Inap Pasien — SIMRS" />
            <PageHeader
                title="Rawat Inap Pasien (Inpatient)"
                description="Kelola admisi, perpindahan bed, dan pemulangan pasien rawat inap."
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('inpatient.beds.index')}>
                                <BedDouble className="mr-1.5 size-4" />
                                Katalog Bed
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setNewAdmissionOpen(true)}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Admisi Pasien Baru
                        </Button>
                    </div>
                }
            />

            {/* Statistic Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Pasien Dirawat Aktif
                        </CardTitle>
                        <Users className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.active_patients}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Sedang menempati ruangan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Bed Kosong (Tersedia)
                        </CardTitle>
                        <BedDouble className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.available_beds}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Siap digunakan untuk admisi
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Bed Occupancy Rate (BOR)
                        </CardTitle>
                        <Percent className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.bed_occupancy_rate}%
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Persentase keterisian tempat tidur
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Pasien Pulang Hari Ini
                        </CardTitle>
                        <LogOut className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.discharged_today}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Selesai perawatan rawat inap
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Admission Table */}
            <DataTable<Admission>
                columns={columns}
                rows={admissions.data}
                rowKey={(adm) => adm.id}
                empty="Belum ada catatan admisi rawat inap."
                toolbar={
                    <AdmissionFilters
                        filters={filters}
                        current={admissions.data.length}
                        total={admissions.total}
                    />
                }
                footer={
                    <Pagination
                        links={admissions.links}
                        from={admissions.from}
                        to={admissions.to}
                        total={admissions.total}
                    />
                }
            />

            <NewAdmissionDialog
                open={newAdmissionOpen}
                onOpenChange={setNewAdmissionOpen}
                availableBeds={availableBeds}
                activeEncounters={activeEncounters}
            />
        </div>
    );
}
