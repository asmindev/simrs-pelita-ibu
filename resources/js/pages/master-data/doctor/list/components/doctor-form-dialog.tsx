import { useForm } from '@inertiajs/react';
import { Loader2, Stethoscope } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';

import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
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

import type { Doctor, DoctorInput } from '../../types/doctor';

type Props = {
    doctor?: Doctor | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DoctorFormDialog({ doctor, open, onOpenChange }: Props) {
    const isEdit = Boolean(doctor);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<DoctorInput>({
            code: doctor?.code ?? '',
            name: doctor?.name ?? '',
            specialization: doctor?.specialization ?? '',
            license_number: doctor?.license_number ?? '',
            phone: doctor?.phone ?? '',
            email: doctor?.email ?? '',
            is_active: doctor?.is_active ?? true,
        });

    useEffect(() => {
        if (open) {
            setData({
                code: doctor?.code ?? '',
                name: doctor?.name ?? '',
                specialization: doctor?.specialization ?? '',
                license_number: doctor?.license_number ?? '',
                phone: doctor?.phone ?? '',
                email: doctor?.email ?? '',
                is_active: doctor?.is_active ?? true,
            });
        }
    }, [doctor, open]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (doctor) {
            put(route('master-data.doctors.update', doctor.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(route('master-data.doctors.store'), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Stethoscope className="size-5 text-primary" />
                        {isEdit ? 'Ubah Profil Dokter' : 'Tambah Dokter Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Ubah profil medis dan nomor SIP dokter "${doctor?.name}".`
                            : 'Daftarkan dokter pemeriksa baru beserta nomor izin praktiknya.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                            label="Kode Dokter"
                            htmlFor="doc-code"
                            error={errors.code}
                        >
                            <Input
                                id="doc-code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder="mis. DOK-001"
                                className="h-8 bg-background font-mono text-xs uppercase"
                                required
                            />
                        </FormField>

                        <FormField
                            label="Nomor SIP / Izin Praktik"
                            htmlFor="doc-sip"
                            error={errors.license_number}
                        >
                            <Input
                                id="doc-sip"
                                value={data.license_number}
                                onChange={(e) =>
                                    setData('license_number', e.target.value)
                                }
                                placeholder="mis. SIP-503/001/IDI/2023"
                                className="h-8 bg-background font-mono text-xs"
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Nama Lengkap & Gelar"
                        htmlFor="doc-name"
                        error={errors.name}
                    >
                        <Input
                            id="doc-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="mis. dr. Budi Santoso, Sp.A"
                            className="h-8 bg-background text-xs"
                            required
                        />
                    </FormField>

                    <FormField
                        label="Spesialisasi Klinis"
                        htmlFor="doc-spec"
                        error={errors.specialization}
                    >
                        <Input
                            id="doc-spec"
                            value={data.specialization}
                            onChange={(e) =>
                                setData('specialization', e.target.value)
                            }
                            placeholder="mis. Spesialis Anak / Dokter Umum"
                            className="h-8 bg-background text-xs"
                        />
                    </FormField>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                            label="Nomor Telepon / WhatsApp"
                            htmlFor="doc-phone"
                            error={errors.phone}
                        >
                            <Input
                                id="doc-phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="mis. 081234567890"
                                className="h-8 bg-background text-xs"
                            />
                        </FormField>

                        <FormField
                            label="Email"
                            htmlFor="doc-email"
                            error={errors.email}
                        >
                            <Input
                                id="doc-email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="dokter@rs.local"
                                className="h-8 bg-background text-xs"
                            />
                        </FormField>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="doc-active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked === true)
                            }
                        />
                        <Label
                            htmlFor="doc-active"
                            className="cursor-pointer text-xs font-normal"
                        >
                            Status Dokter Aktif
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
                                'Buat Dokter'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
