import { useForm } from '@inertiajs/react';
import { Hospital, Loader2 } from 'lucide-react';
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
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

import type { AdmissionEncounter, Bed } from '../../types/inpatient';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableBeds: Bed[];
    activeEncounters: AdmissionEncounter[];
};

export function NewAdmissionDialog({
    open,
    onOpenChange,
    availableBeds,
    activeEncounters,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        encounter_id: '',
        bed_id: '',
        initial_diagnosis: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('inpatient.admissions.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Hospital className="size-5 text-primary" />
                        Admisi Pasien ke Rawat Inap
                    </DialogTitle>
                    <DialogDescription>
                        Pilih kunjungan aktif pasien dan tentukan tempat tidur
                        (bed) yang tersedia.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="encounter_id"
                            className="text-xs font-medium"
                        >
                            Pilih Kunjungan / Pasien{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.encounter_id}
                            onValueChange={(val) =>
                                setData('encounter_id', val)
                            }
                        >
                            <SelectTrigger
                                id="encounter_id"
                                className="h-8 text-xs"
                            >
                                <SelectValue placeholder="Pilih pasien yang akan dirawat inap..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {activeEncounters.length === 0 ? (
                                    <div className="p-2 text-center text-xs text-muted-foreground">
                                        Tidak ada kunjungan aktif yang tersedia.
                                    </div>
                                ) : (
                                    activeEncounters.map((enc) => (
                                        <SelectItem
                                            key={enc.id}
                                            value={String(enc.id)}
                                        >
                                            {enc.patient?.name} (RM:{' '}
                                            {enc.patient?.medical_record_number}
                                            ) — {enc.encounter_number}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.encounter_id && (
                            <p className="text-xs text-destructive">
                                {errors.encounter_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="bed_id" className="text-xs font-medium">
                            Pilih Tempat Tidur (Bed Tersedia){' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.bed_id}
                            onValueChange={(val) => setData('bed_id', val)}
                        >
                            <SelectTrigger id="bed_id" className="h-8 text-xs">
                                <SelectValue placeholder="Pilih bed ruangan yang masih kosong..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {availableBeds.length === 0 ? (
                                    <div className="p-2 text-center text-xs text-muted-foreground">
                                        Tidak ada tempat tidur yang tersedia.
                                    </div>
                                ) : (
                                    availableBeds.map((bed) => (
                                        <SelectItem
                                            key={bed.id}
                                            value={String(bed.id)}
                                        >
                                            {bed.room_name} — Bed{' '}
                                            {bed.bed_number} (
                                            {bed.class.toUpperCase()})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.bed_id && (
                            <p className="text-xs text-destructive">
                                {errors.bed_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="initial_diagnosis"
                            className="text-xs font-medium"
                        >
                            Diagnosa Masuk Awal (Initial Diagnosis)
                        </Label>
                        <Textarea
                            id="initial_diagnosis"
                            value={data.initial_diagnosis}
                            onChange={(e) =>
                                setData('initial_diagnosis', e.target.value)
                            }
                            placeholder="Tuliskan diagnosa kerja atau keluhan utama saat admisi..."
                            className="min-h-20 text-xs"
                        />
                        {errors.initial_diagnosis && (
                            <p className="text-xs text-destructive">
                                {errors.initial_diagnosis}
                            </p>
                        )}
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
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                processing ||
                                availableBeds.length === 0 ||
                                activeEncounters.length === 0
                            }
                        >
                            {processing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            Proses Admisi Pasien
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
