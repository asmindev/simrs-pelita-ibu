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
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import type { DrugInfo } from '../../types/pharmacy';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drugs: DrugInfo[];
};

export function NewBatchDialog({ open, onOpenChange, drugs }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        drug_id: '',
        batch_number: '',
        expiry_date: '',
        initial_quantity: '',
        buy_price: '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('pharmacy.stock.batches.store'), {
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
                    <DialogTitle>Penerimaan Batch Obat Baru</DialogTitle>
                    <DialogDescription>
                        Catat nomor batch, masa kedaluwarsa, kuantitas awal, dan
                        harga beli obat.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="batch-drug-select">
                            Pilih Obat{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.drug_id}
                            onValueChange={(val) => setData('drug_id', val)}
                        >
                            <SelectTrigger
                                id="batch-drug-select"
                                className="bg-background"
                            >
                                <SelectValue placeholder="Pilih obat dari master..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {drugs.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name} ({d.form}) — Satuan:{' '}
                                        {d.unit_of_measure}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.drug_id && (
                            <p className="text-xs text-destructive">
                                {errors.drug_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="batch-number">
                            Nomor Batch{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="batch-number"
                            value={data.batch_number}
                            onChange={(e) =>
                                setData(
                                    'batch_number',
                                    e.target.value.toUpperCase(),
                                )
                            }
                            placeholder="Contoh: BATCH-2026-001"
                            className="bg-background uppercase"
                            required
                        />
                        {errors.batch_number && (
                            <p className="text-xs text-destructive">
                                {errors.batch_number}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="batch-expiry">
                                Tanggal Kedaluwarsa{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="batch-expiry"
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) =>
                                    setData('expiry_date', e.target.value)
                                }
                                className="bg-background"
                                required
                            />
                            {errors.expiry_date && (
                                <p className="text-xs text-destructive">
                                    {errors.expiry_date}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="batch-initial-qty">
                                Jumlah Masuk{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="batch-initial-qty"
                                type="number"
                                min={1}
                                value={data.initial_quantity}
                                onChange={(e) =>
                                    setData('initial_quantity', e.target.value)
                                }
                                placeholder="0"
                                className="bg-background"
                                required
                            />
                            {errors.initial_quantity && (
                                <p className="text-xs text-destructive">
                                    {errors.initial_quantity}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="batch-buy-price">
                            Harga Beli Per Satuan (Opsional)
                        </Label>
                        <Input
                            id="batch-buy-price"
                            type="number"
                            min={0}
                            value={data.buy_price}
                            onChange={(e) =>
                                setData('buy_price', e.target.value)
                            }
                            placeholder="0"
                            className="bg-background"
                        />
                        {errors.buy_price && (
                            <p className="text-xs text-destructive">
                                {errors.buy_price}
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
                            {processing ? 'Menyimpan...' : 'Simpan Batch'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
