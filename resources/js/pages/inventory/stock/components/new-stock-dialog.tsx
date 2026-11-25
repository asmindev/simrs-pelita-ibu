import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo } from 'react';

import { Combobox, type ComboboxOption } from '@/shared/components/combobox';
import { DatePicker } from '@/shared/components/date-picker';
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

import type { ProductInfo, StockLocation } from '../../types/inventory';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: ProductInfo[];
    locations: StockLocation[];
};

export function NewStockDialog({
    open,
    onOpenChange,
    products,
    locations,
}: Props) {
    const internalLocations = useMemo(
        () => locations.filter((l) => l.usage === 'internal'),
        [locations],
    );

    const defaultWarehouse =
        internalLocations.find((l) => l.is_default_warehouse) ??
        internalLocations[0];

    const productOptions: ComboboxOption[] = useMemo(
        () =>
            products.map((d) => ({
                value: String(d.id),
                label: d.form ? `${d.name} (${d.form})` : d.name,
                badge: d.code,
                description: `Satuan: ${d.unit_of_measure}`,
            })),
        [products],
    );

    const locationOptions: ComboboxOption[] = useMemo(
        () =>
            internalLocations.map((loc) => ({
                value: String(loc.id),
                label: loc.name,
                badge: loc.code,
                description: loc.is_default_warehouse
                    ? 'Gudang default'
                    : undefined,
            })),
        [internalLocations],
    );

    const currentYear = new Date().getFullYear();

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        expiry_date: '',
        initial_quantity: '',
        buy_price: '',
        stock_location_id: defaultWarehouse ? String(defaultWarehouse.id) : '',
        origin: '',
    });

    const selectedProduct = useMemo(
        () => products.find((p) => String(p.id) === data.product_id),
        [products, data.product_id],
    );

    function disablePastAndToday(date: Date): boolean {
        const now = new Date();
        const todayEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        return date <= todayEnd;
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('inventory.stock.batches.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tambah Stok Masuk</DialogTitle>
                    <DialogDescription>
                        Catat penerimaan stok baru ke gudang tujuan beserta
                        tanggal kedaluwarsa dan harga beli per unit.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="stock-product-select">
                            Pilih Produk{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Combobox
                            id="stock-product-select"
                            modal
                            options={productOptions}
                            value={data.product_id}
                            onValueChange={(val) => setData('product_id', val)}
                            placeholder="Pilih produk dari master..."
                            searchPlaceholder="Cari nama, bentuk, atau kode produk..."
                            emptyText="Produk tidak ditemukan."
                        />
                        {errors.product_id && (
                            <p className="text-xs text-destructive">
                                {errors.product_id}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="stock-location">
                                Gudang Tujuan
                            </Label>
                            <Combobox
                                id="stock-location"
                                modal
                                options={locationOptions}
                                value={data.stock_location_id}
                                onValueChange={(val) =>
                                    setData('stock_location_id', val)
                                }
                                placeholder="Pilih gudang tujuan..."
                                searchPlaceholder="Cari nama atau kode gudang..."
                                emptyText="Gudang tidak ditemukan."
                            />
                            {errors.stock_location_id && (
                                <p className="text-xs text-destructive">
                                    {errors.stock_location_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="stock-origin">
                                No. Faktur / PO
                            </Label>
                            <Input
                                id="stock-origin"
                                value={data.origin}
                                onChange={(e) =>
                                    setData('origin', e.target.value)
                                }
                                placeholder="PO-2026-001"
                                className="h-9 bg-background text-xs"
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
                            <Label htmlFor="stock-expiry">
                                Tanggal Kedaluwarsa{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <DatePicker
                                id="stock-expiry"
                                modal
                                value={data.expiry_date}
                                onValueChange={(val) =>
                                    setData('expiry_date', val)
                                }
                                placeholder="Pilih tanggal kedaluwarsa..."
                                fromYear={currentYear}
                                toYear={currentYear + 15}
                                disabledDate={disablePastAndToday}
                            />
                            {errors.expiry_date && (
                                <p className="text-xs text-destructive">
                                    {errors.expiry_date}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="stock-initial-qty">
                                Jumlah Masuk{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="stock-initial-qty"
                                    type="number"
                                    min={1}
                                    value={data.initial_quantity}
                                    onChange={(e) =>
                                        setData(
                                            'initial_quantity',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0"
                                    className="h-9 bg-background pr-16 text-xs tabular-nums"
                                    required
                                />
                                {selectedProduct && (
                                    <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[11px] text-muted-foreground">
                                        {selectedProduct.unit_of_measure}
                                    </span>
                                )}
                            </div>
                            {errors.initial_quantity && (
                                <p className="text-xs text-destructive">
                                    {errors.initial_quantity}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="stock-buy-price">
                            Harga Beli / Unit
                        </Label>
                        <Input
                            id="stock-buy-price"
                            type="number"
                            min={0}
                            value={data.buy_price}
                            onChange={(e) =>
                                setData('buy_price', e.target.value)
                            }
                            placeholder="0"
                            className="h-9 bg-background text-xs tabular-nums"
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
                            {processing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            {processing ? 'Menyimpan...' : 'Simpan Stok'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
