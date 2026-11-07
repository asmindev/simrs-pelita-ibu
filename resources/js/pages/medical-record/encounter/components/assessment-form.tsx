import { router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Lock,
    RefreshCw,
    Save,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
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
    Assessment,
    AssessmentType,
    EncounterWithEmr,
    VitalSigns,
} from '../../types/medical-record';
import { AddendumDialog } from './addendum-dialog';

type Props = {
    encounter: EncounterWithEmr;
};

export function AssessmentForm({ encounter }: Props) {
    const existingAssessment = encounter.assessments?.[0] as
        | Assessment
        | undefined;
    const isFinal = existingAssessment?.is_final ?? false;

    const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>(
        'idle',
    );
    const [finalizing, setFinalizing] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        type: (existingAssessment?.type || 'soap') as AssessmentType,
        subjective: existingAssessment?.subjective || '',
        objective: existingAssessment?.objective || '',
        assessment: existingAssessment?.assessment || '',
        plan: existingAssessment?.plan || '',
        triage_level: existingAssessment?.triage_level || 'green',
        allergies: existingAssessment?.allergies || '',
        vital_signs: {
            systolic: existingAssessment?.vital_signs?.systolic || '',
            diastolic: existingAssessment?.vital_signs?.diastolic || '',
            heart_rate: existingAssessment?.vital_signs?.heart_rate || '',
            respiratory_rate:
                existingAssessment?.vital_signs?.respiratory_rate || '',
            temperature: existingAssessment?.vital_signs?.temperature || '',
            spo2: existingAssessment?.vital_signs?.spo2 || '',
            weight: existingAssessment?.vital_signs?.weight || '',
            height: existingAssessment?.vital_signs?.height || '',
        } as VitalSigns,
        last_updated_at: existingAssessment?.updated_at || '',
    });

    const updateVital = (key: keyof VitalSigns, value: string) => {
        setData('vital_signs', {
            ...data.vital_signs,
            [key]: value,
        });
    };

    // Autosave draft setiap 15 detik jika belum difinalisasi
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFinal) return;

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            setDraftStatus('saving');
            fetch(
                route('medical-record.encounters.drafts.store', encounter.id),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({
                        form_type: 'soap',
                        content: data,
                    }),
                },
            )
                .then((res) => {
                    if (res.ok) setDraftStatus('saved');
                    else setDraftStatus('idle');
                })
                .catch(() => setDraftStatus('idle'));
        }, 12000);

        return () => clearTimeout(timer);
    }, [data, isFinal, encounter.id]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (existingAssessment) {
            put(
                route(
                    'medical-record.assessments.update',
                    existingAssessment.id,
                ),
                {
                    preserveScroll: true,
                },
            );
        } else {
            post(
                route(
                    'medical-record.encounters.assessments.store',
                    encounter.id,
                ),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleFinalize = () => {
        if (!existingAssessment) return;
        if (
            !confirm(
                'Apakah Anda yakin ingin memfinalisasi asesmen ini? Setelah difinalisasi, rekam medis akan terkunci dan koreksi hanya bisa melalui addendum.',
            )
        ) {
            return;
        }

        setFinalizing(true);
        router.post(
            route('medical-record.assessments.finalize', existingAssessment.id),
            {
                last_updated_at: existingAssessment.updated_at,
            },
            {
                preserveScroll: true,
                onFinish: () => setFinalizing(false),
            },
        );
    };

    return (
        <div className="space-y-6">
            {/* Banner Konflik Pembaruan Optimistik */}
            {errors.last_updated_at && (
                <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="size-5 shrink-0" />
                        <div>
                            <div className="font-semibold">
                                Konflik Penyimpanan Rekam Medis
                            </div>
                            <div className="text-sm">
                                {errors.last_updated_at}
                            </div>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => router.reload()}
                        className="shrink-0"
                    >
                        <RefreshCw className="mr-1.5 size-4" />
                        Muat Ulang Halaman
                    </Button>
                </div>
            )}

            {/* Banner Status Rekam Medis */}
            {isFinal ? (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Lock className="size-5 text-muted-foreground" />
                        <div>
                            <div className="font-semibold text-foreground">
                                Rekam Medis Telah Difinalisasi (Terkunci)
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Difinalisasi pada{' '}
                                {existingAssessment?.finalized_at
                                    ? new Date(
                                          existingAssessment.finalized_at,
                                      ).toLocaleString('id-ID')
                                    : '-'}
                                {existingAssessment?.finalized_by_user &&
                                    ` oleh ${existingAssessment.finalized_by_user.name}`}
                            </div>
                        </div>
                    </div>
                    <AddendumDialog assessment={existingAssessment!} />
                </div>
            ) : (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Mode Pengisian Aktif</Badge>
                        {draftStatus === 'saving' && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <RefreshCw className="size-3 animate-spin" />
                                Menyimpan draf ke server...
                            </span>
                        )}
                        {draftStatus === 'saved' && (
                            <span className="flex items-center gap-1 text-primary">
                                <CheckCircle2 className="size-3" />
                                Draf otomatis tersimpan
                            </span>
                        )}
                    </div>
                    {existingAssessment && (
                        <span>
                            Terakhir diubah:{' '}
                            {new Date(
                                existingAssessment.updated_at,
                            ).toLocaleTimeString('id-ID')}
                        </span>
                    )}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Tanda-tanda Vital & Triase */}
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                            Tanda-tanda Vital & Triase
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                                <Label htmlFor="systolic">
                                    Tekanan Darah (Sistolik / Diastolik)
                                </Label>
                                <div className="flex items-center gap-1">
                                    <Input
                                        id="systolic"
                                        placeholder="120"
                                        disabled={isFinal}
                                        value={data.vital_signs?.systolic || ''}
                                        onChange={(e) =>
                                            updateVital(
                                                'systolic',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span className="text-muted-foreground">
                                        /
                                    </span>
                                    <Input
                                        placeholder="80"
                                        disabled={isFinal}
                                        value={
                                            data.vital_signs?.diastolic || ''
                                        }
                                        onChange={(e) =>
                                            updateVital(
                                                'diastolic',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        mmHg
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="heart_rate">Denyut Nadi</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="heart_rate"
                                        placeholder="80"
                                        disabled={isFinal}
                                        value={
                                            data.vital_signs?.heart_rate || ''
                                        }
                                        onChange={(e) =>
                                            updateVital(
                                                'heart_rate',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        x/mnt
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="respiratory_rate">
                                    Frekuensi Napas
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="respiratory_rate"
                                        placeholder="20"
                                        disabled={isFinal}
                                        value={
                                            data.vital_signs
                                                ?.respiratory_rate || ''
                                        }
                                        onChange={(e) =>
                                            updateVital(
                                                'respiratory_rate',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        x/mnt
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="temperature">Suhu Tubuh</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="temperature"
                                        placeholder="36.5"
                                        disabled={isFinal}
                                        value={
                                            data.vital_signs?.temperature || ''
                                        }
                                        onChange={(e) =>
                                            updateVital(
                                                'temperature',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        °C
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="spo2">
                                    Saturasi Oksigen (SpO2)
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="spo2"
                                        placeholder="98"
                                        disabled={isFinal}
                                        value={data.vital_signs?.spo2 || ''}
                                        onChange={(e) =>
                                            updateVital('spo2', e.target.value)
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="weight">Berat Badan</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="weight"
                                        placeholder="60"
                                        disabled={isFinal}
                                        value={data.vital_signs?.weight || ''}
                                        onChange={(e) =>
                                            updateVital(
                                                'weight',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        kg
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="height">Tinggi Badan</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="height"
                                        placeholder="165"
                                        disabled={isFinal}
                                        value={data.vital_signs?.height || ''}
                                        onChange={(e) =>
                                            updateVital(
                                                'height',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        cm
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="triage_level">
                                    Kategori Triase
                                </Label>
                                <Select
                                    disabled={isFinal}
                                    value={data.triage_level || 'green'}
                                    onValueChange={(val) =>
                                        setData('triage_level', val)
                                    }
                                >
                                    <SelectTrigger id="triage_level">
                                        <SelectValue placeholder="Pilih Triase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="green">
                                            Hijau (Tidak Gawat Tidak Darurat)
                                        </SelectItem>
                                        <SelectItem value="yellow">
                                            Kuning (Gawat Tidak Darurat)
                                        </SelectItem>
                                        <SelectItem value="red">
                                            Merah (Gawat Darurat)
                                        </SelectItem>
                                        <SelectItem value="black">
                                            Hitam (Meninggal Dunia)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="allergies">
                                Riwayat Alergi (Makanan / Obat-obatan)
                            </Label>
                            <Input
                                id="allergies"
                                placeholder="Tuliskan riwayat alergi jika ada, atau 'Tidak Ada Alergi'"
                                disabled={isFinal}
                                value={data.allergies}
                                onChange={(e) =>
                                    setData('allergies', e.target.value)
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Form SOAP Klinis */}
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                            Pencatatan Klinis SOAP
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="subjective"
                                className="flex items-center gap-2 font-semibold"
                            >
                                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                                    S
                                </span>
                                Subjective (Anamnesis / Keluhan Pasien)
                            </Label>
                            <Textarea
                                id="subjective"
                                rows={3}
                                placeholder="Keluhan utama, riwayat penyakit sekarang, riwayat penyakit dahulu..."
                                disabled={isFinal}
                                value={data.subjective}
                                onChange={(e) =>
                                    setData('subjective', e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="objective"
                                className="flex items-center gap-2 font-semibold"
                            >
                                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                                    O
                                </span>
                                Objective (Pemeriksaan Fisik & Penunjang)
                            </Label>
                            <Textarea
                                id="objective"
                                rows={3}
                                placeholder="Keadaan umum, kesadaran, pemeriksaan per organ/sistem tubuh..."
                                disabled={isFinal}
                                value={data.objective}
                                onChange={(e) =>
                                    setData('objective', e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="assessment"
                                className="flex items-center gap-2 font-semibold"
                            >
                                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                                    A
                                </span>
                                Assessment (Diagnosis Kerja & Kesimpulan Klinis)
                            </Label>
                            <Textarea
                                id="assessment"
                                rows={2}
                                placeholder="Diagnosis kerja, diagnosis banding, masalah klinis aktif..."
                                disabled={isFinal}
                                value={data.assessment}
                                onChange={(e) =>
                                    setData('assessment', e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="plan"
                                className="flex items-center gap-2 font-semibold"
                            >
                                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                                    P
                                </span>
                                Plan (Rencana Terapi, Instruksi, & Edukasi)
                            </Label>
                            <Textarea
                                id="plan"
                                rows={3}
                                placeholder="Resep obat, rencana tindakan, konsultasi penunjang, instruksi rawat, edukasi pasien..."
                                disabled={isFinal}
                                value={data.plan}
                                onChange={(e) =>
                                    setData('plan', e.target.value)
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tombol Aksi */}
                {!isFinal && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-1.5 size-4" />
                            {processing
                                ? 'Menyimpan...'
                                : 'Simpan Draf Asesmen'}
                        </Button>

                        {existingAssessment && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleFinalize}
                                disabled={finalizing || processing}
                            >
                                <Lock className="mr-1.5 size-4" />
                                {finalizing
                                    ? 'Memfinalisasi...'
                                    : 'Finalisasi Rekam Medis'}
                            </Button>
                        )}
                    </div>
                )}
            </form>

            {/* Riwayat Addenda jika ada */}
            {existingAssessment?.addenda &&
                existingAssessment.addenda.length > 0 && (
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                                <Clock className="size-4 text-primary" />
                                Catatan Addendum (
                                {existingAssessment.addenda.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {existingAssessment.addenda.map((addendum) => (
                                <div
                                    key={addendum.id}
                                    className="space-y-1.5 rounded-lg border border-border bg-background p-3.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">
                                            Alasan: {addendum.reason}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(
                                                addendum.created_at,
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap text-foreground">
                                        {addendum.content}
                                    </p>
                                    {addendum.created_by_user && (
                                        <div className="text-xs text-muted-foreground">
                                            Oleh:{' '}
                                            {addendum.created_by_user.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
        </div>
    );
}
