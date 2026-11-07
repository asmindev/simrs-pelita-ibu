import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    Building2,
    Clock,
    FileText,
    Shield,
    Stethoscope,
    User,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Can } from '@/shared/components/can';
import { FormField } from '@/shared/components/form-field';
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
import { Textarea } from '@/shared/ui/textarea';

import type { Encounter } from '../../types/registration';

type Props = {
    encounter: Encounter;
};

export default function EncounterShow({ encounter }: Props) {
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        cancellation_reason: '',
    });

    function handleCancelSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('registration.visits.cancel', encounter.id), {
            onSuccess: () => {
                setIsCancelOpen(false);
                reset();
            },
        });
    }

    const canCancel =
        encounter.status !== 'finished' && encounter.status !== 'cancelled';

    return (
        <div className="space-y-6">
            <Head title={`Detail Kunjungan ${encounter.encounter_number}`} />

            <PageHeader
                title={encounter.encounter_number}
                description="Rincian berkas kunjungan pasien dan nomor antrean unit."
                actions={
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('registration.visits.index')}>
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                        {canCancel && (
                            <Can permission="registration.visit.cancel">
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsCancelOpen(true)}
                                >
                                    <Ban className="mr-1.5 size-4" />
                                    Batalkan Kunjungan
                                </Button>
                            </Can>
                        )}
                    </div>
                }
            />

            {/* Banner if cancelled */}
            {encounter.status === 'cancelled' && (
                <div className="space-y-1 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    <p className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="size-4" />
                        Kunjungan Telah Dibatalkan
                    </p>
                    <p className="text-xs">
                        Alasan: {encounter.cancellation_reason}
                        {encounter.cancelled_by &&
                            ` · Oleh: ${encounter.cancelled_by.name}`}
                        {encounter.cancelled_at &&
                            ` · Waktu: ${encounter.cancelled_at.slice(0, 16)}`}
                    </p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                {/* Antrean Highlight Card */}
                <Card className="border-border bg-card md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs tracking-wider text-muted-foreground uppercase">
                            Nomor Antrean
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <div className="py-4">
                            <div className="font-mono text-4xl font-extrabold tracking-tight text-primary tabular-nums">
                                {encounter.queue?.queue_code ?? '-'}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {encounter.unit?.name}
                            </div>
                        </div>

                        <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3 text-left text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Status Antrean:
                                </span>
                                <span className="font-semibold text-foreground capitalize">
                                    {encounter.queue?.status ?? '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Nomor Urut:
                                </span>
                                <span className="font-mono font-medium text-foreground">
                                    {encounter.queue?.queue_number ?? '-'}
                                </span>
                            </div>
                            {encounter.queue?.called_by && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Dipanggil Oleh:
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {encounter.queue.called_by.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            <Link
                                href={route('registration.queues.board', {
                                    unit_id: encounter.unit_id,
                                })}
                            >
                                Buka Papan Antrean Unit →
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Pasien & Pelayanan Info */}
                <div className="space-y-6 md:col-span-2">
                    {/* Data Pasien */}
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <User className="size-4 text-primary" />
                                Identitas Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Nama Lengkap
                                </span>
                                <div className="font-medium text-foreground">
                                    {encounter.patient?.name}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Nomor Rekam Medis
                                </span>
                                <div className="font-mono font-semibold text-primary">
                                    {encounter.patient?.medical_record_number}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    NIK
                                </span>
                                <div className="font-mono text-muted-foreground">
                                    {encounter.patient?.nik ?? '-'}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Jenis Kelamin / Lahir
                                </span>
                                <div className="text-foreground">
                                    {encounter.patient?.gender === 'male'
                                        ? 'Laki-laki'
                                        : 'Perempuan'}{' '}
                                    · {encounter.patient?.birth_date}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Pelayanan & Penjamin */}
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Stethoscope className="size-4 text-primary" />
                                Informasi Pelayanan & Penjamin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Building2 className="size-3" />
                                    Unit / Poli
                                </span>
                                <div className="font-medium text-foreground">
                                    {encounter.unit?.name} (
                                    {encounter.unit?.code})
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Dokter Pemeriksa
                                </span>
                                <div className="font-medium text-foreground">
                                    {encounter.doctor?.name ??
                                        'Dokter Jaga / Umum'}
                                </div>
                            </div>
                            <div>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Shield className="size-3" />
                                    Penjamin Pembayaran
                                </span>
                                <div className="font-medium text-foreground">
                                    {encounter.guarantor?.name}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Jenis Kunjungan
                                </span>
                                <div>
                                    <Badge
                                        variant="outline"
                                        className="text-xs uppercase"
                                    >
                                        {encounter.type}
                                    </Badge>
                                </div>
                            </div>

                            {encounter.insurance_coverage?.card_number && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Nomor Kartu
                                    </span>
                                    <div className="font-mono text-xs">
                                        {
                                            encounter.insurance_coverage
                                                .card_number
                                        }
                                    </div>
                                </div>
                            )}

                            {encounter.insurance_coverage?.claim_number && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Nomor Rujukan / SEP
                                    </span>
                                    <div className="font-mono text-xs">
                                        {
                                            encounter.insurance_coverage
                                                .claim_number
                                        }
                                    </div>
                                </div>
                            )}

                            <div className="sm:col-span-2">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    Waktu Pendaftaran
                                </span>
                                <div className="text-xs text-muted-foreground">
                                    {encounter.arrived_at}
                                </div>
                            </div>

                            {encounter.notes && (
                                <div className="border-t border-border pt-2 sm:col-span-2">
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <FileText className="size-3" />
                                        Catatan / Keluhan Awal
                                    </span>
                                    <p className="mt-0.5 text-xs text-foreground">
                                        {encounter.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cancel Modal Dialog */}
            <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <DialogContent>
                    <form onSubmit={handleCancelSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <Ban className="size-5" />
                                Batalkan Kunjungan
                            </DialogTitle>
                            <DialogDescription>
                                Masukkan alasan pembatalan kunjungan pasien.
                                Tindakan ini akan membatalkan antrean terkait
                                dan dicatat dalam audit trail.
                            </DialogDescription>
                        </DialogHeader>

                        <FormField
                            label="Alasan Pembatalan"
                            htmlFor="cancellation_reason"
                            error={errors.cancellation_reason}
                            hint="Minimal 5 karakter penjelasan pembatalan."
                        >
                            <Textarea
                                id="cancellation_reason"
                                rows={3}
                                value={data.cancellation_reason}
                                onChange={(e) =>
                                    setData(
                                        'cancellation_reason',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: Pasien mendadak harus pulang dan membatalkan konsultasi."
                            />
                        </FormField>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCancelOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={
                                    processing ||
                                    data.cancellation_reason.trim().length < 5
                                }
                            >
                                {processing
                                    ? 'Membatalkan...'
                                    : 'Konfirmasi Batal'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
