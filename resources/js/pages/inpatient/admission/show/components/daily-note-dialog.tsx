import { useForm } from '@inertiajs/react';
import { FileText, Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
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

import type { Admission, DailyNoteType } from '../../../types/inpatient';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admission: Admission;
};

export function DailyNoteDialog({ open, onOpenChange, admission }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        note_type: DailyNoteType;
        vital_signs: {
            blood_pressure: string;
            heart_rate: string;
            respiratory_rate: string;
            temperature: string;
            oxygen_saturation: string;
        };
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    }>({
        note_type: 'doctor_visit',
        vital_signs: {
            blood_pressure: '',
            heart_rate: '',
            respiratory_rate: '',
            temperature: '',
            oxygen_saturation: '',
        },
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('inpatient.admissions.daily-notes.store', admission.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="size-5 text-primary" />
                        Tambah Catatan Harian Pasien (CPPT / SOAP)
                    </DialogTitle>
                    <DialogDescription>
                        Dokumentasikan tanda-tanda vital dan catatan integrasi
                        perkembangan harian pasien rawat inap.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="note_type"
                            className="text-xs font-medium"
                        >
                            Jenis Catatan CPPT{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.note_type}
                            onValueChange={(val) =>
                                setData('note_type', val as DailyNoteType)
                            }
                        >
                            <SelectTrigger
                                id="note_type"
                                className="h-8 text-xs"
                            >
                                <SelectValue placeholder="Pilih Jenis Catatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="doctor_visit">
                                    Visite Dokter (Dokter Penanggung Jawab)
                                </SelectItem>
                                <SelectItem value="nurse">
                                    Catatan Perawat / Bidan (Observasi Ruangan)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.note_type && (
                            <p className="text-xs text-destructive">
                                {errors.note_type}
                            </p>
                        )}
                    </div>

                    {/* Vital Signs Grid */}
                    <div className="space-y-1.5 rounded-lg border border-border bg-card/50 p-3">
                        <span className="mb-2 block text-xs font-semibold text-foreground">
                            Tanda-Tanda Vital (TTV)
                        </span>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="blood_pressure"
                                    className="text-xs text-muted-foreground"
                                >
                                    Tekanan Darah (mmHg)
                                </Label>
                                <Input
                                    id="blood_pressure"
                                    value={data.vital_signs.blood_pressure}
                                    onChange={(e) =>
                                        setData('vital_signs', {
                                            ...data.vital_signs,
                                            blood_pressure: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 120/80"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="heart_rate"
                                    className="text-xs text-muted-foreground"
                                >
                                    Nadi (x/menit)
                                </Label>
                                <Input
                                    id="heart_rate"
                                    value={data.vital_signs.heart_rate}
                                    onChange={(e) =>
                                        setData('vital_signs', {
                                            ...data.vital_signs,
                                            heart_rate: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 82"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="respiratory_rate"
                                    className="text-xs text-muted-foreground"
                                >
                                    Pernapasan (x/menit)
                                </Label>
                                <Input
                                    id="respiratory_rate"
                                    value={data.vital_signs.respiratory_rate}
                                    onChange={(e) =>
                                        setData('vital_signs', {
                                            ...data.vital_signs,
                                            respiratory_rate: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 20"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="temperature"
                                    className="text-xs text-muted-foreground"
                                >
                                    Suhu Tubuh (°C)
                                </Label>
                                <Input
                                    id="temperature"
                                    value={data.vital_signs.temperature}
                                    onChange={(e) =>
                                        setData('vital_signs', {
                                            ...data.vital_signs,
                                            temperature: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 36.8"
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="oxygen_saturation"
                                    className="text-xs text-muted-foreground"
                                >
                                    SpO2 (%)
                                </Label>
                                <Input
                                    id="oxygen_saturation"
                                    value={data.vital_signs.oxygen_saturation}
                                    onChange={(e) =>
                                        setData('vital_signs', {
                                            ...data.vital_signs,
                                            oxygen_saturation: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 98"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SOAP Fields */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label
                                htmlFor="subjective"
                                className="text-xs font-medium"
                            >
                                Subjektif (S - Keluhan Pasien)
                            </Label>
                            <Textarea
                                id="subjective"
                                value={data.subjective}
                                onChange={(e) =>
                                    setData('subjective', e.target.value)
                                }
                                placeholder="Keluhan utama saat pemeriksaan..."
                                className="min-h-16 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="objective"
                                className="text-xs font-medium"
                            >
                                Objektif (O - Pemeriksaan Fisik)
                            </Label>
                            <Textarea
                                id="objective"
                                value={data.objective}
                                onChange={(e) =>
                                    setData('objective', e.target.value)
                                }
                                placeholder="Hasil temuan pemeriksaan fisik / lab..."
                                className="min-h-16 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="assessment"
                                className="text-xs font-medium"
                            >
                                Assessment (A - Penilaian Klinis)
                            </Label>
                            <Textarea
                                id="assessment"
                                value={data.assessment}
                                onChange={(e) =>
                                    setData('assessment', e.target.value)
                                }
                                placeholder="Evaluasi kondisi klinis saat ini..."
                                className="min-h-16 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="plan"
                                className="text-xs font-medium"
                            >
                                Plan (P - Rencana Terapi & Tindakan)
                            </Label>
                            <Textarea
                                id="plan"
                                value={data.plan}
                                onChange={(e) =>
                                    setData('plan', e.target.value)
                                }
                                placeholder="Instruksi obat, cairan infus, rencana lanjut..."
                                className="min-h-16 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" size="sm" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            Simpan Catatan CPPT
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
