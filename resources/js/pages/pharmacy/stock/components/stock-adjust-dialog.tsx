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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

import type { ProductBatch, StockLocation } from '../../types/pharmacy';

type Props = {
    batch: ProductBatch | null;
    locations: StockLocation[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function StockAdjustDialog({
    batch,
    locations,
    open,
    onOpenChange,
}: Props) {
    const internalLocations = locations.filter((l) => l.usage === 'internal');
    const defaultLocation =
        internalLocations.find((l) => l.is_default_warehouse) ??
        internalLocations[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        new_quantity: '',
        reason: '',
        stock_location_id: '',
    });

    useEffect(() => {
        if (batch) {
            const firstQuant = (batch.stock_quants ?? []).find(
                (q) => q.quantity > 0,
            );
            const targetLocId = firstQuant
                ? String(firstQuant.stock_location_id)
                : defaultLocation
                  ? String(defaultLocation.id)
                  : '';
            const locQty = firstQuant
                ? firstQuant.quantity
                : batch.current_quantity;

            setData({
                new_quantity: String(locQty),
                reason: '',
                stock_location_id: targetLocId,
            });
        }
    }, [batch]);

    function handleLocationChange(locId: string) {
        if (!batch) return;
        const quant = (batch.stock_quants ?? []).find(
            (q) => String(q.stock_location_id) === locId,
        );
        const qtyAtLoc = quant
            ? quant.quantity
            : (batch.stock_quants ?? []).length === 0
              ? batch.current_quantity
              : 0;

        setData((prev) => ({
            ...prev,
            stock_location_id: locId,
            new_quantity: String(qtyAtLoc),
        }));
    }

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

    const selectedQuant = (batch.stock_quants ?? []).find(
        (q) => String(q.stock_location_id) === data.stock_location_id,
    );
    const currentQty = selectedQuant
        ? selectedQuant.quantity
        : (batch.stock_quants ?? []).length === 0
          ? batch.current_quantity
          : 0;
    const diff = Number(data.new_quantity || 0) - currentQty;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Penyesuaian Stok (Stock Opname)</DialogTitle>
                    <DialogDescription>
                        Koreksi stok fisik batch pada lokasi tertentu dengan
                        jejak audit &amp; valuation layer.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1 rounded-md border border-border bg-muted/40 p-3 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Produk:</span>
                        <span className="font-semibold">
                            {batch.product?.name}
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
                            Stok Lokasi Saat Ini:
                        </span>
                        <span className="font-bold text-foreground">
                            {currentQty} {batch.product?.unit_of_measure}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {internalLocations.length > 0 && (
                        <div className="space-y-1.5">
                            <Label htmlFor="adjust-location">
                                Lokasi Opname
                            </Label>
                            <Select
                                value={data.stock_location_id}
                                onValueChange={handleLocationChange}
                            >
                                <SelectTrigger
                                    id="adjust-location"
                                    className="bg-background"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {internalLocations.map((loc) => (
                                        <SelectItem
                                            key={loc.id}
                                            value={String(loc.id)}
                                        >
                                            {loc.code} — {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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
                                    {batch.product?.unit_of_measure}
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
