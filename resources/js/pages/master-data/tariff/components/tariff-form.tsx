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
    tariffCategoryOptions,
    type Tariff,
    type TariffCategory,
    type TariffInput,
    type UnitOption,
} from '../types/tariff';

type Props = {
    tariff?: Tariff;
    units: UnitOption[];
};

export function TariffForm({ tariff, units }: Props) {
    const { data, setData, post, put, processing, errors } =
        useForm<TariffInput>({
            code: tariff?.code ?? '',
            name: tariff?.name ?? '',
            category: tariff?.category ?? 'consultation',
            price: tariff?.price ?? '',
            unit_id: tariff?.unit_id ?? null,
            description: tariff?.description ?? '',
            is_active: tariff?.is_active ?? true,
        });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (tariff) {
            put(route('master-data.tariffs.update', tariff.id));
        } else {
            post(route('master-data.tariffs.store'));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Kode Tarif"
                    htmlFor="code"
                    error={errors.code}
                >
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(event) =>
                            setData('code', event.target.value.toUpperCase())
                        }
                        placeholder="Contoh: KONSUL-01, EKG-01"
                        required
                    />
                </FormField>

                <FormField
                    label="Kategori"
                    htmlFor="category"
                    error={errors.category}
                >
                    <Select
                        value={data.category}
                        onValueChange={(value) =>
                            setData('category', value as TariffCategory)
                        }
                    >
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {tariffCategoryOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </div>

            <FormField
                label="Nama Layanan / Tindakan"
                htmlFor="name"
                error={errors.name}
            >
                <Input
                    id="name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="Contoh: Konsultasi Dokter Spesialis, USG Abdomen"
                    required
                />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Nominal Tarif (Rp)"
                    htmlFor="price"
                    error={errors.price}
                >
                    <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1000"
                        value={data.price}
                        onChange={(event) =>
                            setData(
                                'price',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="Contoh: 50000"
                        required
                    />
                </FormField>

                <FormField
                    label="Unit Terkait"
                    htmlFor="unit_id"
                    error={errors.unit_id}
                >
                    <Select
                        value={data.unit_id ? String(data.unit_id) : 'none'}
                        onValueChange={(value) =>
                            setData(
                                'unit_id',
                                value === 'none' ? null : Number(value),
                            )
                        }
                    >
                        <SelectTrigger id="unit_id">
                            <SelectValue placeholder="Semua Unit (Umum)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">
                                Berlaku untuk Semua Unit
                            </SelectItem>
                            {units.map((unit) => (
                                <SelectItem
                                    key={unit.id}
                                    value={String(unit.id)}
                                >
                                    {unit.name} ({unit.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </div>

            <FormField
                label="Keterangan"
                htmlFor="description"
                error={errors.description}
            >
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(event) =>
                        setData('description', event.target.value)
                    }
                    placeholder="Catatan tambahan mengenai tarif ini (opsional)"
                    rows={3}
                />
            </FormField>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) =>
                        setData('is_active', checked === true)
                    }
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                    Tarif aktif (dapat ditagihkan dalam kasir dan billing)
                </Label>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={processing}>
                    {tariff ? 'Simpan Perubahan' : 'Tambah Tarif'}
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('master-data.tariffs.index')}>Batal</Link>
                </Button>
            </div>
        </form>
    );
}
