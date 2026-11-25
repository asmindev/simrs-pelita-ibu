import type { InertiaFormProps } from '@inertiajs/react';

import { formatCurrency } from '@/shared/lib/format';
import { Checkbox } from '@/shared/ui/checkbox';
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

import { ProductCategoryDialog } from '../../components/product-category-dialog';
import {
    commonDrugForms,
    commonProductUnits,
    PRODUCT_TYPE_LABELS,
    type Product,
    type ProductCategory,
    type ProductInput,
    type ProductTypeOption,
} from '../../types/product';

type Props = {
    product: Product;
    categories: ProductCategory[];
    productTypes: ProductTypeOption[];
    canManage: boolean;
    data: ProductInput;
    setData: InertiaFormProps<ProductInput>['setData'];
    errors: Partial<Record<keyof ProductInput, string>>;
    onTypeChange: (value: string) => void;
    statistics: {
        total_stock?: number;
        active_batches?: number;
        total_batches?: number;
        locations_count?: number;
        total_valuation?: number;
        average_cost?: number;
    };
};

function FieldRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="grid grid-cols-3 gap-2 border-b border-border/50 py-2 text-xs last:border-b-0">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd
                className={`col-span-2 text-foreground ${mono ? 'font-mono font-semibold tabular-nums' : 'font-medium'}`}
            >
                {value}
            </dd>
        </div>
    );
}

function EditableRow({
    label,
    htmlFor,
    error,
    action,
    children,
}: {
    label: string;
    htmlFor?: string;
    error?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 items-start gap-1.5 border-b border-border/50 py-2 last:border-b-0 sm:grid-cols-3 sm:gap-3">
            <div className="flex items-center justify-between gap-2 sm:pt-1.5">
                <Label
                    htmlFor={htmlFor}
                    className="text-xs font-medium text-muted-foreground"
                >
                    {label}
                </Label>
                {action}
            </div>
            <div className="sm:col-span-2">
                {children}
                {error && (
                    <p className="mt-1 text-[11px] text-destructive">{error}</p>
                )}
            </div>
        </div>
    );
}

export function ProductGeneralTab({
    product,
    categories,
    productTypes,
    canManage,
    data,
    setData,
    errors,
    onTypeChange,
    statistics,
}: Props) {
    const isDrug =
        (canManage ? data.product_type : product.product_type) === 'drug';
    const totalStock = statistics.total_stock ?? 0;
    const activeBatches = statistics.active_batches ?? 0;
    const totalBatches = statistics.total_batches ?? 0;
    const locationsCount = statistics.locations_count ?? 0;
    const totalValuation = statistics.total_valuation ?? 0;
    const averageCost = statistics.average_cost ?? 0;
    const activeUom = canManage
        ? data.unit_of_measure || product.unit_of_measure
        : product.unit_of_measure;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Informasi Produk
                </h3>

                {canManage ? (
                    <div className="rounded-lg border border-border/70 bg-muted/20 px-3.5 py-1">
                        <EditableRow
                            label="Tipe Produk"
                            htmlFor="inline-product-type"
                            error={errors.product_type}
                        >
                            <Select
                                value={data.product_type}
                                onValueChange={onTypeChange}
                            >
                                <SelectTrigger
                                    id="inline-product-type"
                                    className="h-8 bg-background text-xs"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {productTypes.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </EditableRow>

                        <EditableRow
                            label="Kode / SKU"
                            htmlFor="inline-code"
                            error={errors.code}
                        >
                            <Input
                                id="inline-code"
                                value={data.code}
                                onChange={(e) =>
                                    setData(
                                        'code',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                className="h-8 bg-background font-mono text-xs font-semibold uppercase"
                            />
                        </EditableRow>

                        <EditableRow
                            label="Kategori"
                            htmlFor="inline-category"
                            error={errors.product_category_id}
                            action={
                                <ProductCategoryDialog
                                    categories={categories}
                                />
                            }
                        >
                            <Select
                                value={
                                    data.product_category_id
                                        ? String(data.product_category_id)
                                        : ''
                                }
                                onValueChange={(val) =>
                                    setData('product_category_id', Number(val))
                                }
                            >
                                <SelectTrigger
                                    id="inline-category"
                                    className="h-8 bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </EditableRow>

                        <EditableRow
                            label="Satuan Ukur"
                            htmlFor="inline-uom"
                            error={errors.unit_of_measure}
                        >
                            <Input
                                id="inline-uom"
                                list="inline-product-units"
                                value={data.unit_of_measure}
                                onChange={(e) =>
                                    setData('unit_of_measure', e.target.value)
                                }
                                className="h-8 bg-background text-xs"
                            />
                            <datalist id="inline-product-units">
                                {commonProductUnits.map((item) => (
                                    <option key={item} value={item} />
                                ))}
                            </datalist>
                        </EditableRow>

                        {isDrug && (
                            <>
                                <EditableRow
                                    label="Bentuk Sediaan"
                                    htmlFor="inline-form"
                                    error={errors.form}
                                >
                                    <Input
                                        id="inline-form"
                                        list="inline-drug-forms"
                                        value={data.form}
                                        onChange={(e) =>
                                            setData('form', e.target.value)
                                        }
                                        placeholder="Tablet, Kapsul, Sirup..."
                                        className="h-8 bg-background text-xs"
                                    />
                                    <datalist id="inline-drug-forms">
                                        {commonDrugForms.map((item) => (
                                            <option key={item} value={item} />
                                        ))}
                                    </datalist>
                                </EditableRow>

                                <EditableRow
                                    label="Kekuatan / Dosis"
                                    htmlFor="inline-strength"
                                    error={errors.strength}
                                >
                                    <Input
                                        id="inline-strength"
                                        value={data.strength}
                                        onChange={(e) =>
                                            setData('strength', e.target.value)
                                        }
                                        placeholder="cth: 500 mg"
                                        className="h-8 bg-background text-xs"
                                    />
                                </EditableRow>
                            </>
                        )}

                        <EditableRow
                            label="Pabrik / Merk"
                            htmlFor="inline-manufacturer"
                            error={errors.manufacturer}
                        >
                            <Input
                                id="inline-manufacturer"
                                value={data.manufacturer}
                                onChange={(e) =>
                                    setData('manufacturer', e.target.value)
                                }
                                placeholder="Nama pabrikan atau merk..."
                                className="h-8 bg-background text-xs"
                            />
                        </EditableRow>

                        <EditableRow
                            label="Spesifikasi"
                            htmlFor="inline-description"
                            error={errors.description}
                        >
                            <Textarea
                                id="inline-description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Catatan spesifikasi atau penyimpanan..."
                                rows={2}
                                className="min-h-14 resize-none bg-background text-xs"
                            />
                        </EditableRow>

                        <EditableRow
                            label="Status Produk"
                            htmlFor="inline-is-active"
                        >
                            <div className="flex items-center gap-2 pt-1">
                                <Checkbox
                                    id="inline-is-active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', Boolean(checked))
                                    }
                                />
                                <Label
                                    htmlFor="inline-is-active"
                                    className="text-xs font-normal text-foreground"
                                >
                                    Produk aktif dalam transaksi inventaris
                                </Label>
                            </div>
                        </EditableRow>
                    </div>
                ) : (
                    <dl className="rounded-lg border border-border/70 bg-muted/20 px-3.5 py-1">
                        <FieldRow
                            label="Tipe Produk"
                            value={
                                PRODUCT_TYPE_LABELS[product.product_type] ??
                                product.product_type
                            }
                        />
                        <FieldRow
                            label="Kode / SKU"
                            value={product.code}
                            mono
                        />
                        <FieldRow
                            label="Kategori"
                            value={product.category?.name ?? '-'}
                        />
                        <FieldRow
                            label="Satuan Ukur"
                            value={product.unit_of_measure}
                        />
                        {isDrug && (
                            <>
                                <FieldRow
                                    label="Bentuk Sediaan"
                                    value={product.form || '-'}
                                />
                                <FieldRow
                                    label="Kekuatan / Dosis"
                                    value={product.strength || '-'}
                                />
                            </>
                        )}
                        <FieldRow
                            label="Pabrik / Merk"
                            value={product.manufacturer || '-'}
                        />
                        <FieldRow
                            label="Spesifikasi"
                            value={product.description || '-'}
                        />
                    </dl>
                )}
            </div>

            <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Harga &amp; Valuasi Persediaan
                </h3>
                <dl className="rounded-lg border border-border/70 bg-muted/20 px-3.5 py-1">
                    {canManage ? (
                        <EditableRow
                            label="Harga Jual Dasar"
                            htmlFor="inline-price"
                            error={errors.price}
                        >
                            <div className="relative">
                                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                                    Rp
                                </span>
                                <Input
                                    id="inline-price"
                                    type="number"
                                    min={0}
                                    value={data.price}
                                    onChange={(e) =>
                                        setData(
                                            'price',
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                    className="h-8 bg-background pl-8 font-mono text-xs font-semibold tabular-nums"
                                />
                            </div>
                        </EditableRow>
                    ) : (
                        <FieldRow
                            label="Harga Jual Dasar"
                            value={formatCurrency(product.price)}
                            mono
                        />
                    )}
                    <FieldRow
                        label="Biaya Rata-Rata"
                        value={`${formatCurrency(averageCost)} / ${activeUom}`}
                        mono
                    />
                    <FieldRow
                        label="Nilai Inventory (SVL)"
                        value={formatCurrency(totalValuation)}
                        mono
                    />
                    <FieldRow
                        label="Stok On-Hand"
                        value={`${totalStock.toLocaleString('id-ID')} ${activeUom}`}
                        mono
                    />
                    <FieldRow
                        label="Batch Aktif / Total"
                        value={`${activeBatches} / ${totalBatches} batch`}
                        mono
                    />
                    <FieldRow
                        label="Lokasi Penyimpanan"
                        value={`${locationsCount} lokasi internal`}
                        mono
                    />
                </dl>
            </div>
        </div>
    );
}
