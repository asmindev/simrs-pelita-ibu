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

import type { ProductInfo, StockLocation } from '../../types/pharmacy';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: ProductInfo[];
    locations: StockLocation[];
};

export function NewBatchDialog({
    open,
    onOpenChange,
    products,
    locations,
}: Props) {
    const internalLocations = locations.filter((l) => l.usage === 'internal');
    const defaultWarehouse =
        internalLocations.find((l) => l.is_default_warehouse) ??
        internalLocations[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        batch_number: '',
        expiry_date: '',
        initial_quantity: '',
        buy_price: '',
        stock_location_id: defaultWarehouse ? String(defaultWarehouse.id) : '',
        origin: '',
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
                    <DialogTitle>Penerimaan Batch Produk Baru</DialogTitle>
                    <DialogDescription>
                        Catat batch baru, lokasi simpan, kuantitas awal, serta
                        layer valuasi persediaan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                        <Label htmlFor="batch-product-select">
                            Pilih Produk{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.product_id}
                            onValueChange={(val) => setData('product_id', val)}
                        >
                            <SelectTrigger
                                id="batch-product-select"
                                className="bg-background"
                            >
                                <SelectValue placeholder="Pilih produk dari master..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {products.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name}
                                        {d.form ? ` (${d.form})` : ''} — Satuan:{' '}
                                        {d.unit_of_measure}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.product_id && (
                            <p className="text-xs text-destructive">
                                {errors.product_id}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                                placeholder="BATCH-2026-001"
                                className="bg-background uppercase"
                                required
                            />
                            {errors.batch_number && (
                                <p className="text-xs text-destructive">
                                    {errors.batch_number}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="batch-origin">
                                No. Faktur / PO
                            </Label>
                            <Input
                                id="batch-origin"
                                value={data.origin}
                                onChange={(e) =>
                                    setData('origin', e.target.value)
                                }
                                placeholder="PO-2026-001"
                                className="bg-background"
                            />
                        </div>
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

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="batch-buy-price">
                                Harga Beli / Unit
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

                        <div className="space-y-1.5">
                            <Label htmlFor="batch-location">
                                Lokasi Tujuan
                            </Label>
                            <Select
                                value={data.stock_location_id}
                                onValueChange={(val) =>
                                    setData('stock_location_id', val)
                                }
                            >
                                <SelectTrigger
                                    id="batch-location"
                                    className="bg-background"
                                >
                                    <SelectValue placeholder="Gudang Utama" />
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
