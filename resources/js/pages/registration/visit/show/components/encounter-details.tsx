import {
    Activity,
    Building2,
    Calendar,
    CreditCard,
    FileText,
    Shield,
    Stethoscope,
    User,
} from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { Encounter } from '../../../types/registration';

interface EncounterDetailsProps {
    encounter: Encounter;
}

export function EncounterDetails({ encounter }: EncounterDetailsProps) {
    const patient = encounter.patient;
    const isMale =
        patient?.gender === 'male' || patient?.gender === ('M' as any);

    return (
        <div className="space-y-6">
            {/* Card 1: Identitas Pasien Pro Max */}
            <Card className="border-border bg-card shadow-xs">
                <CardHeader className="border-b border-border pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <User className="size-4 text-primary" />
                        Identitas Pasien
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="size-5" />
                            </div>
                            <div>
                                <div className="text-base font-bold text-foreground">
                                    {patient?.name ?? '-'}
                                </div>
                                <div className="flex items-center gap-2 pt-0.5 text-xs text-muted-foreground">
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-[11px] font-bold text-primary"
                                    >
                                        RM:{' '}
                                        {patient?.medical_record_number ?? '-'}
                                    </Badge>
                                    <span>&bull;</span>
                                    <span>
                                        {isMale ? 'Laki-laki' : 'Perempuan'}
                                    </span>
                                    <span>&bull;</span>
                                    <span>
                                        Lahir: {patient?.birth_date ?? '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 text-xs sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <CreditCard className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">NIK:</span>
                            <span className="font-mono font-medium text-foreground">
                                {patient?.nik ?? '-'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Waktu Masuk:
                            </span>
                            <span className="font-medium text-foreground">
                                {encounter.arrived_at}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Informasi Pelayanan & Penjamin */}
            <Card className="border-border bg-card shadow-xs">
                <CardHeader className="border-b border-border pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <Stethoscope className="size-4 text-primary" />
                        Pelayanan Medis & Penjamin
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Building2 className="size-3.5 text-primary" />
                                <span>Unit / Poliklinik</span>
                            </div>
                            <div className="text-sm font-bold text-foreground">
                                {encounter.unit?.name ?? '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Kode:{' '}
                                <span className="font-mono font-medium">
                                    {encounter.unit?.code}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Stethoscope className="size-3.5 text-primary" />
                                <span>Dokter Pemeriksa</span>
                            </div>
                            <div className="text-sm font-bold text-foreground">
                                {encounter.doctor?.name ??
                                    'Dokter Jaga / Poliklinik'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {encounter.doctor?.specialization ??
                                    'Dokter Spesialis / Umum'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 text-xs sm:grid-cols-2">
                        <div className="space-y-1">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Shield className="size-3.5 text-primary" />
                                Penjamin Pembayaran
                            </span>
                            <div className="text-sm font-semibold text-foreground">
                                {encounter.guarantor?.name ??
                                    'Umum / Pembayaran Pribadi'}
                            </div>
                            <Badge
                                variant="secondary"
                                className="text-[10px] uppercase"
                            >
                                Tipe: {encounter.guarantor?.type ?? 'Umum'}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Activity className="size-3.5 text-primary" />
                                Jenis Pelayanan
                            </span>
                            <div>
                                <Badge
                                    variant={
                                        encounter.type === 'emergency'
                                            ? 'destructive'
                                            : 'outline'
                                    }
                                    className="text-xs font-semibold uppercase"
                                >
                                    {encounter.type === 'emergency'
                                        ? 'Gawat Darurat (IGD)'
                                        : 'Rawat Jalan'}
                                </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                Status Pelayanan:{' '}
                                <span className="font-semibold text-foreground capitalize">
                                    {encounter.status}
                                </span>
                            </div>
                        </div>

                        {encounter.insurance_coverage?.card_number && (
                            <div className="space-y-1">
                                <span className="text-muted-foreground">
                                    Nomor Kartu Peserta:
                                </span>
                                <div className="font-mono font-semibold text-foreground">
                                    {encounter.insurance_coverage.card_number}
                                </div>
                            </div>
                        )}

                        {encounter.insurance_coverage?.claim_number && (
                            <div className="space-y-1">
                                <span className="text-muted-foreground">
                                    Nomor Rujukan / SEP:
                                </span>
                                <div className="font-mono font-semibold text-foreground">
                                    {encounter.insurance_coverage.claim_number}
                                </div>
                            </div>
                        )}
                    </div>

                    {encounter.notes && (
                        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                <FileText className="size-3.5 text-primary" />
                                Catatan Pendaftaran / Keluhan Awal
                            </span>
                            <p className="mt-1 leading-relaxed text-foreground">
                                {encounter.notes}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
