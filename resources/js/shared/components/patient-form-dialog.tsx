import { useForm } from '@inertiajs/react';
import { Loader2, UserPlus } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';

import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
import type { PatientSearchResult } from '@/shared/types/patient';
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

export interface PatientDialogModel {
    id: number;
    medical_record_number: string;
    nik: string | null;
    name: string;
    gender: 'male' | 'female';
    birth_date: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
}

export type PatientDialogInput = {
    medical_record_number: string;
    nik: string;
    name: string;
    gender: 'male' | 'female';
    birth_date: string;
    address: string;
    phone: string;
    is_active: boolean;
};

type Props = {
    patient?: PatientDialogModel | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (newPatient?: PatientSearchResult) => void;
};

export function PatientFormDialog({
    patient,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const isEdit = Boolean(patient);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<PatientDialogInput>({
            medical_record_number: patient?.medical_record_number ?? '',
            nik: patient?.nik ?? '',
            name: patient?.name ?? '',
            gender: patient?.gender ?? 'male',
            birth_date: patient?.birth_date
                ? patient.birth_date.slice(0, 10)
                : '',
            address: patient?.address ?? '',
            phone: patient?.phone ?? '',
            is_active: patient?.is_active ?? true,
        });

    useEffect(() => {
        if (open) {
            setData({
                medical_record_number: patient?.medical_record_number ?? '',
                nik: patient?.nik ?? '',
                name: patient?.name ?? '',
                gender: patient?.gender ?? 'male',
                birth_date: patient?.birth_date
                    ? patient.birth_date.slice(0, 10)
                    : '',
                address: patient?.address ?? '',
                phone: patient?.phone ?? '',
                is_active: patient?.is_active ?? true,
            });
        }
    }, [patient, open]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (patient) {
            put(route('master-data.patients.update', patient.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    onSuccess?.();
                },
            });
        } else {
            post(route('master-data.patients.store'), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    onSuccess?.();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="size-5 text-primary" />
                        {isEdit ? 'Ubah Data Pasien' : 'Tambah Pasien Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Ubah data identitas dan demografi pasien "${patient?.name}".`
                            : 'Daftarkan berkas rekam medis pasien baru ke sistem.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                            label="Nomor Rekam Medis (RM)"
                            htmlFor="shared-patient-dialog-mrn"
                            error={errors.medical_record_number}
                            hint={
                                isEdit
                                    ? 'Nomor RM terkunci'
                                    : 'Kosongkan untuk otomatisasi'
                            }
                        >
                            <Input
                                id="shared-patient-dialog-mrn"
                                value={data.medical_record_number}
                                onChange={(e) =>
                                    setData(
                                        'medical_record_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="mis. RM-00000001"
                                className="h-8 bg-background font-mono text-xs uppercase"
                                readOnly={isEdit}
                            />
                        </FormField>

                        <FormField
                            label="NIK (KTP)"
                            htmlFor="shared-patient-dialog-nik"
                            error={errors.nik}
                        >
                            <Input
                                id="shared-patient-dialog-nik"
                                value={data.nik}
                                onChange={(e) => setData('nik', e.target.value)}
                                placeholder="16 digit NIK"
                                maxLength={16}
                                className="h-8 bg-background font-mono text-xs"
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Nama Lengkap Pasien"
                        htmlFor="shared-patient-dialog-name"
                        error={errors.name}
                    >
                        <Input
                            id="shared-patient-dialog-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="mis. Budi Santoso"
                            className="h-8 bg-background text-xs"
                            required
                        />
                    </FormField>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                            label="Jenis Kelamin"
                            htmlFor="shared-patient-dialog-gender"
                            error={errors.gender}
                        >
                            <Select
                                value={data.gender}
                                onValueChange={(val) =>
                                    setData('gender', val as 'male' | 'female')
                                }
                            >
                                <SelectTrigger
                                    id="shared-patient-dialog-gender"
                                    className="h-8 bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih jenis kelamin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">
                                        Laki-laki
                                    </SelectItem>
                                    <SelectItem value="female">
                                        Perempuan
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField
                            label="Tanggal Lahir"
                            htmlFor="shared-patient-dialog-dob"
                            error={errors.birth_date}
                        >
                            <Input
                                id="shared-patient-dialog-dob"
                                type="date"
                                value={data.birth_date}
                                onChange={(e) =>
                                    setData('birth_date', e.target.value)
                                }
                                className="h-8 bg-background text-xs"
                                required
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Nomor Telepon / WhatsApp"
                        htmlFor="shared-patient-dialog-phone"
                        error={errors.phone}
                    >
                        <Input
                            id="shared-patient-dialog-phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="mis. 081234567890"
                            className="h-8 bg-background text-xs"
                        />
                    </FormField>

                    <FormField
                        label="Alamat Tempat Tinggal"
                        htmlFor="shared-patient-dialog-address"
                        error={errors.address}
                    >
                        <Textarea
                            id="shared-patient-dialog-address"
                            rows={2}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Alamat domisili lengkap pasien..."
                            className="bg-background text-xs"
                        />
                    </FormField>

                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="shared-patient-dialog-active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked === true)
                            }
                        />
                        <Label
                            htmlFor="shared-patient-dialog-active"
                            className="cursor-pointer text-xs font-normal"
                        >
                            Status Pasien Aktif
                        </Label>
                    </div>

                    <DialogFooter className="gap-2 pt-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : isEdit ? (
                                'Simpan Perubahan'
                            ) : (
                                'Daftarkan Pasien'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
