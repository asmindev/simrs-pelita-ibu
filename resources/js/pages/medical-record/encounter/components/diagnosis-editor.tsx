import { router, useForm } from '@inertiajs/react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
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

import type {
    DiagnosisType,
    EncounterWithEmr,
} from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
};

export function DiagnosisEditor({ encounter }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        icd10_code: '',
        icd10_name: '',
        type: 'primary' as DiagnosisType,
        notes: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('medical-record.encounters.diagnoses.store', encounter.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus diagnosis ini?'))
            return;

        setDeletingId(id);
        router.delete(route('medical-record.diagnoses.destroy', id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const diagnoses = encounter.diagnoses || [];

    return (
        <div className="space-y-6">
            {/* Form Tambah Diagnosis */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Tambah Diagnosis ICD-10
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                                <Label htmlFor="icd10_code">Kode ICD-10</Label>
                                <Input
                                    id="icd10_code"
                                    placeholder="Contoh: A09 / I10"
                                    value={data.icd10_code}
                                    onChange={(e) =>
                                        setData(
                                            'icd10_code',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                />
                                {errors.icd10_code && (
                                    <p className="text-xs text-destructive">
                                        {errors.icd10_code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="icd10_name">
                                    Nama Diagnosis ICD-10
                                </Label>
                                <Input
                                    id="icd10_name"
                                    placeholder="Contoh: Infectious gastroenteritis and colitis..."
                                    value={data.icd10_name}
                                    onChange={(e) =>
                                        setData('icd10_name', e.target.value)
                                    }
                                />
                                {errors.icd10_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.icd10_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="type">Tipe Diagnosis</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(val) =>
                                        setData('type', val as DiagnosisType)
                                    }
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="primary">
                                            Primer (Utama)
                                        </SelectItem>
                                        <SelectItem value="secondary">
                                            Sekunder (Penyerta)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="notes">
                                    Keterangan Tambahan / Lokalisasi
                                </Label>
                                <Input
                                    id="notes"
                                    placeholder="Keterangan klinis tambahan (opsional)"
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
                                        ? 'Menambahkan...'
                                        : 'Tambah Diagnosis'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Tabel Daftar Diagnosis */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Daftar Diagnosis Kunjungan Ini ({diagnoses.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Tipe</TableHead>
                                <TableHead className="w-28">Kode</TableHead>
                                <TableHead>Deskripsi Penyakit</TableHead>
                                <TableHead>Keterangan</TableHead>
                                <TableHead>Dicatat Oleh</TableHead>
                                <TableHead className="w-20 text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {diagnoses.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        <AlertCircle className="mx-auto mb-1 size-5 text-muted-foreground" />
                                        Belum ada diagnosis yang dicatat untuk
                                        kunjungan ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                diagnoses.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    d.type === 'primary'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="text-xs"
                                            >
                                                {d.type === 'primary'
                                                    ? 'Primer'
                                                    : 'Sekunder'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-foreground">
                                            {d.icd10_code}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {d.icd10_name}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {d.notes || '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {d.created_by_user?.name || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={deletingId === d.id}
                                                onClick={() =>
                                                    handleDelete(d.id)
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
