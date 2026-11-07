import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    History,
    Search,
    Stethoscope,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type {
    EncounterWithEmr,
    PaginatedEncounters,
} from '../types/medical-record';

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
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [unitId, setUnitId] = useState(
        filters.unit_id ? String(filters.unit_id) : '',
    );
    const [date, setDate] = useState(filters.date || '');

    const applyFilter = (params: Record<string, string | null>) => {
        const nextQuery: Record<string, string> = {
            search,
            status,
            unit_id: unitId,
            date,
            ...(Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== null),
            ) as Record<string, string>),
        };

        // Hapus filter yang kosong
        Object.keys(nextQuery).forEach((k) => {
            if (!nextQuery[k]) delete nextQuery[k];
        });

        router.get(route('medical-record.index'), nextQuery, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const formatAge = (birthDate: string): string => {
        const diffMs = Date.now() - new Date(birthDate).getTime();
        const ageDate = new Date(diffMs);
        return `${Math.abs(ageDate.getUTCFullYear() - 1970)} thn`;
    };

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
                            Sedang Diperiksa
                        </CardTitle>
                        <Activity className="size-4 text-primary" />
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

            {/* Filter Bar */}
            <Card className="border-border bg-card">
                <CardContent className="pt-6">
                    <form
                        onSubmit={handleSearch}
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <div>
                            <Input
                                placeholder="Cari nama, NIK, No. Rawat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    applyFilter({ date: e.target.value });
                                }}
                            />
                        </div>

                        <div>
                            <Select
                                value={unitId || 'all'}
                                onValueChange={(val) => {
                                    const nextUnit = val === 'all' ? '' : val;
                                    setUnitId(nextUnit);
                                    applyFilter({ unit_id: nextUnit });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Unit / Poli" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Unit / Poli
                                    </SelectItem>
                                    {units.map((u) => (
                                        <SelectItem
                                            key={u.id}
                                            value={String(u.id)}
                                        >
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Select
                                value={status || 'all'}
                                onValueChange={(val) => {
                                    const nextStatus = val === 'all' ? '' : val;
                                    setStatus(nextStatus);
                                    applyFilter({ status: nextStatus });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="arrived">
                                        Menunggu
                                    </SelectItem>
                                    <SelectItem value="in_consultation">
                                        Sedang Konsultasi
                                    </SelectItem>
                                    <SelectItem value="finished">
                                        Selesai
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                type="submit"
                                variant="secondary"
                                className="shrink-0"
                            >
                                <Search className="size-4" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Tabel Pasien / Kunjungan */}
            <Card className="border-border bg-card">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Antrean</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>No. Rawat & Tanggal</TableHead>
                                <TableHead>Unit & Dokter</TableHead>
                                <TableHead>Status Rekam Medis</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {encounters.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <AlertCircle className="mx-auto mb-2 size-6 text-muted-foreground" />
                                        Tidak ada daftar pasien untuk kriteria
                                        filter ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                encounters.data.map(
                                    (item: EncounterWithEmr) => {
                                        const hasFinal = item.assessments?.some(
                                            (a) => a.is_final,
                                        );
                                        const hasDraft = item.assessments?.some(
                                            (a) => !a.is_final,
                                        );

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-semibold text-foreground">
                                                        {item.queue
                                                            ?.queue_code || '-'}
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            item.status ===
                                                            'in_consultation'
                                                                ? 'default'
                                                                : item.status ===
                                                                    'finished'
                                                                  ? 'outline'
                                                                  : 'secondary'
                                                        }
                                                        className="mt-1 text-xs"
                                                    >
                                                        {item.status ===
                                                        'in_consultation'
                                                            ? 'Konsultasi'
                                                            : item.status ===
                                                                'finished'
                                                              ? 'Selesai'
                                                              : 'Menunggu'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">
                                                        {item.patient?.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        RM:{' '}
                                                        {
                                                            item.patient
                                                                ?.medical_record_number
                                                        }{' '}
                                                        •{' '}
                                                        {item.patient
                                                            ?.gender === 'male'
                                                            ? 'L'
                                                            : 'P'}{' '}
                                                        •{' '}
                                                        {item.patient
                                                            ?.birth_date
                                                            ? formatAge(
                                                                  item.patient
                                                                      .birth_date,
                                                              )
                                                            : '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {item.encounter_number}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            item.arrived_at,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-foreground">
                                                        {item.unit?.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.doctor?.name ||
                                                            'Dokter belum ditentukan'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
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
                                                    {item.diagnoses &&
                                                        item.diagnoses.length >
                                                            0 && (
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                Dx:{' '}
                                                                {item.diagnoses
                                                                    .map(
                                                                        (d) =>
                                                                            d.icd10_code,
                                                                    )
                                                                    .join(', ')}
                                                            </div>
                                                        )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {item.patient_id && (
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="ghost"
                                                                title="Lihat Riwayat Rekam Medis Pasien"
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'medical-record.patient.history',
                                                                        item.patient_id,
                                                                    )}
                                                                >
                                                                    <History className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'medical-record.encounters.show',
                                                                    item.id,
                                                                )}
                                                            >
                                                                <Stethoscope className="mr-1.5 size-4" />
                                                                Buka EMR
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    },
                                )
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Paginasi */}
            {encounters.last_page > 1 && (
                <div className="flex justify-end">
                    <Pagination
                        links={encounters.links}
                        from={encounters.from}
                        to={encounters.to}
                        total={encounters.total}
                    />
                </div>
            )}
        </div>
    );
}
