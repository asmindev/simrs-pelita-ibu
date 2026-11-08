import { useForm } from '@inertiajs/react';
import { BedDouble, Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
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

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function NewBedDialog({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        room_name: '',
        bed_number: '',
        class: 'class_3',
        daily_rate: 150000,
        notes: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('inpatient.beds.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BedDouble className="size-5 text-primary" />
                        Tambah Tempat Tidur (Bed)
                    </DialogTitle>
                    <DialogDescription>
                        Daftarkan bed dan ruangan baru ke dalam sistem rawat
                        inap.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="room_name"
                            className="text-xs font-medium"
                        >
                            Nama Ruangan / Bangsal{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="room_name"
                            value={data.room_name}
                            onChange={(e) =>
                                setData('room_name', e.target.value)
                            }
                            placeholder="Contoh: Bangsal Mawar, Ruang Melati..."
                            className="h-8 text-xs"
                            required
                        />
                        {errors.room_name && (
                            <p className="text-xs text-destructive">
                                {errors.room_name}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="bed_number"
                                className="text-xs font-medium"
                            >
                                Nomor Bed{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="bed_number"
                                value={data.bed_number}
                                onChange={(e) =>
                                    setData('bed_number', e.target.value)
                                }
                                placeholder="Contoh: MWR-01, ICU-02..."
                                className="h-8 text-xs"
                                required
                            />
                            {errors.bed_number && (
                                <p className="text-xs text-destructive">
                                    {errors.bed_number}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="class"
                                className="text-xs font-medium"
                            >
                                Kelas Kamar{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.class}
                                onValueChange={(val) => setData('class', val)}
                            >
                                <SelectTrigger
                                    id="class"
                                    className="h-8 text-xs"
                                >
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vip">VIP</SelectItem>
                                    <SelectItem value="class_1">
                                        Kelas 1
                                    </SelectItem>
                                    <SelectItem value="class_2">
                                        Kelas 2
                                    </SelectItem>
                                    <SelectItem value="class_3">
                                        Kelas 3
                                    </SelectItem>
                                    <SelectItem value="icu">ICU</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.class && (
                                <p className="text-xs text-destructive">
                                    {errors.class}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="daily_rate"
                            className="text-xs font-medium"
                        >
                            Tarif Harian (Rp){' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="daily_rate"
                            type="number"
                            min="0"
                            step="1000"
                            value={data.daily_rate}
                            onChange={(e) =>
                                setData('daily_rate', Number(e.target.value))
                            }
                            className="h-8 text-xs"
                            required
                        />
                        {errors.daily_rate && (
                            <p className="text-xs text-destructive">
                                {errors.daily_rate}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-xs font-medium">
                            Keterangan / Fasilitas Tambahan
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Contoh: Dekat jendela, ada oksigen sentral..."
                            className="min-h-16 text-xs"
                        />
                        {errors.notes && (
                            <p className="text-xs text-destructive">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" size="sm" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            Simpan Bed
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
