import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock, History, Shield, User } from 'lucide-react';

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

    // Temukan alergi dari asesmen terakhir
    const latestAllergies = encounter.assessments?.find(
        (a) => a.allergies,
    )?.allergies;

    return (
        <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Data Pasien Utama */}
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground">
                            <User className="size-6 text-foreground" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold text-foreground">
                                    {patient?.name || 'Pasien Tanpa Nama'}
                                </h2>
                                <Badge variant="outline" className="text-xs">
                                    RM: {patient?.medical_record_number || '-'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {patient?.gender === 'male'
                                        ? 'Laki-laki'
                                        : 'Perempuan'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {calculateAge(patient?.birth_date)}
                                </Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                {patient?.nik && (
                                    <span>NIK: {patient.nik}</span>
                                )}
                                <span>
                                    No. Rawat: {encounter.encounter_number}
                                </span>
                                <span>Unit: {encounter.unit?.name || '-'}</span>
                                <span>
                                    Dokter:{' '}
                                    {encounter.doctor?.name || 'Belum dipilih'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Kunjungan & Tindakan Cepat */}
                    <div className="flex flex-wrap items-center gap-2 lg:self-center">
                        <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground">
                            <Shield className="size-3.5 text-primary" />
                            <span className="font-medium">
                                {encounter.guarantor?.name || 'Umum'}
                            </span>
                        </div>

                        {encounter.queue?.queue_code && (
                            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground">
                                <Clock className="size-3.5 text-muted-foreground" />
                                <span>
                                    Antrean:{' '}
                                    <strong className="text-primary">
                                        {encounter.queue.queue_code}
                                    </strong>
                                </span>
                            </div>
                        )}

                        {patient?.id && (
                            <Button asChild size="sm" variant="outline">
                                <Link
                                    href={route(
                                        'medical-record.patient.history',
                                        patient.id,
                                    )}
                                >
                                    <History className="mr-1.5 size-4" />
                                    Riwayat Pasien
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Banner Peringatan Alergi */}
                {latestAllergies && (
                    <div className="mt-3 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
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
