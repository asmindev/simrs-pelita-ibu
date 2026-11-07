import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { PageHeader } from '@/shared/components/page-header';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

import type {
    ClinicalReportType,
    EncounterWithEmr,
} from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
    doctors: Array<{ id: number; name: string }>;
};

export default function ClinicalReportCreate({ encounter, doctors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        report_type: 'surgery' as ClinicalReportType,
        title: '',
        reported_at: new Date().toISOString().slice(0, 16),
        doctor_id: encounter.doctor_id ? String(encounter.doctor_id) : '',
        content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('medical-record.encounters.reports.store', encounter.id));
    };

    const handleTypeChange = (type: ClinicalReportType) => {
        setData((prev) => ({
            ...prev,
            report_type: type,
            title:
                type === 'surgery'
                    ? 'Laporan Operasi Bedah'
                    : type === 'birth'
                      ? 'Surat Keterangan Kelahiran'
                      : 'Surat Keterangan Kematian',
        }));
    };

    return (
        <div className="space-y-6">
            <Head title="Penerbitan Laporan Klinis Khusus" />

            <PageHeader
                title="Penerbitan Dokumen Laporan Klinis"
                description={`Pasien: ${encounter.patient?.name || '-'} (No. Rawat ${encounter.encounter_number})`}
                actions={
                    <Button asChild variant="outline">
                        <Link
                            href={route(
                                'medical-record.encounters.show',
                                encounter.id,
                            )}
                        >
                            <ArrowLeft className="mr-1.5 size-4" />
                            Kembali ke EMR
                        </Link>
                    </Button>
                }
            />

            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Formulir Dokumen Klinis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1">
                                <Label htmlFor="report_type">
                                    Jenis Laporan
                                </Label>
                                <Select
                                    value={data.report_type}
                                    onValueChange={(val) =>
                                        handleTypeChange(
                                            val as ClinicalReportType,
                                        )
                                    }
                                >
                                    <SelectTrigger id="report_type">
                                        <SelectValue placeholder="Pilih Jenis Laporan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="surgery">
                                            Laporan Operasi Bedah
                                        </SelectItem>
                                        <SelectItem value="birth">
                                            Surat Keterangan Kelahiran
                                        </SelectItem>
                                        <SelectItem value="death">
                                            Surat Keterangan Kematian
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.report_type && (
                                    <p className="text-xs text-destructive">
                                        {errors.report_type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="title">
                                    Judul Dokumen / Nama Tindakan
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Laporan Operasi Laparoskopi Kolesistektomi"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="doctor_id">
                                    Dokter Penanggung Jawab / Operator
                                </Label>
                                <Select
                                    value={data.doctor_id || 'none'}
                                    onValueChange={(val) =>
                                        setData(
                                            'doctor_id',
                                            val === 'none' ? '' : val,
                                        )
                                    }
                                >
                                    <SelectTrigger id="doctor_id">
                                        <SelectValue placeholder="Pilih Dokter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Pilih Dokter
                                        </SelectItem>
                                        {doctors.map((d) => (
                                            <SelectItem
                                                key={d.id}
                                                value={String(d.id)}
                                            >
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.doctor_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.doctor_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="reported_at">
                                    Waktu Pelaksanaan / Penerbitan
                                </Label>
                                <Input
                                    id="reported_at"
                                    type="datetime-local"
                                    value={data.reported_at}
                                    onChange={(e) =>
                                        setData('reported_at', e.target.value)
                                    }
                                />
                                {errors.reported_at && (
                                    <p className="text-xs text-destructive">
                                        {errors.reported_at}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="content">
                                Isi Rincian Laporan Klinis
                            </Label>
                            <Textarea
                                id="content"
                                rows={10}
                                placeholder="Tuliskan jalannya operasi, temuan intraoperatif, kondisi bayi baru lahir, atau penyebab kematian..."
                                value={data.content}
                                onChange={(e) =>
                                    setData('content', e.target.value)
                                }
                            />
                            {errors.content && (
                                <p className="text-xs text-destructive">
                                    {errors.content}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button asChild variant="outline">
                                <Link
                                    href={route(
                                        'medical-record.encounters.show',
                                        encounter.id,
                                    )}
                                >
                                    Batal
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-1.5 size-4" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Terbitkan Dokumen Laporan'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
