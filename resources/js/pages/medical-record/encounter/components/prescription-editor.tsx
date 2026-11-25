import { Link, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    ExternalLink,
    Loader2,
    Pill,
    Send,
    ShieldCheck,
} from 'lucide-react';
import type { FormEvent } from 'react';

import { Can } from '@/shared/components/can';
import {
    createEmptyPrescriptionItem,
    type PrescribableDrug,
    type PrescriptionDraftItem,
    PrescriptionItemsEditor,
} from '@/shared/components/prescription-items-editor';
import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Textarea } from '@/shared/ui/textarea';

import type {
    EncounterPrescriptionStatus,
    EncounterWithEmr,
} from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
    drugs: PrescribableDrug[];
};

function renderStatusBadge(status: EncounterPrescriptionStatus) {
    switch (status) {
        case 'submitted':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 size-3" />
                    Menunggu Verifikasi
                </Badge>
            );
        case 'verified':
            return (
                <Badge variant="default" className="text-xs">
                    <ShieldCheck className="mr-1 size-3" />
                    Siap Dispensing
                </Badge>
            );
        case 'dispensed':
            return (
                <Badge variant="outline" className="border-border text-xs">
                    <CheckCircle2 className="mr-1 size-3" />
                    Selesai Dispensing
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="border-destructive text-xs text-destructive"
                >
                    Dibatalkan
                </Badge>
            );
    }
}

export function PrescriptionEditor({ encounter, drugs }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        encounter_id: number;
        notes: string;
        items: PrescriptionDraftItem[];
    }>({
        encounter_id: encounter.id,
        notes: '',
        items: [createEmptyPrescriptionItem()],
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('pharmacy.prescriptions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    }

    const prescriptions = encounter.prescriptions ?? [];
    const formErrors = errors as Record<string, string | undefined>;
    const isActiveEncounter = encounter.status === 'in_consultation';

    return (
        <div className="space-y-6">
            <Can permission="pharmacy.prescription.create">
                {isActiveEncounter ? (
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                                <Pill className="size-4 text-primary" />
                                Buat E-Resep Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <PrescriptionItemsEditor
                                    drugs={drugs}
                                    items={data.items}
                                    onChange={(nextItems) =>
                                        setData('items', nextItems)
                                    }
                                    errors={formErrors}
                                />

                                <div className="space-y-1.5">
                                    <Label htmlFor="emr-rx-notes">
                                        Catatan Resep (Opsional)
                                    </Label>
                                    <Textarea
                                        id="emr-rx-notes"
                                        rows={2}
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        placeholder="Catatan umum untuk apoteker (alergi, instruksi racikan, dll)..."
                                        className="bg-background text-xs"
                                    />
                                    {errors.notes && (
                                        <p className="text-xs text-destructive">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="gap-1.5"
                                    >
                                        {processing ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Send className="size-4" />
                                        )}
                                        {processing
                                            ? 'Mengirim Resep...'
                                            : 'Kirim E-Resep ke Farmasi'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                        Pembuatan e-resep baru hanya tersedia untuk kunjungan
                        pasien yang sedang dilayani.
                    </div>
                )}
            </Can>

            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Riwayat E-Resep Kunjungan Ini ({prescriptions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {prescriptions.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                            Belum ada e-resep yang dikirim untuk kunjungan ini.
                        </div>
                    ) : (
                        prescriptions.map((rx) => (
                            <div
                                key={rx.id}
                                className="overflow-hidden rounded-lg border border-border bg-background"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-semibold text-foreground">
                                            {rx.prescription_number}
                                        </span>
                                        {renderStatusBadge(rx.status)}
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatDateTime(rx.created_at)}
                                            {rx.doctor
                                                ? ` · Dokter: ${rx.doctor.name}`
                                                : ''}
                                        </span>
                                    </div>

                                    <Can permission="pharmacy.prescription.view">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="xs"
                                            className="gap-1"
                                        >
                                            <Link
                                                href={route(
                                                    'pharmacy.prescriptions.show',
                                                    rx.id,
                                                )}
                                            >
                                                Buka di Farmasi
                                                <ExternalLink className="size-3" />
                                            </Link>
                                        </Button>
                                    </Can>
                                </div>

                                {(rx.notes ||
                                    rx.verification_notes ||
                                    rx.cancel_reason) && (
                                    <div className="space-y-1 border-b border-border bg-muted/10 px-4 py-2 text-xs text-muted-foreground">
                                        {rx.notes && (
                                            <p>
                                                <span className="font-medium text-foreground">
                                                    Catatan Dokter:
                                                </span>{' '}
                                                {rx.notes}
                                            </p>
                                        )}
                                        {rx.verification_notes && (
                                            <p>
                                                <span className="font-medium text-foreground">
                                                    Telaah Apoteker:
                                                </span>{' '}
                                                {rx.verification_notes}
                                            </p>
                                        )}
                                        {rx.cancel_reason && (
                                            <p className="text-destructive">
                                                <span className="font-medium">
                                                    Alasan Dibatalkan:
                                                </span>{' '}
                                                {rx.cancel_reason}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">
                                                Obat
                                            </TableHead>
                                            <TableHead className="text-xs">
                                                Dosis & Signa
                                            </TableHead>
                                            <TableHead className="text-xs">
                                                Rute / Durasi
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                                Jumlah
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(rx.items ?? []).map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-xs font-medium">
                                                    <div>
                                                        {item.product?.name ??
                                                            `Produk #${item.product_id}`}
                                                    </div>
                                                    {item.instructions && (
                                                        <div className="text-[11px] font-normal text-muted-foreground">
                                                            {item.instructions}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <span className="font-medium">
                                                        {item.dosage}
                                                    </span>{' '}
                                                    · {item.frequency}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {item.route ?? 'Oral'}
                                                    {item.duration_days
                                                        ? ` · ${item.duration_days} hari`
                                                        : ''}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    {item.quantity}{' '}
                                                    {item.product
                                                        ?.unit_of_measure ??
                                                        'unit'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
