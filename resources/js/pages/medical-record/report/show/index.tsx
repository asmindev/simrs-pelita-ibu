import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

import type { ClinicalReport } from '../../types/medical-record';

type Props = {
    report: ClinicalReport;
};

export default function ClinicalReportShow({ report }: Props) {
    const handlePrint = () => {
        window.print();
    };

    const getReportTypeName = (type: string) => {
        switch (type) {
            case 'surgery':
                return 'LAPORAN OPERASI BEDAH';
            case 'birth':
                return 'SURAT KETERANGAN KELAHIRAN';
            case 'death':
                return 'SURAT KETERANGAN KEMATIAN';
            default:
                return 'LAPORAN KLINIS';
        }
    };

    return (
        <div className="space-y-4">
            <Head
                title={`${report.title} - ${report.patient?.name || 'Pasien'}`}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <div>
                    <h2 className="text-base font-bold text-foreground">
                        {report.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Diterbitkan pada{' '}
                        {new Date(report.reported_at).toLocaleString('id-ID')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-medium"
                    >
                        <Link
                            href={
                                report.encounter?.id
                                    ? route(
                                          'medical-record.encounters.show',
                                          report.encounter.id,
                                      )
                                    : route('medical-record.reports.index')
                            }
                        >
                            <ArrowLeft className="size-3.5" />
                            Kembali
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        onClick={handlePrint}
                        className="h-8 gap-1.5 text-xs font-medium"
                    >
                        <Printer className="size-3.5" />
                        Cetak Dokumen
                    </Button>
                </div>
            </div>

            {/* Lembar Dokumen Formal */}
            <Card className="border-border bg-card shadow-sm print:border-none print:shadow-none">
                <CardContent className="space-y-6 p-8 sm:p-12">
                    {/* Kop Rumah Sakit */}
                    <div className="border-b border-border pb-6 text-center">
                        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
                            RUMAH SAKIT UMUM DAERAH
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Instalasi Rekam Medis & Pelayanan Klinis Terpadu
                        </p>
                        <div className="mt-4">
                            <Badge
                                variant="outline"
                                className="text-xs font-semibold tracking-wider uppercase"
                            >
                                {getReportTypeName(report.report_type)}
                            </Badge>
                        </div>
                        <h2 className="mt-2 text-lg font-bold text-foreground">
                            {report.title}
                        </h2>
                    </div>

                    {/* Data Pasien & Kunjungan */}
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                            <div>
                                <span className="text-muted-foreground">
                                    Nama Pasien:{' '}
                                </span>
                                <strong className="text-foreground">
                                    {report.patient?.name}
                                </strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    No. Rekam Medis:{' '}
                                </span>
                                <span className="font-mono text-foreground">
                                    {report.patient?.medical_record_number}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Jenis Kelamin:{' '}
                                </span>
                                <span className="text-foreground">
                                    {report.patient?.gender === 'male'
                                        ? 'Laki-laki'
                                        : 'Perempuan'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1 text-right">
                            <div>
                                <span className="text-muted-foreground">
                                    No. Rawat:{' '}
                                </span>
                                <span className="font-mono text-foreground">
                                    {report.encounter?.encounter_number}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Unit Pelayanan:{' '}
                                </span>
                                <span className="text-foreground">
                                    {report.encounter?.unit?.name || '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Waktu Dokumen:{' '}
                                </span>
                                <span className="text-foreground">
                                    {new Date(
                                        report.reported_at,
                                    ).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Isi Laporan */}
                    <div className="min-h-64 space-y-2 py-4">
                        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                            Deskripsi & Temuan Klinis
                        </h3>
                        <div className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                            {report.content}
                        </div>
                    </div>

                    {/* Tanda Tangan Dokter */}
                    <div className="flex justify-end border-t border-border pt-8">
                        <div className="w-64 space-y-12 text-center">
                            <div className="text-xs text-muted-foreground">
                                Dokter Penanggung Jawab Pelayanan,
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-bold text-foreground underline">
                                    {report.doctor?.name ||
                                        '(..................................................)'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    SIP / NIP Terdaftar
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
