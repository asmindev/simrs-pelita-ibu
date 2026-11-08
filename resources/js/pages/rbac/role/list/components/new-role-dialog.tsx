import { useForm } from '@inertiajs/react';
import { Key, Loader2 } from 'lucide-react';
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

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function NewRoleDialog({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('rbac.roles.store'), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="size-5 text-primary" />
                        Tambah Peran (Role) Baru
                    </DialogTitle>
                    <DialogDescription>
                        Buat kategori hak akses baru (gunakan huruf kecil dan
                        tanda hubung, contoh: billing-admin).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="role-name">
                            Nama Role{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="role-name"
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value.toLowerCase())
                            }
                            placeholder="contoh: radiologist-assistant"
                            className="bg-background text-xs"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
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
                            ) : (
                                'Buat Role'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
