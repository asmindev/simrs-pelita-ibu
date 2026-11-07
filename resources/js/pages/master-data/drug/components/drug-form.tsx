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

import {
    commonDrugForms,
    commonDrugUnits,
    type Drug,
    type DrugCategory,
    type DrugInput,
} from '../types/drug';
import { DrugCategoryDialog } from './drug-category-dialog';

type Props = {
    drug?: Drug;
    categories: DrugCategory[];
};

export function DrugForm({ drug, categories }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<DrugInput>(
        {
            code: drug?.code ?? '',
            name: drug?.name ?? '',
            drug_category_id: drug?.drug_category_id ?? '',
            form: drug?.form ?? 'Tablet',
            strength: drug?.strength ?? '',
            unit_of_measure: drug?.unit_of_measure ?? 'Tablet',
            price: drug?.price ?? '',
            manufacturer: drug?.manufacturer ?? '',
            is_active: drug?.is_active ?? true,
        },
    );

    function submit(event: FormEvent) {
        event.preventDefault();

        if (drug) {
            put(route('master-data.drugs.update', drug.id));
        } else {
            post(route('master-data.drugs.store'));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Kode Obat / Barcode"
                    htmlFor="code"
                    error={errors.code}
                    hint="Kode unik identifikasi obat"
                >
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(event) =>
                            setData('code', event.target.value.toUpperCase())
                        }
                        placeholder="cth: PCT-500"
                        autoFocus
                    />
                </FormField>

                <FormField label="Nama Obat" htmlFor="name" error={errors.name}>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        placeholder="cth: Paracetamol 500mg"
                    />
                </FormField>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="category">Kategori Obat</Label>
                    <DrugCategoryDialog categories={categories} />
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
                        <SelectValue placeholder="Pilih Kategori Obat" />
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

            <div className="grid gap-4 sm:grid-cols-3">
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
                        placeholder="cth: Tablet, Sirup"
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
                    hint="cth: 500 mg, 125 mg/5ml"
                >
                    <Input
                        id="strength"
                        value={data.strength}
                        onChange={(event) =>
                            setData('strength', event.target.value)
                        }
                        placeholder="500 mg"
                    />
                </FormField>

                <FormField
                    label="Satuan Resep"
                    htmlFor="unit_of_measure"
                    error={errors.unit_of_measure}
                >
                    <Input
                        id="unit_of_measure"
                        list="drug-units"
                        value={data.unit_of_measure}
                        onChange={(event) =>
                            setData('unit_of_measure', event.target.value)
                        }
                        placeholder="cth: Tablet, Botol"
                    />
                    <datalist id="drug-units">
                        {commonDrugUnits.map((item) => (
                            <option key={item} value={item} />
                        ))}
                    </datalist>
                </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Harga Satuan Dasar (Rp)"
                    htmlFor="price"
                    error={errors.price}
                    hint="Harga jual dasar belum termasuk margin"
                >
                    <Input
                        id="price"
                        type="number"
                        min="0"
                        step="100"
                        value={data.price}
                        onChange={(event) =>
                            setData(
                                'price',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="0"
                        className="tabular-nums"
                    />
                </FormField>

                <FormField
                    label="Pabrik / Produsen"
                    htmlFor="manufacturer"
                    error={errors.manufacturer}
                >
                    <Input
                        id="manufacturer"
                        value={data.manufacturer}
                        onChange={(event) =>
                            setData('manufacturer', event.target.value)
                        }
                        placeholder="cth: Kimia Farma, Kalbe"
                    />
                </FormField>
            </div>

            <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) =>
                        setData('is_active', Boolean(checked))
                    }
                />
                <Label
                    htmlFor="is_active"
                    className="cursor-pointer text-sm font-normal"
                >
                    Status aktif (dapat diresepkan dan digunakan dalam layanan)
                </Label>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Menyimpan...'
                        : drug
                          ? 'Simpan Perubahan'
                          : 'Tambah Obat'}
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('master-data.drugs.index')}>Batal</Link>
                </Button>
            </div>
        </form>
    );
}
