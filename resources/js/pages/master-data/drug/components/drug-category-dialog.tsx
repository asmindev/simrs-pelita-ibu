import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

import type { DrugCategory } from '../types/drug';

type Props = {
    categories: DrugCategory[];
    onCategoryCreated?: (newCategory: DrugCategory) => void;
};

export function DrugCategoryDialog({ categories }: Props) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const deleteForm = useForm();

    function submit(event: FormEvent) {
        event.preventDefault();

        post(route('master-data.drug-categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    }

    function handleDelete(category: DrugCategory) {
        if (
            !confirm(
                `Hapus kategori "${category.name}"? Pastikan tidak ada obat di bawah kategori ini.`,
            )
        ) {
            return;
        }

        deleteForm.delete(
            route('master-data.drug-categories.destroy', category.id),
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Plus className="size-4" />
                    Kategori Obat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Kelola Kategori Obat</DialogTitle>
                    <DialogDescription>
                        Tambah atau hapus kelompok kategori obat (contoh:
                        Antibiotik, Analgesik, Vitamin).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3 pt-2">
                    <div className="space-y-1">
                        <Label htmlFor="category-name">
                            Nama Kategori Baru
                        </Label>
                        <Input
                            id="category-name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder="cth: Antipiretik"
                            disabled={processing}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="category-description">
                            Deskripsi (Opsional)
                        </Label>
                        <Textarea
                            id="category-description"
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            placeholder="Keterangan golongan obat..."
                            rows={2}
                            disabled={processing}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing || !data.name.trim()}
                        >
                            {processing ? 'Menyimpan...' : 'Tambah Kategori'}
                        </Button>
                    </div>
                </form>

                <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Daftar Kategori Terdaftar ({categories.length})
                    </p>
                    <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                        {categories.length === 0 ? (
                            <p className="py-2 text-center text-xs text-muted-foreground">
                                Belum ada kategori obat.
                            </p>
                        ) : (
                            categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between rounded-lg border border-border/60 p-2 text-xs hover:bg-muted/40"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {category.name}
                                        </p>
                                        {category.description && (
                                            <p className="line-clamp-1 text-muted-foreground">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => handleDelete(category)}
                                        className="text-muted-foreground hover:text-destructive"
                                        disabled={deleteForm.processing}
                                        title="Hapus Kategori"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
