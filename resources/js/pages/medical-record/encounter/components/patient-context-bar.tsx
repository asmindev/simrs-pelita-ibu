import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    CreditCard,
    History,
    Loader2,
    Shield,
    User,
} from 'lucide-react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';

import type { EncounterWithEmr } from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
};

function renderEncounterStatusBadge(status: string) {
    switch (status) {
        case 'arrived':
            return (
                <Badge variant="secondary" className="text-xs">
                    Menunggu
                </Badge>
            );
        case 'in_consultation':
            return (
                <Badge variant="default" className="text-xs">
                    Sedang Dilayani
                </Badge>
            );
        case 'finished':
            return (
                <Badge variant="outline" className="text-xs">
                    Selesai
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
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    {status}
                </Badge>
            );
    }
}

export function PatientContextBar({ encounter }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [completing, setCompleting] = useState(false);
    const patient = encounter.patient;

    const calculateAge = (birthDate?: string): string => {
        if (!birthDate) return '-';
        const diff = Date.now() - new Date(birthDate).getTime();
        const age = new Date(diff);
        return `${Math.abs(age.getUTCFullYear() - 1970)} tahun`;
    };

    const isMale = patient?.gender === 'male';
    const canComplete =
        encounter.status === 'arrived' ||
        encounter.status === 'in_consultation';

    // Temukan alergi dari asesmen terakhir
    const latestAllergies = encounter.assessments?.find(
        (a) => a.allergies,
    )?.allergies;

    function handleComplete() {
        setCompleting(true);
        router.post(
            route('medical-record.encounters.complete', encounter.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setConfirmOpen(false),
                onFinish: () => setCompleting(false),
            },
        );
    }

    return (
        <>
            <Card className="border-border bg-card shadow-xs">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Data Pasien Utama */}
                        <div className="flex items-start gap-3.5">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold text-foreground">
                                        {patient?.name || 'Pasien Tanpa Nama'}
                                    </h2>
                                    <Badge
                                        variant="default"
                                        className="font-mono text-xs font-semibold"
                                    >
                                        RM:{' '}
                                        {patient?.medical_record_number || '-'}
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {isMale ? 'Laki-laki' : 'Perempuan'}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {calculateAge(patient?.birth_date)}
                                    </Badge>
                                    {renderEncounterStatusBadge(
                                        encounter.status,
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1 font-mono">
                                        <CreditCard className="size-3 text-muted-foreground" />
                                        NIK: {patient?.nik || '-'}
                                    </span>
                                    <span>&bull;</span>
                                    <span className="font-mono">
                                        No. Rawat: {encounter.encounter_number}
                                    </span>
                                    <span>&bull;</span>
                                    <span>
                                        Unit: {encounter.unit?.name || '-'}
                                    </span>
                                    <span>&bull;</span>
                                    <span>
                                        Dokter:{' '}
                                        {encounter.doctor?.name ||
                                            'Belum ditentukan'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Kunjungan & Tindakan Cepat */}
                        <div className="flex flex-wrap items-center gap-2 lg:self-center">
                            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground">
                                <Shield className="size-3.5 text-primary" />
                                <span className="font-medium">
                                    {encounter.guarantor?.name || 'Umum'}
                                </span>
                            </div>

                            {encounter.queue?.queue_code && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground">
                                    <Clock className="size-3.5 text-muted-foreground" />
                                    <span>
                                        Antrean:{' '}
                                        <strong className="font-mono font-bold text-primary">
                                            {encounter.queue.queue_code}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            {patient?.id && (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 text-xs"
                                >
                                    <Link
                                        href={route(
                                            'medical-record.patient.history',
                                            patient.id,
                                        )}
                                    >
                                        <History className="size-3.5" />
                                        Riwayat Pasien
                                    </Link>
                                </Button>
                            )}

                            {canComplete && (
                                <Can permission="medical-record.encounter.update">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setConfirmOpen(true)}
                                        className="h-8 gap-1.5 text-xs"
                                    >
                                        <CheckCircle2 className="size-3.5" />
                                        Selesai Konsultasi
                                    </Button>
                                </Can>
                            )}
                        </div>
                    </div>

                    {/* Banner Peringatan Alergi */}
                    {latestAllergies && (
                        <div className="mt-3.5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                            <AlertTriangle className="size-4 shrink-0 text-destructive" />
                            <div>
                                <strong>Peringatan Alergi:</strong>{' '}
                                {latestAllergies}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Selesaikan Konsultasi?</DialogTitle>
                        <DialogDescription>
                            Status kunjungan{' '}
                            <span className="font-mono font-medium text-foreground">
                                {encounter.encounter_number}
                            </span>{' '}
                            akan diubah menjadi <strong>Selesai</strong> beserta
                            tiket antreannya. Pastikan asesmen dan e-resep sudah
                            lengkap.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                            disabled={completing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleComplete}
                            disabled={completing}
                        >
                            {completing && (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            )}
                            {completing ? 'Menyelesaikan...' : 'Ya, Selesaikan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
