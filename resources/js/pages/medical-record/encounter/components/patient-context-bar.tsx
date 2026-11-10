import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Clock,
    CreditCard,
    History,
    Shield,
    User,
} from 'lucide-react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

import type { EncounterWithEmr } from '../../types/medical-record';

type Props = {
    encounter: EncounterWithEmr;
};

export function PatientContextBar({ encounter }: Props) {
    const patient = encounter.patient;

    const calculateAge = (birthDate?: string): string => {
        if (!birthDate) return '-';
        const diff = Date.now() - new Date(birthDate).getTime();
        const age = new Date(diff);
        return `${Math.abs(age.getUTCFullYear() - 1970)} tahun`;
    };

    const isMale = patient?.gender === 'male';

    // Temukan alergi dari asesmen terakhir
    const latestAllergies = encounter.assessments?.find(
        (a) => a.allergies,
    )?.allergies;

    return (
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
                                    RM: {patient?.medical_record_number || '-'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {isMale ? 'Laki-laki' : 'Perempuan'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {calculateAge(patient?.birth_date)}
                                </Badge>
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
                                <span>Unit: {encounter.unit?.name || '-'}</span>
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
    );
}
