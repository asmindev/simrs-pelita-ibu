import { useForm } from '@inertiajs/react';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
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

import type { Admission, Bed } from '../../../types/inpatient';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admission: Admission;
    availableBeds: Bed[];
};

export function TransferBedDialog({
    open,
    onOpenChange,
    admission,
    availableBeds,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_bed_id: '',
        reason: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('inpatient.admissions.transfer', admission.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    const currentBed = admission.current_assignment?.bed;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="size-5 text-primary" />
                        Pindah Tempat Tidur (Transfer Bed)
                    </DialogTitle>
                    <DialogDescription>
                        Pindahkan pasien ke bed atau kelas ruangan lain yang
                        masih tersedia.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1 rounded-md bg-muted/50 p-3 text-xs">
                    <div className="text-muted-foreground">
                        Tempat Tidur Saat Ini:
                    </div>
                    <div className="font-semibold text-foreground">
                        {currentBed
                            ? `${currentBed.room_name} — Bed ${currentBed.bed_number} (${currentBed.class.toUpperCase()})`
                            : 'Belum dialokasikan'}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="target_bed_id"
                            className="text-xs font-medium"
                        >
                            Pilih Bed Tujuan (Tersedia){' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.target_bed_id}
                            onValueChange={(val) =>
                                setData('target_bed_id', val)
                            }
                        >
                            <SelectTrigger
                                id="target_bed_id"
                                className="h-8 text-xs"
                            >
                                <SelectValue placeholder="Pilih bed tujuan yang kosong..." />
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
                        {errors.target_bed_id && (
                            <p className="text-xs text-destructive">
                                {errors.target_bed_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reason" className="text-xs font-medium">
                            Alasan Pemindahan{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Contoh: Permintaan keluarga pasien, indikasi perburukan klinis ke ICU, renovasi ruangan..."
                            className="min-h-20 text-xs"
                            required
                        />
                        {errors.reason && (
                            <p className="text-xs text-destructive">
                                {errors.reason}
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
                            disabled={processing || availableBeds.length === 0}
                        >
                            {processing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            Simpan Pemindahan Bed
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
