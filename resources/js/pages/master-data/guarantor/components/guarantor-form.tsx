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
    guarantorTypeOptions,
    type Guarantor,
    type GuarantorInput,
    type GuarantorType,
} from '../types/guarantor';

type Props = {
    guarantor?: Guarantor;
};

export function GuarantorForm({ guarantor }: Props) {
    const { data, setData, post, put, processing, errors } =
        useForm<GuarantorInput>({
            code: guarantor?.code ?? '',
            name: guarantor?.name ?? '',
            description: guarantor?.description ?? '',
            type: guarantor?.type ?? 'insurance',
            is_active: guarantor?.is_active ?? true,
        });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (guarantor) {
            put(route('master-data.guarantors.update', guarantor.id));
        } else {
            post(route('master-data.guarantors.store'));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Kode Penjamin"
                    htmlFor="code"
                    error={errors.code}
                >
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(event) =>
                            setData('code', event.target.value.toUpperCase())
                        }
                        placeholder="Contoh: BPJS, ASR-PRU"
                        required
                    />
                </FormField>

                <FormField
                    label="Tipe Penjamin"
                    htmlFor="type"
                    error={errors.type}
                >
                    <Select
                        value={data.type}
                        onValueChange={(value) =>
                            setData('type', value as GuarantorType)
                        }
                    >
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            {guarantorTypeOptions.map((option) => (
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

            <FormField label="Nama Penjamin" htmlFor="name" error={errors.name}>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="Contoh: BPJS Kesehatan, Asuransi Prudential"
                    required
                />
            </FormField>

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
                    placeholder="Catatan atau informasi tambahan (opsional)"
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
                    Penjamin aktif (dapat dipilih pada saat pendaftaran)
                </Label>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={processing}>
                    {guarantor ? 'Simpan Perubahan' : 'Tambah Penjamin'}
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('master-data.guarantors.index')}>
                        Batal
                    </Link>
                </Button>
            </div>
        </form>
    );
}
