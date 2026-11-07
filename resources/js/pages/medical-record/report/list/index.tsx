import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, FileText, Search } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
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
    ClinicalReport,
    PaginatedReports,
} from '../../types/medical-record';

type Props = {
    reports: PaginatedReports;
    filters: {
        report_type: string;
        search: string;
    };
};

export default function ClinicalReportList({ reports, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [reportType, setReportType] = useState(filters.report_type || '');

    const applyFilter = (params: Record<string, string>) => {
        const query: Record<string, string> = {
            search,
            report_type: reportType,
            ...params,
        };

        Object.keys(query).forEach((k) => {
            if (!query[k]) delete query[k];
        });

        router.get(route('medical-record.reports.index'), query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const getReportBadge = (type: string) => {
        switch (type) {
            case 'surgery':
                return <Badge variant="default">Operasi</Badge>;
            case 'birth':
                return <Badge variant="secondary">Kelahiran</Badge>;
            case 'death':
                return <Badge variant="outline">Kematian</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Head title="Daftar Laporan Klinis Rumah Sakit" />

            <PageHeader
                title="Laporan Klinis Khusus"
                description="Pusat arsip dan penerbitan laporan operasi bedah, surat keterangan kelahiran, dan surat kematian."
                actions={
                    <Button asChild variant="outline">
                        <Link href={route('medical-record.index')}>
                            <ArrowLeft className="mr-1.5 size-4" />
                            Kembali ke Rekam Medis
                        </Link>
                    </Button>
                }
            />

            {/* Filter Bar */}
            <Card className="border-border bg-card">
                <CardContent className="pt-6">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-wrap gap-3"
                    >
                        <div className="min-w-64 flex-1">
                            <Input
                                placeholder="Cari judul, nama pasien, atau No. RM..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="w-56">
                            <Select
                                value={reportType || 'all'}
                                onValueChange={(val) => {
                                    const nextType = val === 'all' ? '' : val;
                                    setReportType(nextType);
                                    applyFilter({
                                        report_type: nextType,
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Jenis Laporan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Jenis Laporan
                                    </SelectItem>
                                    <SelectItem value="surgery">
                                        Laporan Operasi
                                    </SelectItem>
                                    <SelectItem value="birth">
                                        Keterangan Kelahiran
                                    </SelectItem>
                                    <SelectItem value="death">
                                        Keterangan Kematian
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" variant="secondary">
                            <Search className="mr-1.5 size-4" />
                            Cari
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Tabel Laporan */}
            <Card className="border-border bg-card">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-32">Kategori</TableHead>
                                <TableHead>Judul Laporan</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Dokter Penanggung Jawab</TableHead>
                                <TableHead>Tanggal Terbit</TableHead>
                                <TableHead className="w-24 text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-28 text-center text-muted-foreground"
                                    >
                                        <AlertCircle className="mx-auto mb-1 size-5 text-muted-foreground" />
                                        Belum ada dokumen laporan klinis yang
                                        sesuai dengan kriteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.data.map((r: ClinicalReport) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            {getReportBadge(r.report_type)}
                                        </TableCell>
                                        <TableCell className="font-semibold text-foreground">
                                            {r.title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-foreground">
                                                {r.patient?.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                RM:{' '}
                                                {
                                                    r.patient
                                                        ?.medical_record_number
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {r.doctor?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(
                                                r.reported_at,
                                            ).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={route(
                                                        'medical-record.reports.show',
                                                        r.id,
                                                    )}
                                                >
                                                    <FileText className="mr-1.5 size-3.5" />
                                                    Buka
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Paginasi */}
            {reports.last_page > 1 && (
                <div className="flex justify-end">
                    <Pagination
                        links={reports.links}
                        from={reports.from}
                        to={reports.to}
                        total={reports.total}
                    />
                </div>
            )}
        </div>
    );
}
