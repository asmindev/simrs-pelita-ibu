import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useMemo } from 'react';

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

import type { ProductInfo, StockLocation } from '../types/inventory';

export type StockMovePreset = {
    type?: 'in' | 'out' | 'transfer' | 'adjustment';
    productId?: number;
    batchId?: number;
    sourceLocationId?: number;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: ProductInfo[];
    locations: StockLocation[];
    preset?: StockMovePreset | null;
};

export function StockMoveDialog({
    open,
    onOpenChange,
    products,
    locations,
    preset,
}: Props) {
    const internalLocations = useMemo(
        () => locations.filter((l) => l.usage === 'internal'),
        [locations],
    );
    const supplierLocations = useMemo(
        () => locations.filter((l) => l.usage === 'supplier'),
        [locations],
    );
    const outboundLocations = useMemo(
        () =>
            locations.filter(
                (l) => l.usage === 'customer' || l.usage === 'inventory',
            ),
        [locations],
    );
    const lossLocations = useMemo(
        () => locations.filter((l) => l.usage === 'inventory'),
        [locations],
    );

    const defaultWarehouseId = String(
        internalLocations.find((l) => l.is_default_warehouse)?.id ??
            internalLocations[0]?.id ??
            '',
    );
    const secondaryInternalId = String(
        internalLocations.find((l) => !l.is_default_warehouse)?.id ??
            internalLocations[0]?.id ??
            '',
    );
    const defaultSupplierId = String(supplierLocations[0]?.id ?? '');
    const defaultCustomerId = String(
        outboundLocations.find((l) => l.usage === 'customer')?.id ??
            outboundLocations[0]?.id ??
            '',
    );
    const defaultLossId = String(lossLocations[0]?.id ?? '');

    const { data, setData, transform, post, processing, errors, reset } =
        useForm({
            type: 'transfer' as 'in' | 'out' | 'transfer' | 'adjustment',
            product_id: '',
            product_batch_id: '',
            source_location_id: defaultWarehouseId,
            destination_location_id: secondaryInternalId,
            quantity: '',
            new_quantity: '',
            unit_cost: '',
            origin: '',
            reason: '',
        });

    function applyTypeDefaults(
        nextType: 'in' | 'out' | 'transfer' | 'adjustment',
        customSourceId?: string,
    ) {
        if (nextType === 'in') {
            setData((prev) => ({
                ...prev,
                type: nextType,
                source_location_id: defaultSupplierId,
                destination_location_id: customSourceId ?? defaultWarehouseId,
            }));
            return;
        }

        if (nextType === 'out') {
            setData((prev) => ({
                ...prev,
                type: nextType,
                source_location_id: customSourceId ?? defaultWarehouseId,
                destination_location_id: defaultCustomerId,
            }));
            return;
        }

        if (nextType === 'transfer') {
            const src = customSourceId ?? defaultWarehouseId;
            const dst =
                internalLocations.find((l) => String(l.id) !== src)?.id ??
                secondaryInternalId;
            setData((prev) => ({
                ...prev,
                type: nextType,
                source_location_id: src,
                destination_location_id: String(dst),
            }));
            return;
        }

        setData((prev) => ({
            ...prev,
            type: nextType,
            source_location_id: defaultLossId,
            destination_location_id: customSourceId ?? defaultWarehouseId,
        }));
    }

    useEffect(() => {
        if (!open) return;

        const nextType = preset?.type ?? 'transfer';
        const srcId = preset?.sourceLocationId
            ? String(preset.sourceLocationId)
            : defaultWarehouseId;

        setData({
            type: nextType,
            product_id: preset?.productId ? String(preset.productId) : '',
            product_batch_id: preset?.batchId ? String(preset.batchId) : '',
            source_location_id:
                nextType === 'in'
                    ? defaultSupplierId
                    : nextType === 'adjustment'
                      ? defaultLossId
                      : srcId,
            destination_location_id:
                nextType === 'in' || nextType === 'adjustment'
                    ? srcId
                    : nextType === 'out'
                      ? defaultCustomerId
                      : String(
                            internalLocations.find(
                                (l) => String(l.id) !== srcId,
                            )?.id ?? secondaryInternalId,
                        ),
            quantity: '',
            new_quantity: '',
            unit_cost: '',
            origin: '',
            reason: '',
        });
    }, [open, preset]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        transform((formData) => ({
            ...formData,
            product_batch_id:
                formData.product_batch_id === ''
                    ? null
                    : Number(formData.product_batch_id),
            source_location_id: formData.source_location_id
                ? Number(formData.source_location_id)
                : null,
            destination_location_id: formData.destination_location_id
                ? Number(formData.destination_location_id)
                : null,
            quantity:
                formData.type === 'adjustment'
                    ? null
                    : Number(formData.quantity),
            new_quantity:
                formData.type === 'adjustment'
                    ? Number(formData.new_quantity)
                    : null,
            unit_cost:
                formData.unit_cost !== '' ? Number(formData.unit_cost) : null,
        }));

        post(route('inventory.stock.moves.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg sm:min-w-3xl">
                <DialogHeader>
                    <DialogTitle>Catat Pergerakan Stok</DialogTitle>
                    <DialogDescription>
                        Catat transaksi stok masuk, keluar, transfer antar
                        gudang, atau penyesuaian fisik. Alokasi stok berjalan
                        otomatis berdasarkan kedaluwarsa terdekat (FEFO).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="move-type">
                                Jenis Operasi{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.type}
                                onValueChange={(val) =>
                                    applyTypeDefaults(
                                        val as
                                            | 'in'
                                            | 'out'
                                            | 'transfer'
                                            | 'adjustment',
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="move-type"
                                    className="bg-background"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transfer">
                                        Transfer Antar Gudang
                                    </SelectItem>
                                    <SelectItem value="in">
                                        Penerimaan Stok (In)
                                    </SelectItem>
                                    <SelectItem value="out">
                                        Pengeluaran / Pemakaian (Out)
                                    </SelectItem>
                                    <SelectItem value="adjustment">
                                        Penyesuaian / Opname
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-xs text-destructive">
                                    {errors.type}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="move-origin">
                                Dokumen Asal / Referensi
                            </Label>
                            <Input
                                id="move-origin"
                                value={data.origin}
                                onChange={(e) =>
                                    setData('origin', e.target.value)
                                }
                                placeholder="Contoh: PO-2026-014 / MEMO-IGD"
                                className="bg-background"
                            />
                            {errors.origin && (
                                <p className="text-xs text-destructive">
                                    {errors.origin}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="move-source">
                                Dari Lokasi{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.source_location_id}
                                onValueChange={(val) =>
                                    setData('source_location_id', val)
                                }
                            >
                                <SelectTrigger
                                    id="move-source"
                                    className="bg-background"
                                >
                                    <SelectValue placeholder="Pilih lokasi asal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(data.type === 'in'
                                        ? supplierLocations
                                        : data.type === 'adjustment'
                                          ? lossLocations
                                          : internalLocations
                                    ).map((loc) => (
                                        <SelectItem
                                            key={loc.id}
                                            value={String(loc.id)}
                                        >
                                            {loc.name} ({loc.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.source_location_id && (
                                <p className="text-xs text-destructive">
                                    {errors.source_location_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="move-destination">
                                Ke Lokasi{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.destination_location_id}
                                onValueChange={(val) =>
                                    setData('destination_location_id', val)
                                }
                            >
                                <SelectTrigger
                                    id="move-destination"
                                    className="bg-background"
                                >
                                    <SelectValue placeholder="Pilih lokasi tujuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(data.type === 'out'
                                        ? outboundLocations
                                        : internalLocations
                                    ).map((loc) => (
                                        <SelectItem
                                            key={loc.id}
                                            value={String(loc.id)}
                                        >
                                            {loc.name} ({loc.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.destination_location_id && (
                                <p className="text-xs text-destructive">
                                    {errors.destination_location_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="move-product">
                                Produk{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.product_id}
                                onValueChange={(val) =>
                                    setData('product_id', val)
                                }
                            >
                                <SelectTrigger
                                    id="move-product"
                                    className="bg-background"
                                >
                                    <SelectValue placeholder="Pilih produk..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {products.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={String(d.id)}
                                        >
                                            {d.name} ({d.unit_of_measure})
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

                        {data.type === 'adjustment' ? (
                            <div className="space-y-1.5">
                                <Label htmlFor="move-new-qty">
                                    Stok Fisik Baru di Lokasi{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="move-new-qty"
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
                                {errors.new_quantity && (
                                    <p className="text-xs text-destructive">
                                        {errors.new_quantity}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label htmlFor="move-qty">
                                    Kuantitas{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="move-qty"
                                    type="number"
                                    min={1}
                                    value={data.quantity}
                                    onChange={(e) =>
                                        setData('quantity', e.target.value)
                                    }
                                    placeholder="0"
                                    className="bg-background"
                                    required
                                />
                                {errors.quantity && (
                                    <p className="text-xs text-destructive">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {data.type === 'in' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="move-unit-cost">
                                Harga Beli / Unit (Opsional)
                            </Label>
                            <Input
                                id="move-unit-cost"
                                type="number"
                                min={0}
                                value={data.unit_cost}
                                onChange={(e) =>
                                    setData('unit_cost', e.target.value)
                                }
                                placeholder="Kosongkan untuk mengikuti harga terakhir"
                                className="bg-background"
                            />
                            {errors.unit_cost && (
                                <p className="text-xs text-destructive">
                                    {errors.unit_cost}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="move-reason">
                            Alasan / Keterangan{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="move-reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Contoh: Distribusi stok harian ke Depo Rawat Jalan, penerimaan PO supplier, dll..."
                            className="resize-none bg-background text-xs"
                            rows={2}
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
                            {processing ? 'Memproses...' : 'Simpan Pergerakan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
