import { useForm } from '@inertiajs/react';
import { AlertCircle, Lock, Plus, ShieldAlert } from 'lucide-react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

import type {
    EncounterWithEmr,
    SensitiveCategory,
} from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
};

export function SensitiveNoteBox({ encounter }: Props) {
    const canView = encounter.can_view_sensitive;
    const sensitiveNotes = encounter.sensitive_notes || [];

    const { data, setData, post, processing, errors, reset } = useForm({
        category: 'psychiatry' as SensitiveCategory,
        content: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            route(
                'medical-record.encounters.sensitive-notes.store',
                encounter.id,
            ),
            {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                },
            },
        );
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'psychiatry':
                return 'Psikiatri & Kejiwaan';
            case 'hiv':
                return 'Status HIV / Menular Seksual';
            case 'substance_use':
                return 'Penyalahgunaan Zat / NAPZA';
            case 'domestic_violence':
                return 'Kekerasan Dalam Rumah Tangga';
            default:
                return 'Catatan Sensitif Khusus';
        }
    };

    if (!canView) {
        return (
            <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <Lock className="size-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                        Catatan Medis Khusus / Sensitif Terlindungi
                    </h3>
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                        Catatan medis kategori psikiatri, HIV, NAPZA, atau
                        kerahasiaan tinggi lainnya dienkripsi dan dibatasi. Anda
                        memerlukan izin akses klinis khusus atau pengaktifan
                        protokol darurat Break-Glass untuk melihat dan
                        menambahkan catatan ini.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Banner Peringatan Kerahasiaan */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
                <ShieldAlert className="size-5 shrink-0 text-primary" />
                <div className="text-xs text-muted-foreground">
                    <strong className="text-foreground">
                        Kerahasiaan Medis Khusus:
                    </strong>{' '}
                    Setiap akses ke lembar catatan sensitif ini dicatat dalam
                    log audit kepatuhan hukum dan medis rumah sakit.
                </div>
            </div>

            {/* Form Tambah Catatan Sensitif */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Tambah Catatan Medis Sensitif
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="category">
                                Kategori Kerahasiaan
                            </Label>
                            <Select
                                value={data.category}
                                onValueChange={(val) =>
                                    setData(
                                        'category',
                                        val as SensitiveCategory,
                                    )
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="psychiatry">
                                        Psikiatri & Masalah Kejiwaan
                                    </SelectItem>
                                    <SelectItem value="hiv">
                                        Status HIV / IMS
                                    </SelectItem>
                                    <SelectItem value="substance_use">
                                        Penyalahgunaan Napza & Zat Terlarang
                                    </SelectItem>
                                    <SelectItem value="domestic_violence">
                                        Kekerasan Fisik / KDRT
                                    </SelectItem>
                                    <SelectItem value="other">
                                        Kerahasiaan Khusus Lainnya
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-xs text-destructive">
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="sens_content">
                                Isi Catatan Klinis Khusus
                            </Label>
                            <Textarea
                                id="sens_content"
                                rows={4}
                                placeholder="Tuliskan catatan medis sensitif..."
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

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-1.5 size-4" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Catatan Khusus'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Daftar Catatan Sensitif */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Catatan Khusus Kunjungan Ini ({sensitiveNotes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {sensitiveNotes.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                            <AlertCircle className="mx-auto mb-1 size-5 text-muted-foreground" />
                            Tidak ada catatan medis sensitif untuk kunjungan
                            ini.
                        </div>
                    ) : (
                        sensitiveNotes.map((note) => (
                            <div
                                key={note.id}
                                className="space-y-2 rounded-lg border border-border bg-background p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {getCategoryLabel(note.category)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            note.created_at,
                                        ).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap text-foreground">
                                    {note.content}
                                </p>
                                {note.created_by_user && (
                                    <div className="text-xs text-muted-foreground">
                                        Dicatat oleh:{' '}
                                        {note.created_by_user.name}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
