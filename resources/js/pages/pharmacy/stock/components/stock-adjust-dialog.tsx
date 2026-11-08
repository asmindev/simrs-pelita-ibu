import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';

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
import { Textarea } from '@/shared/ui/textarea';

import type { DrugBatch } from '../../types/pharmacy';

type Props = {
    batch: DrugBatch | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function StockAdjustDialog({ batch, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        new_quantity: '',
        reason: '',
    });

    useEffect(() => {
        if (batch) {
            setData({
                new_quantity: String(batch.current_quantity),
                reason: '',
            });
        }
    }, [batch]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!batch) return;

        post(route('pharmacy.stock.batches.adjust', batch.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    if (!batch) return null;

    const currentQty = batch.current_quantity;
    const diff = Number(data.new_quantity || 0) - currentQty;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Penyesuaian Stok (Stock Opname)</DialogTitle>
                    <DialogDescription>
                        Koreksi stok fisik batch obat dengan alasan audit yang
                        jelas.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1 rounded-md border border-border bg-muted/40 p-3 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Obat:</span>
                        <span className="font-semibold">
                            {batch.drug?.name}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Nomor Batch:
                        </span>
                        <span className="font-mono font-medium">
                            {batch.batch_number}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Stok Sistem Saat Ini:
                        </span>
                        <span className="font-bold text-foreground">
                            {currentQty} {batch.drug?.unit_of_measure}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="adjust-new-quantity">
                            Stok Fisik Sebenarnya{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="adjust-new-quantity"
                            type="number"
                            min={0}
                            value={data.new_quantity}
                            onChange={(e) =>
                                setData('new_quantity', e.target.value)
                            }
                            placeholder="0"
                            className="bg-background"
                            required
                        />
                        {data.new_quantity !== '' && (
                            <p className="text-xs text-muted-foreground">
                                Selisih:{' '}
                                <span
                                    className={
                                        diff > 0
                                            ? 'font-medium text-primary'
                                            : diff < 0
                                              ? 'font-medium text-destructive'
                                              : ''
                                    }
                                >
                                    {diff > 0 ? `+${diff}` : diff}{' '}
                                    {batch.drug?.unit_of_measure}
                                </span>
                            </p>
                        )}
                        {errors.new_quantity && (
                            <p className="text-xs text-destructive">
                                {errors.new_quantity}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="adjust-reason">
                            Alasan Penyesuaian{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="adjust-reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Contoh: Selisih fisik stok opname akhir bulan, botol pecah, dll..."
                            className="resize-none bg-background text-xs"
                            rows={3}
                            required
                        />
                        {errors.reason && (
                            <p className="text-xs text-destructive">
                                {errors.reason}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
