import { useForm } from '@inertiajs/react';
import { LogOut, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/shared/ui/textarea';

import type { Admission } from '../../types/inpatient';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admission: Admission;
};

export function DischargeDialog({ open, onOpenChange, admission }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        discharge_diagnosis: '',
        discharge_summary: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('inpatient.admissions.discharge', admission.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LogOut className="size-5 text-destructive" />
                        Pulangkan Pasien Rawat Inap
                    </DialogTitle>
                    <DialogDescription>
                        Proses pemulangan pasien akan otomatis melepaskan tempat
                        tidur (bed) menjadi kosong (tersedia kembali).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="discharge_diagnosis"
                            className="text-xs font-medium"
                        >
                            Diagnosa Akhir / Pulang{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="discharge_diagnosis"
                            value={data.discharge_diagnosis}
                            onChange={(e) =>
                                setData('discharge_diagnosis', e.target.value)
                            }
                            placeholder="Contoh: Demam Berdarah Dengue derajat II membaik..."
                            className="min-h-20 text-xs"
                            required
                        />
                        {errors.discharge_diagnosis && (
                            <p className="text-xs text-destructive">
                                {errors.discharge_diagnosis}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="discharge_summary"
                            className="text-xs font-medium"
                        >
                            Ringkasan Pulang (Discharge Summary)
                        </Label>
                        <Textarea
                            id="discharge_summary"
                            value={data.discharge_summary}
                            onChange={(e) =>
                                setData('discharge_summary', e.target.value)
                            }
                            placeholder="Kondisi keluar, edukasi obat pulang, tanggal kontrol ulang..."
                            className="min-h-24 text-xs"
                        />
                        {errors.discharge_summary && (
                            <p className="text-xs text-destructive">
                                {errors.discharge_summary}
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
                            variant="destructive"
                            size="sm"
                            disabled={processing}
                        >
                            {processing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            Konfirmasi Pulangkan Pasien
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
