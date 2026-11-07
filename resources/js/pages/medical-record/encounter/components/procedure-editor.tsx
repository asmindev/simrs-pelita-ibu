import { router, useForm } from '@inertiajs/react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type { EncounterWithEmr } from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
    doctors: Array<{ id: number; name: string }>;
};

export function ProcedureEditor({ encounter, doctors }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        icd9_code: '',
        name: '',
        performed_by: encounter.doctor_id ? String(encounter.doctor_id) : '',
        notes: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            route('medical-record.encounters.procedures.store', encounter.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus tindakan ini?')) return;

        setDeletingId(id);
        router.delete(route('medical-record.procedures.destroy', id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const procedures = encounter.procedures || [];

    return (
        <div className="space-y-6">
            {/* Form Tambah Tindakan */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Catat Tindakan Medis (ICD-9-CM)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                                <Label htmlFor="icd9_code">
                                    Kode ICD-9-CM (Opsional)
                                </Label>
                                <Input
                                    id="icd9_code"
                                    placeholder="Contoh: 86.59"
                                    value={data.icd9_code}
                                    onChange={(e) =>
                                        setData('icd9_code', e.target.value)
                                    }
                                />
                                {errors.icd9_code && (
                                    <p className="text-xs text-destructive">
                                        {errors.icd9_code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="proc_name">
                                    Nama Tindakan Medis
                                </Label>
                                <Input
                                    id="proc_name"
                                    placeholder="Contoh: Penjahitan luka terbuka / Rawat luka..."
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="performed_by">
                                    Dokter Pelaksana
                                </Label>
                                <Select
                                    value={data.performed_by || 'none'}
                                    onValueChange={(val) =>
                                        setData(
                                            'performed_by',
                                            val === 'none' ? '' : val,
                                        )
                                    }
                                >
                                    <SelectTrigger id="performed_by">
                                        <SelectValue placeholder="Pilih Dokter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Pilih Dokter
                                        </SelectItem>
                                        {doctors.map((d) => (
                                            <SelectItem
                                                key={d.id}
                                                value={String(d.id)}
                                            >
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="proc_notes">
                                    Catatan Tindakan
                                </Label>
                                <Input
                                    id="proc_notes"
                                    placeholder="Lokasi anatomis, komplikasi, pembiusan..."
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Tambah Tindakan'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Tabel Daftar Tindakan */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Daftar Tindakan Medis ({procedures.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">
                                    Kode ICD-9
                                </TableHead>
                                <TableHead>Nama Tindakan</TableHead>
                                <TableHead>Dokter Pelaksana</TableHead>
                                <TableHead>Catatan</TableHead>
                                <TableHead>Dicatat Oleh</TableHead>
                                <TableHead className="w-20 text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {procedures.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        <AlertCircle className="mx-auto mb-1 size-5 text-muted-foreground" />
                                        Belum ada tindakan medis yang dicatat
                                        pada kunjungan ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                procedures.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {p.icd9_code || '-'}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {p.name}
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {p.performed_by_doctor?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {p.notes || '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {p.created_by_user?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={deletingId === p.id}
                                                onClick={() =>
                                                    handleDelete(p.id)
                                                }
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
