import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

import type { Doctor, DoctorInput } from '../types/doctor';

type Props = {
    doctor?: Doctor;
};

export function DoctorForm({ doctor }: Props) {
    const { data, setData, post, put, processing, errors } =
        useForm<DoctorInput>({
            code: doctor?.code ?? '',
            name: doctor?.name ?? '',
            specialization: doctor?.specialization ?? '',
            license_number: doctor?.license_number ?? '',
            phone: doctor?.phone ?? '',
            email: doctor?.email ?? '',
            is_active: doctor?.is_active ?? true,
        });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (doctor) {
            put(route('master-data.doctors.update', doctor.id));
        } else {
            post(route('master-data.doctors.store'));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Kode dokter"
                    htmlFor="code"
                    error={errors.code}
                >
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(event) =>
                            setData('code', event.target.value)
                        }
                        placeholder="mis. DOK-001"
                    />
                </FormField>

                <FormField label="Nama" htmlFor="name" error={errors.name}>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        placeholder="mis. dr. Budi Santoso"
                    />
                </FormField>

                <FormField
                    label="Spesialisasi"
                    htmlFor="specialization"
                    error={errors.specialization}
                >
                    <Input
                        id="specialization"
                        value={data.specialization}
                        onChange={(event) =>
                            setData('specialization', event.target.value)
                        }
                    />
                </FormField>

                <FormField
                    label="Nomor SIP"
                    htmlFor="license_number"
                    error={errors.license_number}
                >
                    <Input
                        id="license_number"
                        value={data.license_number}
                        onChange={(event) =>
                            setData('license_number', event.target.value)
                        }
                    />
                </FormField>

                <FormField label="Telepon" htmlFor="phone" error={errors.phone}>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(event) =>
                            setData('phone', event.target.value)
                        }
                    />
                </FormField>

                <FormField label="Email" htmlFor="email" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                    />
                </FormField>
            </div>

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
                    <Link href={route('master-data.doctors.index')}>Batal</Link>
                </Button>
            </div>
        </form>
    );
}
