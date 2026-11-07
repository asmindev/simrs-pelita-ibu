import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

import type { Assessment } from '../../types/medical-record';

type Props = {
    assessment: Assessment;
};

export function AddendumDialog({ assessment }: Props) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
        content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('medical-record.assessments.addenda.store', assessment.id), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="mr-1.5 size-3.5" />
                    Tambah Addendum
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Buat Catatan Addendum</DialogTitle>
                        <DialogDescription>
                            Rekam medis ini telah difinalisasi. Tambahkan
                            keterangan atau koreksi tambahan dengan alasan yang
                            jelas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="reason">Alasan Addendum</Label>
                            <Input
                                id="reason"
                                placeholder="Contoh: Klarifikasi hasil lab susulan"
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                            />
                            {errors.reason && (
                                <p className="text-xs text-destructive">
                                    {errors.reason}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="content">
                                Catatan Medis Tambahan
                            </Label>
                            <Textarea
                                id="content"
                                rows={4}
                                placeholder="Tuliskan isi catatan addendum..."
                                value={data.content}
                                onChange={(e) =>
                                    setData('content', e.target.value)
                                }
                            />
                            {errors.content && (
                                <p className="text-xs text-destructive">
                                    {errors.content}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Addendum'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
