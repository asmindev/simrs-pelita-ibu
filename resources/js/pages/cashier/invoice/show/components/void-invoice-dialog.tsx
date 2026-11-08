import { useForm } from '@inertiajs/react';
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

import type { Invoice } from '../../../types/cashier';

type Props = {
    invoice: Invoice;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function VoidInvoiceDialog({ invoice, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        void_reason: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('cashier.invoices.void', invoice.id), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Batalkan Tagihan (Void)</DialogTitle>
                    <DialogDescription>
                        Pembatalan tagihan akan mengunci invoice ini dan tidak
                        dapat digunakan lagi.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="void-reason">
                            Alasan Pembatalan{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="void-reason"
                            value={data.void_reason}
                            onChange={(e) =>
                                setData('void_reason', e.target.value)
                            }
                            placeholder="Jelaskan alasan pembatalan invoice..."
                            className="resize-none bg-background text-xs"
                            rows={3}
                            required
                        />
                        {errors.void_reason && (
                            <p className="text-xs text-destructive">
                                {errors.void_reason}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                        >
                            {processing ? 'Membatalkan...' : 'Konfirmasi Batal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
