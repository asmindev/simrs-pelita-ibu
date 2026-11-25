import { useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowLeftRight,
    ArrowRight,
    ArrowUpRight,
    Loader2,
    Package,
    SlidersHorizontal,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo } from 'react';

import { route } from '@/shared/lib/route';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
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

type MoveOperationType = 'transfer' | 'in' | 'out' | 'adjustment';

export type StockMovePreset = {
    type?: MoveOperationType;
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

const OPERATION_OPTIONS: Array<{
    value: MoveOperationType;
    label: string;
    icon: typeof ArrowLeftRight;
}> = [
    { value: 'transfer', label: 'Transfer Gudang', icon: ArrowLeftRight },
    { value: 'in', label: 'Stok Masuk', icon: ArrowDownRight },
    { value: 'out', label: 'Stok Keluar', icon: ArrowUpRight },
    { value: 'adjustment', label: 'Opname', icon: SlidersHorizontal },
];

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

    const {
        data,
        setData,
        transform,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        type: 'transfer' as MoveOperationType,
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
        nextType: MoveOperationType,
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

        clearErrors();
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

    const selectedProduct = useMemo(
        () => products.find((p) => String(p.id) === data.product_id) ?? null,
        [products, data.product_id],
    );

    const stockByLocation = useMemo(() => {
        const totals = new Map<number, number>();
        if (!selectedProduct?.batches) return totals;

        const targetBatchId = data.product_batch_id
            ? Number(data.product_batch_id)
            : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const batch of selectedProduct.batches) {
            if (targetBatchId !== null && batch.id !== targetBatchId) continue;

            // Outbound & internal non-quarantine transfers only count non-expired stock unless batch was explicitly preset
            if (
                targetBatchId === null &&
                (data.type === 'out' || data.type === 'transfer')
            ) {
                const exp = new Date(batch.expiry_date);
                exp.setHours(0, 0, 0, 0);
                if (exp < today) continue;
            }

            for (const quant of batch.stock_quants ?? []) {
                totals.set(
                    quant.stock_location_id,
                    (totals.get(quant.stock_location_id) ?? 0) + quant.quantity,
                );
            }
        }

        return totals;
    }, [selectedProduct, data.product_batch_id, data.type]);

    const sourceOptions = useMemo(() => {
        if (data.type === 'in') return supplierLocations;
        if (data.type === 'adjustment') return lossLocations;
        return internalLocations;
    }, [data.type, supplierLocations, lossLocations, internalLocations]);

    const destinationOptions = useMemo(() => {
        if (data.type === 'out') return outboundLocations;
        if (data.type === 'transfer') {
            return internalLocations.filter(
                (l) => String(l.id) !== data.source_location_id,
            );
        }
        return internalLocations;
    }, [
        data.type,
        data.source_location_id,
        outboundLocations,
        internalLocations,
    ]);

    const sourceStockQty = data.source_location_id
        ? (stockByLocation.get(Number(data.source_location_id)) ?? 0)
        : 0;
    const destStockQty = data.destination_location_id
        ? (stockByLocation.get(Number(data.destination_location_id)) ?? 0)
        : 0;

    const unit = selectedProduct?.unit_of_measure ?? 'unit';
    const numericQty = Number(data.quantity || 0);
    const requiresSourceStock = data.type === 'transfer' || data.type === 'out';
    const exceedsSourceStock =
        requiresSourceStock &&
        selectedProduct !== null &&
        numericQty > sourceStockQty;

    function handleSourceChange(nextSourceId: string) {
        if (
            data.type === 'transfer' &&
            nextSourceId === data.destination_location_id
        ) {
            const fallbackDest =
                internalLocations.find((l) => String(l.id) !== nextSourceId)
                    ?.id ?? '';
            setData((prev) => ({
                ...prev,
                source_location_id: nextSourceId,
                destination_location_id: String(fallbackDest),
            }));
            return;
        }
        setData('source_location_id', nextSourceId);
    }

    function handleSwapLocations() {
        if (data.type !== 'transfer') return;
        setData((prev) => ({
            ...prev,
            source_location_id: prev.destination_location_id,
            destination_location_id: prev.source_location_id,
        }));
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (exceedsSourceStock) return;

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

    const isTransfer = data.type === 'transfer';
    const dialogTitle = isTransfer
        ? 'Transfer Stok Antar Gudang'
        : data.type === 'in'
          ? 'Catat Stok Masuk'
          : data.type === 'out'
            ? 'Catat Pengeluaran Stok'
            : 'Penyesuaian Stok (Opname)';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <ArrowLeftRight className="size-4" />
                        </div>
                        <span>{dialogTitle}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Mutasi tercatat otomatis beserta saldo tiap lokasi.
                        Pengeluaran &amp; transfer diprioritaskan dari stok
                        kedaluwarsa terdekat (FEFO).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Operation Segmented Control */}
                    <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-muted/40 p-1 sm:grid-cols-4">
                        {OPERATION_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const active = data.type === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => applyTypeDefaults(opt.value)}
                                    className={cn(
                                        'flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                                        active
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:bg-card hover:text-foreground',
                                    )}
                                >
                                    <Icon className="size-3.5 shrink-0" />
                                    <span className="truncate">
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Product Selector */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="move-product"
                                className="text-xs font-medium"
                            >
                                Produk{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            {selectedProduct && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1 font-mono text-[10px] font-normal"
                                >
                                    <Package className="size-3" />
                                    {selectedProduct.code}
                                </Badge>
                            )}
                        </div>
                        <Select
                            value={data.product_id}
                            onValueChange={(val) => setData('product_id', val)}
                        >
                            <SelectTrigger
                                id="move-product"
                                className="bg-background text-xs"
                            >
                                <SelectValue placeholder="Pilih produk dari katalog..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {products.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
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

                    {/* Location Route Card */}
                    <div className="rounded-lg border border-border bg-muted/25 p-3">
                        <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Label
                                        htmlFor="move-source"
                                        className="text-xs font-medium"
                                    >
                                        Dari Lokasi{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    {selectedProduct &&
                                        (data.type === 'transfer' ||
                                            data.type === 'out') && (
                                            <span className="font-mono text-[11px] font-semibold text-primary tabular-nums">
                                                Stok:{' '}
                                                {sourceStockQty.toLocaleString(
                                                    'id-ID',
                                                )}{' '}
                                                {unit}
                                            </span>
                                        )}
                                </div>
                                <Select
                                    value={data.source_location_id}
                                    onValueChange={handleSourceChange}
                                >
                                    <SelectTrigger
                                        id="move-source"
                                        className="bg-background text-xs"
                                    >
                                        <SelectValue placeholder="Pilih lokasi asal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sourceOptions.map((loc) => (
                                            <SelectItem
                                                key={loc.id}
                                                value={String(loc.id)}
                                            >
                                                {loc.name}
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

                            <div className="flex items-center justify-center sm:pt-6">
                                {isTransfer ? (
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="outline"
                                        onClick={handleSwapLocations}
                                        title="Tukar gudang asal dan tujuan"
                                        className="size-8 rounded-full bg-background"
                                    >
                                        <ArrowLeftRight className="size-3.5 text-primary" />
                                        <span className="sr-only">
                                            Tukar lokasi
                                        </span>
                                    </Button>
                                ) : (
                                    <div className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                                        <ArrowRight className="size-3.5" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Label
                                        htmlFor="move-destination"
                                        className="text-xs font-medium"
                                    >
                                        Ke Lokasi{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    {selectedProduct &&
                                        (data.type === 'transfer' ||
                                            data.type === 'in' ||
                                            data.type === 'adjustment') && (
                                            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                                Saat ini:{' '}
                                                {destStockQty.toLocaleString(
                                                    'id-ID',
                                                )}{' '}
                                                {unit}
                                            </span>
                                        )}
                                </div>
                                <Select
                                    value={data.destination_location_id}
                                    onValueChange={(val) =>
                                        setData('destination_location_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="move-destination"
                                        className="bg-background text-xs"
                                    >
                                        <SelectValue placeholder="Pilih lokasi tujuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinationOptions.map((loc) => (
                                            <SelectItem
                                                key={loc.id}
                                                value={String(loc.id)}
                                            >
                                                {loc.name}
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
                    </div>

                    {/* Quantity + Reference */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {data.type === 'adjustment' ? (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="move-new-qty"
                                    className="text-xs font-medium"
                                >
                                    Stok Fisik Baru ({unit}){' '}
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
                                    className="bg-background font-mono text-xs tabular-nums"
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
                                <div className="flex items-center justify-between gap-2">
                                    <Label
                                        htmlFor="move-qty"
                                        className="text-xs font-medium"
                                    >
                                        Jumlah ({unit}){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    {requiresSourceStock &&
                                        selectedProduct &&
                                        sourceStockQty > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'quantity',
                                                        String(sourceStockQty),
                                                    )
                                                }
                                                className="text-[11px] font-medium text-primary hover:underline"
                                            >
                                                Isi Maks (
                                                {sourceStockQty.toLocaleString(
                                                    'id-ID',
                                                )}
                                                )
                                            </button>
                                        )}
                                </div>
                                <Input
                                    id="move-qty"
                                    type="number"
                                    min={1}
                                    max={
                                        requiresSourceStock &&
                                        sourceStockQty > 0
                                            ? sourceStockQty
                                            : undefined
                                    }
                                    value={data.quantity}
                                    onChange={(e) =>
                                        setData('quantity', e.target.value)
                                    }
                                    placeholder="0"
                                    className="bg-background font-mono text-xs tabular-nums"
                                    required
                                />
                                {exceedsSourceStock && (
                                    <p className="text-xs text-destructive">
                                        Melebihi stok tersedia di lokasi asal
                                        (maks.{' '}
                                        {sourceStockQty.toLocaleString('id-ID')}{' '}
                                        {unit}).
                                    </p>
                                )}
                                {errors.quantity && (
                                    <p className="text-xs text-destructive">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>
                        )}

                        {data.type === 'in' ? (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="move-unit-cost"
                                    className="text-xs font-medium"
                                >
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
                                    placeholder="Ikuti harga terakhir"
                                    className="bg-background font-mono text-xs tabular-nums"
                                />
                                {errors.unit_cost && (
                                    <p className="text-xs text-destructive">
                                        {errors.unit_cost}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="move-origin"
                                    className="text-xs font-medium"
                                >
                                    No. Dokumen / Referensi (Opsional)
                                </Label>
                                <Input
                                    id="move-origin"
                                    value={data.origin}
                                    onChange={(e) =>
                                        setData('origin', e.target.value)
                                    }
                                    placeholder="cth: MEMO-IGD / PO-2026-014"
                                    className="bg-background text-xs"
                                />
                                {errors.origin && (
                                    <p className="text-xs text-destructive">
                                        {errors.origin}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {data.type === 'in' && (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="move-origin"
                                className="text-xs font-medium"
                            >
                                No. Dokumen / Faktur PO (Opsional)
                            </Label>
                            <Input
                                id="move-origin"
                                value={data.origin}
                                onChange={(e) =>
                                    setData('origin', e.target.value)
                                }
                                placeholder="cth: PO-2026-014"
                                className="bg-background text-xs"
                            />
                        </div>
                    )}

                    {/* Live Balance Preview for Transfer */}
                    {isTransfer &&
                        selectedProduct &&
                        numericQty > 0 &&
                        !exceedsSourceStock && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs">
                                <span className="text-muted-foreground">
                                    Perkiraan saldo setelah transfer:
                                </span>
                                <div className="flex items-center gap-3 font-mono tabular-nums">
                                    <span>
                                        Asal:{' '}
                                        <strong className="text-foreground">
                                            {(
                                                sourceStockQty - numericQty
                                            ).toLocaleString('id-ID')}
                                        </strong>
                                    </span>
                                    <span>&bull;</span>
                                    <span>
                                        Tujuan:{' '}
                                        <strong className="text-primary">
                                            {(
                                                destStockQty + numericQty
                                            ).toLocaleString('id-ID')}{' '}
                                            {unit}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        )}

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="move-reason"
                            className="text-xs font-medium"
                        >
                            Alasan / Keterangan{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="move-reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Contoh: Distribusi stok ke Depo Rawat Jalan, pemakaian unit IGD, atau stok masuk PO..."
                            className="min-h-16 resize-none bg-background text-xs"
                            rows={2}
                            required
                        />
                        {errors.reason && (
                            <p className="text-xs text-destructive">
                                {errors.reason}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-1 sm:gap-2">
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
                            disabled={processing || exceedsSourceStock}
                        >
                            {processing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            {processing
                                ? 'Memproses...'
                                : isTransfer
                                  ? 'Transfer Sekarang'
                                  : 'Simpan Pergerakan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
