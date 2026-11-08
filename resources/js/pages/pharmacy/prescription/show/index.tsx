import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Pill,
    RotateCcw,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { PageHeader } from '@/shared/components/page-header';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Textarea } from '@/shared/ui/textarea';

import type {
    DispensingRecord,
    Prescription,
    PrescriptionStatus,
} from '../../types/pharmacy';

type Props = {
    prescription: Prescription;
};

function getStatusBadge(status: PrescriptionStatus) {
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
                    Sudah Diverifikasi (Siap Dispensing)
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
                    <XCircle className="mr-1 size-3" />
                    Dibatalkan
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function PrescriptionShow({ prescription }: Props) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [selectedDispensing, setSelectedDispensing] =
        useState<DispensingRecord | null>(null);

    // Form Verifikasi
    const verifyForm = useForm({
        verification_notes:
            prescription.verification_notes ||
            'Resep telah diperiksa kelayakan dosis, alergi, dan interaksi obat.',
    });

    // Form Dispensing
    const dispenseForm = useForm({
        notes: '',
    });

    // Form Batal
    const cancelForm = useForm({
        cancel_reason: '',
    });

    // Form Retur
    const returnForm = useForm({
        dispensing_id: 0,
        quantity: 1,
        reason: '',
    });

    const handleVerify = (e: FormEvent) => {
        e.preventDefault();
        verifyForm.post(
            route('pharmacy.prescriptions.verify', prescription.id),
        );
    };

    const handleDispense = (e: FormEvent) => {
        e.preventDefault();
        dispenseForm.post(
            route('pharmacy.prescriptions.dispense', prescription.id),
        );
    };

    const handleCancel = (e: FormEvent) => {
        e.preventDefault();
        cancelForm.post(
            route('pharmacy.prescriptions.cancel', prescription.id),
            {
                onSuccess: () => setCancelDialogOpen(false),
            },
        );
    };

    const openReturnDialog = (dispensing: DispensingRecord) => {
        setSelectedDispensing(dispensing);
        returnForm.setData({
            dispensing_id: dispensing.id,
            quantity: 1,
            reason: '',
        });
        setReturnDialogOpen(true);
    };

    const handleReturn = (e: FormEvent) => {
        e.preventDefault();
        returnForm.post(
            route('pharmacy.prescriptions.return', prescription.id),
            {
                onSuccess: () => setReturnDialogOpen(false),
            },
        );
    };

    const items = prescription.items || [];
    const returns = prescription.returns || [];

    return (
        <div className="space-y-6">
            <Head
                title={`Resep ${prescription.prescription_number} — Farmasi`}
            />

            <PageHeader
                title={`Resep: ${prescription.prescription_number}`}
                description="Rincian e-resep dokter, ketersediaan batch obat FEFO, verifikasi telaah apoteker, dan pencatatan dispensing."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('pharmacy.prescriptions.index')}>
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali ke Daftar Resep
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* Status & Identitas Pasien */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border bg-card md:col-span-2">
                    <CardHeader className="border-b border-border pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-foreground">
                                Informasi Pasien & Kunjungan
                            </CardTitle>
                            {getStatusBadge(prescription.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Nama Pasien
                                </span>
                                <div className="font-semibold text-foreground">
                                    {prescription.patient?.name}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    No. Rekam Medis
                                </span>
                                <div className="font-mono text-sm font-medium text-foreground">
                                    {
                                        prescription.patient
                                            ?.medical_record_number
                                    }
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Dokter Penulis Resep
                                </span>
                                <div className="font-medium text-foreground">
                                    {prescription.doctor?.name || '-'}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Unit / Poliklinik
                                </span>
                                <div className="font-medium text-foreground">
                                    {prescription.unit?.name || '-'}
                                </div>
                            </div>
                        </div>

                        {prescription.notes && (
                            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                    Catatan Dokter:{' '}
                                </span>
                                {prescription.notes}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="border-b border-border pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                            Riwayat Alur Farmasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Diterbitkan:
                            </span>
                            <span className="font-medium text-foreground">
                                {new Date(
                                    prescription.created_at,
                                ).toLocaleString('id-ID')}
                            </span>
                        </div>
                        {prescription.verified_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Diverifikasi:
                                </span>
                                <span className="font-medium text-foreground">
                                    {new Date(
                                        prescription.verified_at,
                                    ).toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        {prescription.pharmacist && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Apoteker:
                                </span>
                                <span className="font-medium text-foreground">
                                    {prescription.pharmacist.name}
                                </span>
                            </div>
                        )}
                        {prescription.dispensed_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Diserahkan:
                                </span>
                                <span className="font-medium text-foreground">
                                    {new Date(
                                        prescription.dispensed_at,
                                    ).toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        {prescription.cancel_reason && (
                            <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-destructive">
                                <span className="font-semibold">
                                    Dibatalkan:{' '}
                                </span>
                                {prescription.cancel_reason}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Rincian Obat yang Diresepkan */}
            <Card className="border-border bg-card">
                <CardHeader className="border-b border-border pb-3">
                    <CardTitle className="text-base font-semibold text-foreground">
                        Daftar Item Resep & Alokasi Stok Batch (FEFO)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nama Obat</TableHead>
                                <TableHead>Signa & Dosis</TableHead>
                                <TableHead>Aturan Pakai</TableHead>
                                <TableHead className="text-center">
                                    Jumlah Resep
                                </TableHead>
                                <TableHead className="text-center">
                                    Jumlah Diserahkan
                                </TableHead>
                                <TableHead>Batch Tersedia (FEFO)</TableHead>
                                <TableHead className="text-right">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, idx) => {
                                const batches = item.drug?.batches || [];
                                const totalAvailable = batches.reduce(
                                    (acc, b) => acc + b.current_quantity,
                                    0,
                                );

                                return (
                                    <TableRow
                                        key={item.id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell className="font-mono text-xs">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-foreground">
                                                {item.drug?.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.drug?.form} •{' '}
                                                {item.drug?.unit_of_measure}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {item.frequency} ({item.dosage})
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Jalur: {item.route}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {item.instructions || '-'}
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {item.quantity}{' '}
                                            {item.drug?.unit_of_measure}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-sm">
                                            {item.dispensed_quantity}{' '}
                                            {item.drug?.unit_of_measure}
                                        </TableCell>
                                        <TableCell>
                                            {batches.length === 0 ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-destructive text-[11px] text-destructive"
                                                >
                                                    Stok Kosong
                                                </Badge>
                                            ) : (
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap gap-1">
                                                        {batches.map((b) => (
                                                            <Badge
                                                                key={b.id}
                                                                variant="outline"
                                                                className="text-[11px] font-normal"
                                                            >
                                                                {b.batch_number}{' '}
                                                                (
                                                                {
                                                                    b.current_quantity
                                                                }{' '}
                                                                tersedia, EXP:{' '}
                                                                {b.expiry_date})
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        Total:{' '}
                                                        <span
                                                            className={
                                                                totalAvailable >=
                                                                item.quantity
                                                                    ? 'font-semibold text-foreground'
                                                                    : 'font-semibold text-destructive'
                                                            }
                                                        >
                                                            {totalAvailable}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.status === 'dispensed' ? (
                                                <Badge
                                                    variant="default"
                                                    className="text-xs"
                                                >
                                                    Terserah
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    Menunggu
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Riwayat Batch yang Telah Diserahkan (Dispensing) */}
            {prescription.status === 'dispensed' && (
                <Card className="border-border bg-card">
                    <CardHeader className="border-b border-border pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                            Riwayat Penyerahan Batch & Retur Obat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                    <TableHead>Nama Obat</TableHead>
                                    <TableHead>Batch Terpakai</TableHead>
                                    <TableHead>Jumlah Diserahkan</TableHead>
                                    <TableHead>Waktu & Petugas</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.flatMap((item) =>
                                    (item.dispensings || []).map((disp) => (
                                        <TableRow
                                            key={disp.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="font-semibold text-foreground">
                                                {item.drug?.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {disp.drug_batch?.batch_number}{' '}
                                                (EXP:{' '}
                                                {disp.drug_batch?.expiry_date})
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {disp.quantity}{' '}
                                                {item.drug?.unit_of_measure}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(
                                                    disp.dispensed_at,
                                                ).toLocaleString('id-ID')}{' '}
                                                oleh{' '}
                                                {disp.dispenser?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Can permission="pharmacy.return.create">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openReturnDialog(
                                                                disp,
                                                            )
                                                        }
                                                    >
                                                        <RotateCcw className="mr-1.5 size-3.5" />
                                                        Retur Obat
                                                    </Button>
                                                </Can>
                                            </TableCell>
                                        </TableRow>
                                    )),
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Riwayat Retur yang Pernah Dicatat */}
            {returns.length > 0 && (
                <Card className="border-border bg-card">
                    <CardHeader className="border-b border-border pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                            Riwayat Pengembalian Obat (Retur)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Jumlah Dikembalikan</TableHead>
                                    <TableHead>Alasan Retur</TableHead>
                                    <TableHead>Waktu & Petugas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returns.map((ret) => (
                                    <TableRow key={ret.id}>
                                        <TableCell className="font-mono text-xs font-semibold">
                                            {ret.drug_batch?.batch_number}
                                        </TableCell>
                                        <TableCell className="font-semibold text-foreground">
                                            {ret.quantity} unit
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {ret.return_reason}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(
                                                ret.returned_at,
                                            ).toLocaleString('id-ID')}{' '}
                                            oleh {ret.returned_by_user?.name}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Panel Aksi Apoteker */}
            <div className="space-y-4">
                {prescription.status === 'submitted' && (
                    <Card className="border-border bg-card">
                        <CardHeader className="border-b border-border pb-3">
                            <CardTitle className="text-base font-semibold text-foreground">
                                Telaah & Verifikasi Apoteker
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="verify-notes"
                                        className="text-xs font-medium"
                                    >
                                        Catatan Telaah Klinis / Instruksi
                                        Farmasi
                                    </Label>
                                    <Textarea
                                        id="verify-notes"
                                        value={
                                            verifyForm.data.verification_notes
                                        }
                                        onChange={(e) =>
                                            verifyForm.setData(
                                                'verification_notes',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="bg-background text-sm"
                                        placeholder="Tuliskan telaah resep (kejelasan dosis, alergi, duplikasi)..."
                                    />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                    <Can permission="pharmacy.prescription.verify">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() =>
                                                setCancelDialogOpen(true)
                                            }
                                        >
                                            <XCircle className="mr-1.5 size-4" />
                                            Batalkan Resep
                                        </Button>
                                    </Can>

                                    <Can permission="pharmacy.prescription.verify">
                                        <Button
                                            type="submit"
                                            disabled={verifyForm.processing}
                                        >
                                            <ShieldCheck className="mr-1.5 size-4" />
                                            Verifikasi & Setujui Resep
                                        </Button>
                                    </Can>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {prescription.status === 'verified' && (
                    <Card className="border-border bg-card">
                        <CardHeader className="border-b border-border pb-3">
                            <CardTitle className="text-base font-semibold text-foreground">
                                Penyerahan Obat & Pengurangan Stok (Dispensing)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                                <p>
                                    Menekan tombol di bawah akan secara otomatis
                                    mengalokasikan obat dari{' '}
                                    <span className="font-semibold text-foreground">
                                        Batch dengan tanggal kedaluwarsa
                                        terdekat (FEFO)
                                    </span>
                                    , mengurangi stok batch obat, dan mencatat
                                    mutasi log farmasi.
                                </p>
                            </div>

                            <form
                                onSubmit={handleDispense}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="dispense-notes"
                                        className="text-xs font-medium"
                                    >
                                        Catatan Penyerahan (Opsional)
                                    </Label>
                                    <Input
                                        id="dispense-notes"
                                        value={dispenseForm.data.notes}
                                        onChange={(e) =>
                                            dispenseForm.setData(
                                                'notes',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Catatan tambahan saat penyerahan obat ke pasien..."
                                        className="h-9 bg-background text-xs"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                    <Can permission="pharmacy.prescription.verify">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() =>
                                                setCancelDialogOpen(true)
                                            }
                                        >
                                            <XCircle className="mr-1.5 size-4" />
                                            Batalkan Resep
                                        </Button>
                                    </Can>

                                    <Can permission="pharmacy.dispensing.create">
                                        <Button
                                            type="submit"
                                            disabled={dispenseForm.processing}
                                        >
                                            <Pill className="mr-1.5 size-4" />
                                            Proses Dispensing Obat (FEFO)
                                        </Button>
                                    </Can>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modal Batalkan Resep */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batalkan Resep Medis</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan membatalkan resep{' '}
                            {prescription.prescription_number}. Alasan
                            pembatalan wajib disertakan untuk audit trail.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCancel} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="cancel-reason"
                                className="text-xs font-medium"
                            >
                                Alasan Pembatalan
                            </Label>
                            <Textarea
                                id="cancel-reason"
                                value={cancelForm.data.cancel_reason}
                                onChange={(e) =>
                                    cancelForm.setData(
                                        'cancel_reason',
                                        e.target.value,
                                    )
                                }
                                placeholder="Tuliskan alasan pembatalan resep..."
                                rows={3}
                                className="bg-background text-sm"
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCancelDialogOpen(false)}
                            >
                                Tutup
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={cancelForm.processing}
                            >
                                Ya, Batalkan Resep
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Retur Obat */}
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Retur Obat ke Stok Batch</DialogTitle>
                        <DialogDescription>
                            Mengembalikan obat yang telah diserahkan kembali ke
                            stok batch obat farmasi.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDispensing && (
                        <form
                            onSubmit={handleReturn}
                            className="space-y-4 py-2"
                        >
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Jumlah Retur (Maksimal:{' '}
                                    {selectedDispensing.quantity})
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={selectedDispensing.quantity}
                                    value={returnForm.data.quantity}
                                    onChange={(e) =>
                                        returnForm.setData(
                                            'quantity',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="h-9 bg-background text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="return-reason"
                                    className="text-xs font-medium"
                                >
                                    Alasan Retur
                                </Label>
                                <Textarea
                                    id="return-reason"
                                    value={returnForm.data.reason}
                                    onChange={(e) =>
                                        returnForm.setData(
                                            'reason',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Pasien mengalami efek samping alergi, instruksi penghentian..."
                                    rows={3}
                                    className="bg-background text-sm"
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setReturnDialogOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={returnForm.processing}
                                >
                                    Proses Retur Obat
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
