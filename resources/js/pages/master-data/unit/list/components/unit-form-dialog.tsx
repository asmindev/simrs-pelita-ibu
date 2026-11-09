import { useForm } from '@inertiajs/react';
import { Building2, Loader2 } from 'lucide-react';
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
} from '../../types/unit';

type Props = {
    unit?: Unit | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function UnitFormDialog({ unit, open, onOpenChange }: Props) {
    const isEdit = Boolean(unit);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<UnitInput>({
            code: unit?.code ?? '',
            name: unit?.name ?? '',
            description: unit?.description ?? '',
            type: unit?.type ?? 'outpatient',
            is_active: unit?.is_active ?? true,
        });

    useEffect(() => {
        if (open) {
            setData({
                code: unit?.code ?? '',
                name: unit?.name ?? '',
                description: unit?.description ?? '',
                type: unit?.type ?? 'outpatient',
                is_active: unit?.is_active ?? true,
            });
        }
    }, [unit, open]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (unit) {
            put(route('master-data.units.update', unit.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(route('master-data.units.store'), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="size-5 text-primary" />
                        {isEdit ? 'Ubah Data Unit' : 'Tambah Unit Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Ubah konfigurasi dan nama unit "${unit?.name}".`
                            : 'Daftarkan unit pelayanan baru di fasilitas kesehatan.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                            label="Kode Unit"
                            htmlFor="unit-dialog-code"
                            error={errors.code}
                        >
                            <Input
                                id="unit-dialog-code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder="mis. POLI-UMUM"
                                className="h-8 bg-background font-mono text-xs uppercase"
                                required
                            />
                        </FormField>

                        <FormField
                            label="Tipe Unit"
                            htmlFor="unit-dialog-type"
                            error={errors.type}
                        >
                            <Select
                                value={data.type}
                                onValueChange={(val) =>
                                    setData('type', val as UnitType)
                                }
                            >
                                <SelectTrigger
                                    id="unit-dialog-type"
                                    className="h-8 bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih tipe unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unitTypeOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <FormField
                        label="Nama Unit Pelayanan"
                        htmlFor="unit-dialog-name"
                        error={errors.name}
                    >
                        <Input
                            id="unit-dialog-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="mis. Poli Penyakit Dalam"
                            className="h-8 bg-background text-xs"
                            required
                        />
                    </FormField>

                    <FormField
                        label="Keterangan / Lokasi (Opsional)"
                        htmlFor="unit-dialog-desc"
                        error={errors.description}
                    >
                        <Textarea
                            id="unit-dialog-desc"
                            rows={2}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Keterangan fungsi atau letak ruangan..."
                            className="bg-background text-xs"
                        />
                    </FormField>

                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="unit-dialog-active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked === true)
                            }
                        />
                        <Label
                            htmlFor="unit-dialog-active"
                            className="cursor-pointer text-xs font-normal"
                        >
                            Status Unit Aktif
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
                                'Buat Unit'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
