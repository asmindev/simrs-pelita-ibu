import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    FileText,
    History,
    MoreHorizontal,
    Stethoscope,
    Users,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type {
    EncounterWithEmr,
    PaginatedEncounters,
} from '../types/medical-record';
import { MedicalRecordFilters } from './components/medical-record-filters';

type Props = {
    encounters: PaginatedEncounters;
    units: Array<{ id: number; name: string; code: string }>;
    filters: {
        search: string;
        status: string;
        unit_id: number | null;
        date: string;
    };
    statistics: {
        total_today: number;
        in_consultation: number;
        waiting: number;
        finished: number;
    };
};

export default function MedicalRecordIndex({
    encounters,
    units,
    filters,
    statistics,
}: Props) {
    const formatAge = (birthDate: string): string => {
        const diffMs = Date.now() - new Date(birthDate).getTime();
        const ageDate = new Date(diffMs);
        return `${Math.abs(ageDate.getUTCFullYear() - 1970)} thn`;
    };

    const columns: DataTableColumn<EncounterWithEmr>[] = [
        {
            key: 'queue',
            header: 'Antrean',
            className: 'w-28',
            render: (item) => (
                <div>
                    <div className="font-semibold text-foreground">
                        {item.queue?.queue_code || '-'}
                    </div>
                    <Badge
                        variant={
                            item.status === 'in_consultation'
                                ? 'default'
                                : item.status === 'finished'
                                  ? 'outline'
                                  : 'secondary'
                        }
                        className="mt-1 text-xs"
                    >
                        {item.status === 'in_consultation'
                            ? 'Konsultasi'
                            : item.status === 'finished'
                              ? 'Selesai'
                              : 'Menunggu'}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (item) => (
                <div>
                    <div className="font-medium text-foreground">
                        {item.patient?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        RM: {item.patient?.medical_record_number} •{' '}
                        {item.patient?.gender === 'male' ? 'L' : 'P'} •{' '}
                        {item.patient?.birth_date
                            ? formatAge(item.patient.birth_date)
                            : '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'encounter',
            header: 'No. Rawat & Jam',
            render: (item) => (
                <div>
                    <div className="font-mono text-xs font-medium text-foreground tabular-nums">
                        {item.encounter_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {new Date(item.arrived_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            ),
        },
        {
            key: 'unit_doctor',
            header: 'Unit & Dokter',
            render: (item) => (
                <div>
                    <div className="text-sm font-medium text-foreground">
                        {item.unit?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {item.doctor?.name || 'Dokter belum ditentukan'}
                    </div>
                </div>
            ),
        },
        {
            key: 'emr_status',
            header: 'Status Rekam Medis',
            render: (item) => {
                const hasFinal = item.assessments?.some((a) => a.is_final);
                const hasDraft = item.assessments?.some((a) => !a.is_final);

                return (
                    <div>
                        {hasFinal ? (
                            <Badge
                                variant="outline"
                                className="border-border text-foreground"
                            >
                                <CheckCircle2 className="mr-1 size-3" />
                                Final (Terkunci)
                            </Badge>
                        ) : hasDraft ? (
                            <Badge variant="secondary">
                                <Clock className="mr-1 size-3" />
                                Draft Klinis
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="text-muted-foreground"
                            >
                                Belum Diperiksa
                            </Badge>
                        )}
                        {item.diagnoses && item.diagnoses.length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                                Dx:{' '}
                                {item.diagnoses
                                    .map((d) => d.icd10_code)
                                    .join(', ')}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (item) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Buka menu aksi</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(
                                        'medical-record.encounters.show',
                                        item.id,
                                    )}
                                >
                                    <Stethoscope className="mr-2 size-3.5" />
                                    Buka EMR
                                </Link>
                            </DropdownMenuItem>
                            {item.patient_id && (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route(
                                            'medical-record.patient.history',
                                            item.patient_id,
                                        )}
                                    >
                                        <History className="mr-2 size-3.5" />
                                        Riwayat Rekam Medis
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Head title="Pusat Rekam Medis Elektronik" />

            <PageHeader
                title="Rekam Medis Elektronik (EMR)"
                description="Pusat kerja klinis dokter dan perawat untuk pencatatan asesmen SOAP, diagnosis ICD-10, tindakan, dan laporan medis."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('medical-record.reports.index')}>
                                <FileText className="mr-1.5 size-4" />
                                Laporan Klinis
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* Statistik Hari Ini */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pasien
                        </CardTitle>
                        <Users className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.total_today}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Kunjungan pada tanggal terpilih
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Sedang Ditangani
                        </CardTitle>
                        <Stethoscope className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.in_consultation}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Dalam penanganan di ruang periksa
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Menunggu Dokter
                        </CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.waiting}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pasien sudah hadir di poliklinik
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Selesai Pelayanan
                        </CardTitle>
                        <CheckCircle2 className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {statistics.finished}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Asesmen medis telah ditutup
                        </p>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                rows={encounters.data}
                rowKey={(item) => item.id}
                empty="Tidak ada daftar pasien untuk kriteria filter ini."
                toolbar={
                    <MedicalRecordFilters
                        filters={filters}
                        units={units}
                        current={encounters.data.length}
                        total={encounters.total}
                    />
                }
                footer={
                    <Pagination
                        links={encounters.links}
                        from={encounters.from}
                        to={encounters.to}
                        total={encounters.total}
                    />
                }
            />
        </div>
    );
}
