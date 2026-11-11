import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, MoreHorizontal } from 'lucide-react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type {
    ClinicalReport,
    PaginatedReports,
} from '../../types/medical-record';
import { ClinicalReportFilters } from '../components/clinical-report-filters';

type Props = {
    reports: PaginatedReports;
    filters: {
        report_type: string;
        search: string;
    };
};

export default function ClinicalReportList({ reports, filters }: Props) {
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

    const columns: DataTableColumn<ClinicalReport>[] = [
        {
            key: 'report_type',
            header: 'Kategori',
            className: 'w-32',
            render: (r) => getReportBadge(r.report_type),
        },
        {
            key: 'title',
            header: 'Judul Laporan',
            render: (r) => (
                <span className="font-semibold text-foreground">{r.title}</span>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (r) => (
                <div>
                    <div className="font-medium text-foreground">
                        {r.patient?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        RM: {r.patient?.medical_record_number}
                    </div>
                </div>
            ),
        },
        {
            key: 'doctor',
            header: 'Dokter Penanggung Jawab',
            render: (r) => (
                <span className="text-sm text-foreground">
                    {r.doctor?.name || '-'}
                </span>
            ),
        },
        {
            key: 'reported_at',
            header: 'Tanggal Terbit',
            render: (r) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(r.reported_at).toLocaleString('id-ID')}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (r) => (
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
                        <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(
                                        'medical-record.reports.show',
                                        r.id,
                                    )}
                                >
                                    <FileText className="mr-2 size-3.5" />
                                    Buka Laporan
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Head title="Daftar Laporan Klinis Rumah Sakit — SIMRS" />

            <DataTable
                columns={columns}
                rows={reports.data}
                rowKey={(r) => r.id}
                empty="Belum ada dokumen laporan klinis yang sesuai dengan kriteria."
                toolbar={
                    <ClinicalReportFilters
                        filters={filters}
                        current={reports.data.length}
                        total={reports.total}
                        actions={
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Link href={route('medical-record.index')}>
                                    <ArrowLeft className="size-3.5" />
                                    Kembali ke Rekam Medis
                                </Link>
                            </Button>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={reports.links}
                        from={reports.from}
                        to={reports.to}
                        total={reports.total}
                    />
                }
            />
        </div>
    );
}
