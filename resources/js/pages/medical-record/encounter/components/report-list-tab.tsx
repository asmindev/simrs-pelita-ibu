import { Link } from '@inertiajs/react';
import { AlertCircle, FileText, Plus } from 'lucide-react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type { EncounterWithEmr } from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
};

export function ReportListTab({ encounter }: Props) {
    const reports = encounter.clinical_reports || [];

    const getReportBadge = (type: string) => {
        switch (type) {
            case 'surgery':
                return <Badge variant="default">Laporan Operasi</Badge>;
            case 'birth':
                return <Badge variant="secondary">Keterangan Kelahiran</Badge>;
            case 'death':
                return <Badge variant="outline">Keterangan Kematian</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Laporan Klinis Khusus
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Laporan operasi bedah, surat keterangan kelahiran, dan
                        surat keterangan kematian.
                    </p>
                </div>
                <Button asChild size="sm">
                    <Link
                        href={route(
                            'medical-record.encounters.reports.create',
                            encounter.id,
                        )}
                    >
                        <Plus className="mr-1.5 size-4" />
                        Buat Laporan Baru
                    </Link>
                </Button>
            </div>

            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Daftar Laporan Terbit ({reports.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-36">
                                    Jenis Laporan
                                </TableHead>
                                <TableHead>Judul Laporan</TableHead>
                                <TableHead>Tanggal Terbit</TableHead>
                                <TableHead>Dokter Penanggung Jawab</TableHead>
                                <TableHead className="w-24 text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        <AlertCircle className="mx-auto mb-1 size-5 text-muted-foreground" />
                                        Belum ada laporan klinis yang dibuat
                                        untuk kunjungan ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            {getReportBadge(r.report_type)}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {r.title}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(
                                                r.reported_at,
                                            ).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {r.doctor?.name || '-'}
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
                                                    <FileText className="mr-1 size-3.5" />
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
        </div>
    );
}
