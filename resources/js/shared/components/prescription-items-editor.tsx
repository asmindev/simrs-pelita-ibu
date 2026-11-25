import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { Combobox, type ComboboxOption } from '@/shared/components/combobox';
import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

export type PrescribableDrug = {
    id: number;
    code: string;
    name: string;
    form: string | null;
    strength: string | null;
    unit_of_measure: string;
    price: number;
    available_stock: number;
};

export type PrescriptionDraftItem = {
    product_id: string;
    dosage: string;
    frequency: string;
    route: string;
    duration_days: string;
    quantity: string;
    instructions: string;
};

export function createEmptyPrescriptionItem(): PrescriptionDraftItem {
    return {
        product_id: '',
        dosage: '',
        frequency: '',
        route: 'Oral',
        duration_days: '',
        quantity: '1',
        instructions: '',
    };
}

const ROUTE_OPTIONS = [
    'Oral',
    'IV',
    'IM',
    'SC',
    'Topikal',
    'Inhalasi',
    'Sublingual',
    'Tetes Mata',
    'Tetes Telinga',
    'Rektal',
] as const;

const FREQUENCY_PRESETS = [
    '3x1 sesudah makan',
    '2x1 sesudah makan',
    '1x1 sesudah makan',
    '3x1 sebelum makan',
    'Bila perlu',
] as const;

type Props = {
    drugs: PrescribableDrug[];
    items: PrescriptionDraftItem[];
    onChange: (items: PrescriptionDraftItem[]) => void;
    errors?: Record<string, string | undefined>;
    modal?: boolean;
};

export function PrescriptionItemsEditor({
    drugs,
    items,
    onChange,
    errors = {},
    modal = false,
}: Props) {
    const drugMap = useMemo(
        () => new Map(drugs.map((drug) => [String(drug.id), drug])),
        [drugs],
    );

    const drugOptions: ComboboxOption[] = useMemo(
        () =>
            drugs.map((drug) => {
                const nameParts = [drug.name, drug.strength]
                    .filter(Boolean)
                    .join(' ');
                const label = drug.form
                    ? `${nameParts} (${drug.form})`
                    : nameParts;

                return {
                    value: String(drug.id),
                    label,
                    badge: drug.code,
                    description: `Stok FEFO: ${drug.available_stock} ${drug.unit_of_measure} · ${formatCurrency(drug.price)}`,
                };
            }),
        [drugs],
    );

    function updateItem(index: number, patch: Partial<PrescriptionDraftItem>) {
        const next = items.map((item, idx) =>
            idx === index ? { ...item, ...patch } : item,
        );
        onChange(next);
    }

    function handleDrugChange(index: number, productId: string) {
        const drug = drugMap.get(productId);
        const current = items[index];
        const nextDosage =
            current.dosage.trim() === '' && drug
                ? (drug.strength ?? `1 ${drug.unit_of_measure}`)
                : current.dosage;

        updateItem(index, {
            product_id: productId,
            dosage: nextDosage,
        });
    }

    function addItem() {
        onChange([...items, createEmptyPrescriptionItem()]);
    }

    function removeItem(index: number) {
        if (items.length <= 1) return;
        onChange(items.filter((_, idx) => idx !== index));
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => {
                const selectedDrug = item.product_id
                    ? drugMap.get(item.product_id)
                    : undefined;
                const requestedQty = Number(item.quantity || 0);
                const isOverStock =
                    Boolean(selectedDrug) &&
                    requestedQty > (selectedDrug?.available_stock ?? 0);

                const productErr = errors[`items.${index}.product_id`];
                const dosageErr = errors[`items.${index}.dosage`];
                const frequencyErr = errors[`items.${index}.frequency`];
                const quantityErr = errors[`items.${index}.quantity`];

                return (
                    <div
                        key={index}
                        className="space-y-3 rounded-lg border border-border bg-muted/20 p-3"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-[10px]"
                                >
                                    Obat #{index + 1}
                                </Badge>
                                {selectedDrug && (
                                    <span className="text-[11px] text-muted-foreground tabular-nums">
                                        Stok tersedia:{' '}
                                        <span
                                            className={
                                                selectedDrug.available_stock > 0
                                                    ? 'font-medium text-foreground'
                                                    : 'font-medium text-destructive'
                                            }
                                        >
                                            {selectedDrug.available_stock}{' '}
                                            {selectedDrug.unit_of_measure}
                                        </span>
                                        {' · '}
                                        {formatCurrency(selectedDrug.price)}/
                                        {selectedDrug.unit_of_measure}
                                    </span>
                                )}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeItem(index)}
                                disabled={items.length <= 1}
                                title="Hapus baris obat"
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-12">
                            <div className="space-y-1.5 sm:col-span-6">
                                <Label htmlFor={`rx-product-${index}`}>
                                    Nama Obat{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    id={`rx-product-${index}`}
                                    modal={modal}
                                    options={drugOptions}
                                    value={item.product_id}
                                    onValueChange={(val) =>
                                        handleDrugChange(index, val)
                                    }
                                    placeholder="Pilih obat..."
                                    searchPlaceholder="Cari nama, kekuatan, atau kode obat..."
                                    emptyText="Obat tidak ditemukan di master produk."
                                />
                                {productErr && (
                                    <p className="text-xs text-destructive">
                                        {productErr}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-3">
                                <Label htmlFor={`rx-dosage-${index}`}>
                                    Dosis{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={`rx-dosage-${index}`}
                                    value={item.dosage}
                                    onChange={(e) =>
                                        updateItem(index, {
                                            dosage: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 500 mg / 1 tab"
                                    className="h-9 bg-background text-xs"
                                />
                                {dosageErr && (
                                    <p className="text-xs text-destructive">
                                        {dosageErr}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-3">
                                <Label htmlFor={`rx-qty-${index}`}>
                                    Jumlah{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={`rx-qty-${index}`}
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateItem(index, {
                                                quantity: e.target.value,
                                            })
                                        }
                                        className="h-9 bg-background pr-14 text-xs tabular-nums"
                                    />
                                    {selectedDrug && (
                                        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[11px] text-muted-foreground">
                                            {selectedDrug.unit_of_measure}
                                        </span>
                                    )}
                                </div>
                                {quantityErr && (
                                    <p className="text-xs text-destructive">
                                        {quantityErr}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-12">
                            <div className="space-y-1.5 sm:col-span-5">
                                <Label htmlFor={`rx-freq-${index}`}>
                                    Aturan Pakai / Frekuensi{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={`rx-freq-${index}`}
                                    value={item.frequency}
                                    onChange={(e) =>
                                        updateItem(index, {
                                            frequency: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 3x1 sesudah makan"
                                    className="h-9 bg-background text-xs"
                                />
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    {FREQUENCY_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() =>
                                                updateItem(index, {
                                                    frequency: preset,
                                                })
                                            }
                                            className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                {frequencyErr && (
                                    <p className="text-xs text-destructive">
                                        {frequencyErr}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-3">
                                <Label htmlFor={`rx-route-${index}`}>
                                    Rute Pemberian
                                </Label>
                                <Select
                                    value={item.route}
                                    onValueChange={(val) =>
                                        updateItem(index, { route: val })
                                    }
                                >
                                    <SelectTrigger
                                        id={`rx-route-${index}`}
                                        className="h-9 w-full bg-background text-xs"
                                    >
                                        <SelectValue placeholder="Pilih rute" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROUTE_OPTIONS.map((routeOpt) => (
                                            <SelectItem
                                                key={routeOpt}
                                                value={routeOpt}
                                            >
                                                {routeOpt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor={`rx-days-${index}`}>
                                    Durasi (Hari)
                                </Label>
                                <Input
                                    id={`rx-days-${index}`}
                                    type="number"
                                    min={1}
                                    value={item.duration_days}
                                    onChange={(e) =>
                                        updateItem(index, {
                                            duration_days: e.target.value,
                                        })
                                    }
                                    placeholder="5"
                                    className="h-9 bg-background text-xs tabular-nums"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor={`rx-inst-${index}`}>
                                    Instruksi
                                </Label>
                                <Input
                                    id={`rx-inst-${index}`}
                                    value={item.instructions}
                                    onChange={(e) =>
                                        updateItem(index, {
                                            instructions: e.target.value,
                                        })
                                    }
                                    placeholder="Habiskan..."
                                    className="h-9 bg-background text-xs"
                                />
                            </div>
                        </div>

                        {isOverStock && selectedDrug && (
                            <div className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-[11px] text-destructive">
                                <AlertTriangle className="size-3.5 shrink-0" />
                                <span>
                                    Jumlah diminta ({requestedQty}{' '}
                                    {selectedDrug.unit_of_measure}) melebihi
                                    stok FEFO tersedia (
                                    {selectedDrug.available_stock}{' '}
                                    {selectedDrug.unit_of_measure}).
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}

            {errors.items && (
                <p className="text-xs text-destructive">{errors.items}</p>
            )}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="h-8 gap-1.5 text-xs"
            >
                <Plus className="size-3.5" />
                Tambah Baris Obat
            </Button>
        </div>
    );
}
