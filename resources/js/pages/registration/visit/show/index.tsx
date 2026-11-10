import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Ban } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { FormField } from '@/shared/components/form-field';
import { PageHeader } from '@/shared/components/page-header';
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
import { Textarea } from '@/shared/ui/textarea';

import type { Encounter } from '../../types/registration';
import { EncounterDetails } from './components/encounter-details';
import { QueueWidget } from './components/queue-widget';

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
            <Head
                title={`Detail Kunjungan ${encounter.encounter_number} — SIMRS`}
            />

            <PageHeader
                title={encounter.encounter_number}
                description="Rincian berkas kunjungan pasien, identitas penjamin, dan status antrean unit pelayanan."
                actions={
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('registration.visits.index')}>
                                <ArrowLeft className="mr-1.5 size-3.5" />
                                Kembali ke Daftar
                            </Link>
                        </Button>
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
                        Alasan:{' '}
                        {encounter.cancellation_reason ||
                            'Tidak ada keterangan'}
                        {encounter.cancelled_by &&
                            ` · Oleh: ${encounter.cancelled_by.name}`}
                        {encounter.cancelled_at &&
                            ` · Waktu: ${encounter.cancelled_at.slice(0, 16)}`}
                    </p>
                </div>
            )}

            {/* Layout 2 Kolom: Kiri (2/3) Detail Pasien & Pelayanan, Kanan (1/3) Widget Antrean */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <EncounterDetails encounter={encounter} />
                </div>

                <div className="lg:col-span-1">
                    <QueueWidget
                        encounter={encounter}
                        canCancel={canCancel}
                        onOpenCancel={() => setIsCancelOpen(true)}
                    />
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
                            <DialogDescription className="text-xs">
                                Masukkan alasan pembatalan kunjungan pasien.
                                Tindakan ini akan membatalkan antrean terkait
                                dan dicatat dalam audit trail.
                            </DialogDescription>
                        </DialogHeader>

                        <FormField
                            label="Alasan Pembatalan *"
                            htmlFor="cancellation_reason"
                            error={errors.cancellation_reason}
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
                                placeholder="Contoh: Pasien berhalangan hadir / salah poli / permintaan keluarga..."
                                className="bg-background text-xs"
                            />
                        </FormField>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCancelOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={
                                    processing ||
                                    !data.cancellation_reason.trim()
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
