import { useForm } from '@inertiajs/react';
import { Ban } from 'lucide-react';
import type { FormEvent } from 'react';

import { FormField } from '@/shared/components/form-field';
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
import { Textarea } from '@/shared/ui/textarea';

type Props = {
    encounterId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CancelVisitDialog({ encounterId, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        cancellation_reason: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('registration.visits.cancel', encounterId), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Ban className="size-5" />
                            Batalkan Kunjungan
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Masukkan alasan pembatalan kunjungan pasien.
                            Tindakan ini akan membatalkan antrean terkait dan
                            dicatat dalam audit trail.
                        </DialogDescription>
                    </DialogHeader>

                    <FormField
                        label="Alasan Pembatalan *"
                        htmlFor="cancellation_reason"
                        error={errors.cancellation_reason}
                    >
                        <Textarea
                            id="cancellation_reason"
                            rows={3}
                            value={data.cancellation_reason}
                            onChange={(e) =>
                                setData('cancellation_reason', e.target.value)
                            }
                            placeholder="Contoh: Pasien berhalangan hadir / salah poli / permintaan keluarga..."
                            className="bg-background text-xs"
                        />
                    </FormField>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={
                                processing || !data.cancellation_reason.trim()
                            }
                        >
                            {processing ? 'Membatalkan...' : 'Konfirmasi Batal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
