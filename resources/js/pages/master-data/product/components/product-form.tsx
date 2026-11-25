import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
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

import {
    commonDrugForms,
    commonProductUnits,
    type Product,
    type ProductCategory,
    type ProductInput,
    type ProductType,
    type ProductTypeOption,
} from '../types/product';
import { ProductCategoryDialog } from './product-category-dialog';

type Props = {
    product?: Product;
    categories: ProductCategory[];
    productTypes: ProductTypeOption[];
};

export function ProductForm({ product, categories, productTypes }: Props) {
    const { data, setData, post, put, processing, errors } =
        useForm<ProductInput>({
            code: product?.code ?? '',
            name: product?.name ?? '',
            product_type: product?.product_type ?? 'drug',
            drug_category_id: product?.drug_category_id ?? '',
            form: product?.form ?? 'Tablet',
            strength: product?.strength ?? '',
            unit_of_measure: product?.unit_of_measure ?? 'Pcs',
            price: product?.price ?? '',
            manufacturer: product?.manufacturer ?? '',
            description: product?.description ?? '',
            is_active: product?.is_active ?? true,
        });

    const isDrug = data.product_type === 'drug';

    function handleTypeChange(value: string) {
        const nextType = value as ProductType;
        setData((prev) => ({
            ...prev,
            product_type: nextType,
            form: nextType === 'drug' ? prev.form || 'Tablet' : '',
            strength: nextType === 'drug' ? prev.strength : '',
            unit_of_measure:
                nextType === 'drug' && prev.unit_of_measure === 'Pcs'
                    ? 'Tablet'
                    : nextType !== 'drug' && prev.unit_of_measure === 'Tablet'
                      ? 'Pcs'
                      : prev.unit_of_measure,
        }));
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (product) {
            put(route('master-data.products.update', product.id));
        } else {
            post(route('master-data.products.store'));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Kode Produk / SKU"
                    htmlFor="code"
                    error={errors.code}
                    hint="Kode unik identifikasi produk atau barcode"
                >
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(event) =>
                            setData('code', event.target.value.toUpperCase())
                        }
                        placeholder="cth: PCT-500 / ALK-001"
                        autoFocus
                    />
                </FormField>

                <FormField
                    label="Nama Produk"
                    htmlFor="name"
                    error={errors.name}
                >
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        placeholder="cth: Paracetamol 500mg / Spuit 3cc"
                    />
                </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="product_type">
                        Tipe Produk <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.product_type}
                        onValueChange={handleTypeChange}
                    >
                        <SelectTrigger id="product_type" className="w-full">
                            <SelectValue placeholder="Pilih Tipe Produk" />
                        </SelectTrigger>
                        <SelectContent>
                            {productTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.product_type && (
                        <p className="text-xs text-destructive">
                            {errors.product_type}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="category">Kategori Produk</Label>
                        <ProductCategoryDialog categories={categories} />
                    </div>
                    <Select
                        value={
                            data.drug_category_id
                                ? String(data.drug_category_id)
                                : ''
                        }
                        onValueChange={(value) =>
                            setData('drug_category_id', Number(value))
                        }
                    >
                        <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="Pilih Kategori Produk" />
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
                    {errors.drug_category_id && (
                        <p className="text-xs text-destructive">
                            {errors.drug_category_id}
                        </p>
                    )}
                </div>
            </div>

            {isDrug && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        label="Bentuk Sediaan"
                        htmlFor="form"
                        error={errors.form}
                    >
                        <Input
                            id="form"
                            list="drug-forms"
                            value={data.form}
                            onChange={(event) =>
                                setData('form', event.target.value)
                            }
                            placeholder="cth: Tablet, Sirup, Injeksi"
                        />
                        <datalist id="drug-forms">
                            {commonDrugForms.map((item) => (
                                <option key={item} value={item} />
                            ))}
                        </datalist>
                    </FormField>

                    <FormField
                        label="Kekuatan / Dosis"
                        htmlFor="strength"
                        error={errors.strength}
                    >
                        <Input
                            id="strength"
                            value={data.strength}
                            onChange={(event) =>
                                setData('strength', event.target.value)
                            }
                            placeholder="cth: 500 mg"
                        />
                    </FormField>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                    label="Satuan Ukur (UoM)"
                    htmlFor="unit_of_measure"
                    error={errors.unit_of_measure}
                >
                    <Input
                        id="unit_of_measure"
                        list="product-units"
                        value={data.unit_of_measure}
                        onChange={(event) =>
                            setData('unit_of_measure', event.target.value)
                        }
                        placeholder="cth: Pcs, Tablet, Box"
                    />
                    <datalist id="product-units">
                        {commonProductUnits.map((item) => (
                            <option key={item} value={item} />
                        ))}
                    </datalist>
                </FormField>

                <FormField
                    label="Harga Satuan Dasar (Rp)"
                    htmlFor="price"
                    error={errors.price}
                >
                    <Input
                        id="price"
                        type="number"
                        min={0}
                        value={data.price}
                        onChange={(event) =>
                            setData(
                                'price',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                    />
                </FormField>

                <FormField
                    label="Pabrik / Merk (Opsional)"
                    htmlFor="manufacturer"
                    error={errors.manufacturer}
                >
                    <Input
                        id="manufacturer"
                        value={data.manufacturer}
                        onChange={(event) =>
                            setData('manufacturer', event.target.value)
                        }
                        placeholder="cth: Kimia Farma / Terumo"
                    />
                </FormField>
            </div>

            <FormField
                label="Spesifikasi / Keterangan (Opsional)"
                htmlFor="description"
                error={errors.description}
            >
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(event) =>
                        setData('description', event.target.value)
                    }
                    placeholder="Catatan spesifikasi produk, ukuran, atau penyimpanan..."
                    rows={2}
                />
            </FormField>

            <div className="flex items-center gap-2 pt-1">
                <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) =>
                        setData('is_active', Boolean(checked))
                    }
                />
                <Label htmlFor="is_active">
                    Produk aktif dan tersedia dalam transaksi inventaris
                </Label>
            </div>

            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {product ? 'Simpan Perubahan' : 'Simpan Produk'}
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('master-data.products.index')}>
                        Batal
                    </Link>
                </Button>
            </div>
        </form>
    );
}
