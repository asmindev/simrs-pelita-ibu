import { useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import { Can } from '@/shared/components/can';
import { FormField } from '@/shared/components/form-field';
import { PatientPicker } from '@/shared/components/patient-picker';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/textarea';

import type { Patient, PatientSearchResult } from '../types/patient';

type Props = {
    sourcePatient: Patient | PatientSearchResult;
    initialTargetPatient?: PatientSearchResult | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PatientMergeDialog({
    sourcePatient,
    initialTargetPatient = null,
    open,
    onOpenChange,
}: Props) {
    const [target, setTarget] = useState<PatientSearchResult | null>(
        initialTargetPatient,
    );

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            target_patient_id: initialTargetPatient?.id ?? 0,
            reason: '',
        });

    useEffect(() => {
        if (open) {
            setTarget(initialTargetPatient);
            setData({
                target_patient_id: initialTargetPatient?.id ?? 0,
                reason: '',
            });
            clearErrors();
        } else {
            reset();
        }
    }, [open, initialTargetPatient]);

    function handleTargetChange(patient: PatientSearchResult | null) {
        setTarget(patient);
        setData('target_patient_id', patient?.id ?? 0);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        post(route('master-data.patients.merge', sourcePatient.id), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="size-5 text-primary" />
                            Penggabungan Berkas Rekam Medis
                        </DialogTitle>
                        <DialogDescription>
                            Gabungkan berkas rekam medis yang terindikasi ganda.
                            Berkas sumber akan dinonaktifkan secara permanen dan
                            ditandai sebagai gabungan ke berkas tujuan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <span>
                            Tindakan ini tidak dapat dibatalkan secara otomatis.
                            Pastikan data pasien dan nomor rekam medis tujuan
                            sudah sesuai.
                        </span>
                    </div>

                    <div className="space-y-3">
                        {/* Berkas Sumber */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Berkas Sumber (Akan Ditutup)
                            </label>
                            <Card className="border-border bg-muted/40 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                                                {
                                                    sourcePatient.medical_record_number
                                                }
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {sourcePatient.name}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="border-destructive text-[10px] text-destructive"
                                            >
                                                Sumber
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                                            <span>
                                                NIK: {sourcePatient.nik ?? '-'}
                                            </span>
                                            <span>
                                                {sourcePatient.gender === 'male'
                                                    ? 'Laki-laki'
                                                    : 'Perempuan'}
                                            </span>
                                            <span>
                                                Lahir:{' '}
                                                {sourcePatient.birth_date.slice(
                                                    0,
                                                    10,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground" />
                                </div>
                            </Card>
                        </div>

                        {/* Berkas Tujuan */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Berkas Tujuan (Tetap Aktif)
                            </label>
                            <PatientPicker
                                value={target}
                                onChange={handleTargetChange}
                                excludeId={sourcePatient.id}
                                error={errors.target_patient_id}
                                placeholder="Cari berkas RM atau nama pasien tujuan..."
                            />
                        </div>

                        {/* Alasan Penggabungan */}
                        <FormField
                            label="Alasan Penggabungan"
                            htmlFor="merge_reason"
                            error={errors.reason}
                            hint="Minimal penjelasan dasar penggabungan berkas untuk keperluan audit."
                        >
                            <Textarea
                                id="merge_reason"
                                rows={3}
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                placeholder="Contoh: Terjadi pendaftaran ganda saat pasien masuk IGD tanpa membawa kartu identitas."
                            />
                        </FormField>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Can permission="master-data.patient.merge">
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={
                                    processing ||
                                    !data.target_patient_id ||
                                    !data.reason.trim()
                                }
                            >
                                {processing
                                    ? 'Memproses...'
                                    : 'Gabungkan Berkas'}
                            </Button>
                        </Can>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
