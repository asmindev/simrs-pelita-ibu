import { Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

import { Can } from '@/shared/components/can';
import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
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

import { usePatientDuplicates } from '../hooks/use-patient-duplicates';
import type {
    Patient,
    PatientGender,
    PatientInput,
    PatientSearchResult,
} from '../types/patient';
import { PatientMergeDialog } from './patient-merge-dialog';

type Props = {
    patient?: Patient;
};

export function PatientForm({ patient }: Props) {
    const [mergeTarget, setMergeTarget] = useState<PatientSearchResult | null>(
        null,
    );
    const [isMergeOpen, setIsMergeOpen] = useState(false);

    const { data, setData, post, put, processing, errors } =
        useForm<PatientInput>({
            medical_record_number: patient?.medical_record_number ?? '',
            nik: patient?.nik ?? '',
            name: patient?.name ?? '',
            gender: patient?.gender ?? 'male',
            birth_date: patient?.birth_date.slice(0, 10) ?? '',
            address: patient?.address ?? '',
            phone: patient?.phone ?? '',
            is_active: patient?.is_active ?? true,
        });

    const { duplicates, loading } = usePatientDuplicates({
        nik: data.nik,
        name: data.name,
        birthDate: data.birth_date,
        excludeId: patient?.id,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (patient) {
            put(route('master-data.patients.update', patient.id));
        } else {
            post(route('master-data.patients.store'));
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            {duplicates.length > 0 && (
                <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium">Kemungkinan duplikat</p>
                    <ul className="space-y-1.5">
                        {duplicates.map((duplicate) => (
                            <li
                                key={duplicate.id}
                                className="flex items-center justify-between gap-2"
                            >
                                <div className="text-xs">
                                    <Link
                                        href={route(
                                            'master-data.patients.edit',
                                            duplicate.id,
                                        )}
                                        className="font-medium underline underline-offset-4"
                                    >
                                        {duplicate.name}
                                    </Link>{' '}
                                    · {duplicate.medical_record_number} ·{' '}
                                    {duplicate.nik ?? 'NIK tidak diisi'}{' '}
                                    <Badge
                                        variant="outline"
                                        className="text-[10px]"
                                    >
                                        {duplicate.is_active
                                            ? 'Aktif'
                                            : 'Nonaktif'}
                                    </Badge>
                                </div>
                                {patient &&
                                    !patient.merged_to_patient_id &&
                                    duplicate.is_active && (
                                        <Can permission="master-data.patient.merge">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setMergeTarget({
                                                        id: duplicate.id,
                                                        medical_record_number:
                                                            duplicate.medical_record_number,
                                                        nik: duplicate.nik,
                                                        name: duplicate.name,
                                                        gender: duplicate.gender,
                                                        birth_date:
                                                            duplicate.birth_date,
                                                        address: null,
                                                        phone: null,
                                                        is_active:
                                                            duplicate.is_active,
                                                        merged_to_patient_id:
                                                            null,
                                                    });
                                                    setIsMergeOpen(true);
                                                }}
                                                className="h-7 text-xs"
                                            >
                                                Gabungkan
                                            </Button>
                                        </Can>
                                    )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="Nomor rekam medis"
                    htmlFor="medical_record_number"
                    error={errors.medical_record_number}
                    hint={
                        patient
                            ? 'Nomor rekam medis tidak dapat diubah.'
                            : undefined
                    }
                >
                    <Input
                        id="medical_record_number"
                        value={data.medical_record_number}
                        onChange={(event) =>
                            setData('medical_record_number', event.target.value)
                        }
                        readOnly={Boolean(patient)}
                    />
                </FormField>

                <FormField
                    label="NIK"
                    htmlFor="nik"
                    error={errors.nik}
                    hint={loading ? 'Memeriksa duplikat...' : undefined}
                >
                    <Input
                        id="nik"
                        value={data.nik}
                        onChange={(event) => setData('nik', event.target.value)}
                        inputMode="numeric"
                        maxLength={16}
                    />
                </FormField>

                <FormField
                    label="Nama lengkap"
                    htmlFor="name"
                    error={errors.name}
                >
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                    />
                </FormField>

                <FormField
                    label="Jenis kelamin"
                    htmlFor="gender"
                    error={errors.gender}
                >
                    <Select
                        value={data.gender}
                        onValueChange={(value) =>
                            setData('gender', value as PatientGender)
                        }
                    >
                        <SelectTrigger id="gender">
                            <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Laki-laki</SelectItem>
                            <SelectItem value="female">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    label="Tanggal lahir"
                    htmlFor="birth_date"
                    error={errors.birth_date}
                >
                    <Input
                        id="birth_date"
                        type="date"
                        value={data.birth_date}
                        onChange={(event) =>
                            setData('birth_date', event.target.value)
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
            </div>

            <FormField label="Alamat" htmlFor="address" error={errors.address}>
                <Textarea
                    id="address"
                    value={data.address}
                    onChange={(event) => setData('address', event.target.value)}
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
                    <Link href={route('master-data.patients.index')}>
                        Batal
                    </Link>
                </Button>
            </div>

            {patient && (
                <PatientMergeDialog
                    sourcePatient={patient}
                    initialTargetPatient={mergeTarget}
                    open={isMergeOpen}
                    onOpenChange={setIsMergeOpen}
                />
            )}
        </form>
    );
}
