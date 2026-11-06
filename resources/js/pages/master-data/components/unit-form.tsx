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
    unitTypeOptions,
    type Unit,
    type UnitInput,
    type UnitType,
} from '../types/unit';

type Props = {
    unit?: Unit;
};

export function UnitForm({ unit }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<UnitInput>(
        {
            code: unit?.code ?? '',
            name: unit?.name ?? '',
            description: unit?.description ?? '',
            type: unit?.type ?? 'outpatient',
            is_active: unit?.is_active ?? true,
        },
    );

    function submit(event: FormEvent) {
        event.preventDefault();

        if (unit) {
            put(route('master-data.units.update', unit.id));
        } else {
            post(route('master-data.units.store'));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Kode unit" htmlFor="code" error={errors.code}>
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(event) =>
                            setData('code', event.target.value)
                        }
                        placeholder="mis. POLI-UMUM"
                    />
                </FormField>

                <FormField label="Nama unit" htmlFor="name" error={errors.name}>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                    />
                </FormField>

                <FormField label="Tipe" htmlFor="type" error={errors.type}>
                    <Select
                        value={data.type}
                        onValueChange={(value) =>
                            setData('type', value as UnitType)
                        }
                    >
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Pilih tipe unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {unitTypeOptions.map((option) => (
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
                label="Deskripsi"
                htmlFor="description"
                error={errors.description}
            >
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(event) =>
                        setData('description', event.target.value)
                    }
                />
            </FormField>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) =>
                        setData('is_active', checked === true)
                    }
                />
                <Label htmlFor="is_active">Aktif</Label>
            </div>

            <div className="flex items-center gap-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button asChild variant="outline">
                    <Link href={route('master-data.units.index')}>Batal</Link>
                </Button>
            </div>
        </form>
    );
}
