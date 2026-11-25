import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect } from 'react';

import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
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

import type {
    StockLocationUsage,
    UsageOption,
    WarehouseLocation,
} from '../types/warehouse';

type Props = {
    warehouse: WarehouseLocation | null;
    usageOptions: UsageOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function WarehouseFormDialog({
    warehouse,
    usageOptions,
    open,
    onOpenChange,
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            code: '',
            name: '',
            usage: 'internal' as StockLocationUsage,
            description: '',
            is_default_warehouse: false,
            is_active: true,
        });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();

        if (warehouse) {
            setData({
                code: warehouse.code,
                name: warehouse.name,
                usage: warehouse.usage,
                description: warehouse.description ?? '',
                is_default_warehouse: warehouse.is_default_warehouse,
                is_active: warehouse.is_active,
            });
        } else {
            reset();
        }
    }, [open, warehouse, clearErrors, reset, setData]);

    function handleUsageChange(nextUsage: StockLocationUsage) {
        setData((prev) => ({
            ...prev,
            usage: nextUsage,
            is_default_warehouse:
                nextUsage === 'internal' ? prev.is_default_warehouse : false,
        }));
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (warehouse) {
            put(route('inventory.warehouses.update', warehouse.id), options);
        } else {
            post(route('inventory.warehouses.store'), options);
        }
    }

    const isInternal = data.usage === 'internal';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {warehouse
                            ? `Edit Gudang / Lokasi: ${warehouse.code}`
                            : 'Tambah Gudang / Lokasi Stok'}
                    </DialogTitle>
                    <DialogDescription>
                        Atur kode lokasi (contoh: WH/STOCK, OK/STOCK), tipe
                        penggunaan, dan status default gudang utama.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                            label="Kode Lokasi"
                            htmlFor="warehouse-code"
                            error={errors.code}
                            hint="Contoh: WH/STOCK, OK/STOCK"
                        >
                            <Input
                                id="warehouse-code"
                                value={data.code}
                                onChange={(e) =>
                                    setData(
                                        'code',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="WH/OK"
                                className="bg-background font-mono uppercase"
                                required
                            />
                        </FormField>

                        <div className="space-y-1.5">
                            <Label htmlFor="warehouse-usage">
                                Tipe Penggunaan{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.usage}
                                onValueChange={(val) =>
                                    handleUsageChange(val as StockLocationUsage)
                                }
                            >
                                <SelectTrigger
                                    id="warehouse-usage"
                                    className="bg-background"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {usageOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.usage && (
                                <p className="text-xs text-destructive">
                                    {errors.usage}
                                </p>
                            )}
                        </div>
                    </div>

                    <FormField
                        label="Nama Gudang / Lokasi"
                        htmlFor="warehouse-name"
                        error={errors.name}
                    >
                        <Input
                            id="warehouse-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="cth: Depo Farmasi Kamar Operasi"
                            className="bg-background"
                            required
                        />
                    </FormField>

                    <FormField
                        label="Keterangan (Opsional)"
                        htmlFor="warehouse-description"
                        error={errors.description}
                    >
                        <Textarea
                            id="warehouse-description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Fungsi penyimpanan atau ruang layanan..."
                            rows={2}
                            className="resize-none bg-background text-xs"
                        />
                    </FormField>

                    <div className="space-y-2 rounded-lg border border-border/70 bg-muted/30 p-3">
                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="warehouse-default"
                                checked={data.is_default_warehouse}
                                disabled={!isInternal}
                                onCheckedChange={(checked) =>
                                    setData(
                                        'is_default_warehouse',
                                        Boolean(checked),
                                    )
                                }
                            />
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="warehouse-default"
                                    className="text-xs font-medium"
                                >
                                    Jadikan Gudang Utama (Default Warehouse)
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Digunakan sebagai lokasi asal/tujuan standar
                                    penerimaan dan FEFO. Hanya berlaku untuk
                                    lokasi internal.
                                </p>
                                {errors.is_default_warehouse && (
                                    <p className="text-xs text-destructive">
                                        {errors.is_default_warehouse}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                                id="warehouse-active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="warehouse-active"
                                className="text-xs font-normal"
                            >
                                Lokasi aktif dan dapat digunakan dalam transaksi
                                stok
                            </Label>
                        </div>
                        {errors.is_active && (
                            <p className="text-xs text-destructive">
                                {errors.is_active}
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
                            {processing
                                ? 'Menyimpan...'
                                : warehouse
                                  ? 'Simpan Perubahan'
                                  : 'Simpan Gudang'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
