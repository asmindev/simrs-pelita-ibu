import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckSquare,
    ChevronRight,
    FileText,
    Lock,
    Stethoscope,
    User,
} from 'lucide-react';

import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';

import type {
    EncounterWithEmr,
    PaginatedEncounters,
} from '../../types/medical-record';

type Props = {
    patient: {
        id: number;
        medical_record_number: string;
        nik: string | null;
        name: string;
        birth_date: string;
        gender: string;
        address: string | null;
        phone: string | null;
    };
    encounters: PaginatedEncounters;
    can_view_sensitive: boolean;
};

export default function PatientMedicalRecordHistory({
    patient,
    encounters,
    can_view_sensitive,
}: Props) {
    const calculateAge = (birthDate: string): string => {
        const diff = Date.now() - new Date(birthDate).getTime();
        const age = new Date(diff);
        return `${Math.abs(age.getUTCFullYear() - 1970)} tahun`;
    };

    return (
        <div className="space-y-4">
            <Head title={`Riwayat Rekam Medis - ${patient.name}`} />

            {/* Profil Pasien Singkat */}
            <Card className="border-border bg-card">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">
                            <User className="size-6 text-foreground" />
                        </div>
                        <div className="grid flex-1 gap-1 text-xs sm:grid-cols-3 sm:text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    NIK:{' '}
                                </span>
                                <span className="text-foreground">
                                    {patient.nik || '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Tanggal Lahir:{' '}
                                </span>
                                <span className="text-foreground">
                                    {new Date(
                                        patient.birth_date,
                                    ).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Usia:{' '}
                                </span>
                                <span className="text-foreground">
                                    {calculateAge(patient.birth_date)}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    No. Telepon:{' '}
                                </span>
                                <span className="text-foreground">
                                    {patient.phone || '-'}
                                </span>
                            </div>
                            <div className="sm:col-span-3">
                                <span className="text-muted-foreground">
                                    Alamat:{' '}
                                </span>
                                <span className="text-foreground">
                                    {patient.address || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Garis Waktu Riwayat Rekam Medis */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                    Kronologi Kunjungan & Pemeriksaan Medis ({encounters.total})
                </h3>

                {encounters.data.length === 0 ? (
                    <Card className="border-border bg-card">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <AlertCircle className="mx-auto mb-2 size-8 text-muted-foreground" />
                            Belum ada riwayat kunjungan medis yang tercatat
                            untuk pasien ini.
                        </CardContent>
                    </Card>
                ) : (
                    encounters.data.map((item: EncounterWithEmr) => {
                        const assessment = item.assessments?.[0];
                        const diagnoses = item.diagnoses || [];
                        const procedures = item.procedures || [];
                        const reports = item.clinical_reports || [];
                        const sensitive = item.sensitive_notes || [];

                        return (
                            <Card
                                key={item.id}
                                className="border-border bg-card"
                            >
                                <CardHeader className="border-b border-border pb-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-primary" />
                                            <span className="font-bold text-foreground">
                                                {new Date(
                                                    item.arrived_at,
                                                ).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {item.unit?.name}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                ({item.encounter_number})
                                            </span>
                                        </div>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link
                                                href={route(
                                                    'medical-record.encounters.show',
                                                    item.id,
                                                )}
                                            >
                                                Buka EMR Kunjungan
                                                <ChevronRight className="ml-1 size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 text-xs sm:text-sm">
                                    {/* Dokter & Penjamin */}
                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        <span>
                                            Dokter:{' '}
                                            <strong className="text-foreground">
                                                {item.doctor?.name || '-'}
                                            </strong>
                                        </span>
                                        <span>
                                            Penjamin:{' '}
                                            <strong className="text-foreground">
                                                {item.guarantor?.name || 'Umum'}
                                            </strong>
                                        </span>
                                    </div>

                                    {/* Asesmen SOAP */}
                                    {assessment ? (
                                        <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
                                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                <Stethoscope className="size-4 text-primary" />
                                                Asesmen SOAP
                                                {assessment.is_final && (
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2 text-xs"
                                                    >
                                                        Final
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid gap-2 text-xs sm:grid-cols-2">
                                                {assessment.subjective && (
                                                    <div>
                                                        <strong className="text-muted-foreground">
                                                            S:{' '}
                                                        </strong>
                                                        <span className="text-foreground">
                                                            {
                                                                assessment.subjective
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {assessment.objective && (
                                                    <div>
                                                        <strong className="text-muted-foreground">
                                                            O:{' '}
                                                        </strong>
                                                        <span className="text-foreground">
                                                            {
                                                                assessment.objective
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {assessment.assessment && (
                                                    <div>
                                                        <strong className="text-muted-foreground">
                                                            A:{' '}
                                                        </strong>
                                                        <span className="text-foreground">
                                                            {
                                                                assessment.assessment
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {assessment.plan && (
                                                    <div>
                                                        <strong className="text-muted-foreground">
                                                            P:{' '}
                                                        </strong>
                                                        <span className="text-foreground">
                                                            {assessment.plan}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground italic">
                                            Belum ada catatan SOAP pada
                                            kunjungan ini.
                                        </div>
                                    )}

                                    {/* Diagnosis & Tindakan */}
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {/* Diagnosis */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 font-semibold text-foreground">
                                                <CheckSquare className="size-3.5 text-primary" />
                                                Diagnosis ({diagnoses.length})
                                            </div>
                                            {diagnoses.length === 0 ? (
                                                <div className="text-xs text-muted-foreground">
                                                    -
                                                </div>
                                            ) : (
                                                <ul className="space-y-0.5 text-xs text-foreground">
                                                    {diagnoses.map((d) => (
                                                        <li key={d.id}>
                                                            <strong className="font-mono">
                                                                {d.icd10_code}
                                                            </strong>{' '}
                                                            - {d.icd10_name}
                                                            {d.type ===
                                                                'primary' &&
                                                                ' (Primer)'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Tindakan */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 font-semibold text-foreground">
                                                <Activity className="size-3.5 text-primary" />
                                                Tindakan Medis (
                                                {procedures.length})
                                            </div>
                                            {procedures.length === 0 ? (
                                                <div className="text-xs text-muted-foreground">
                                                    -
                                                </div>
                                            ) : (
                                                <ul className="space-y-0.5 text-xs text-foreground">
                                                    {procedures.map((p) => (
                                                        <li key={p.id}>
                                                            {p.name}{' '}
                                                            {p.icd9_code
                                                                ? `(${p.icd9_code})`
                                                                : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Laporan Khusus */}
                                    {reports.length > 0 && (
                                        <div className="space-y-1 border-t border-border pt-2">
                                            <div className="flex items-center gap-1 font-semibold text-foreground">
                                                <FileText className="size-3.5 text-primary" />
                                                Laporan Klinis Terbit (
                                                {reports.length})
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {reports.map((r) => (
                                                    <Button
                                                        key={r.id}
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'medical-record.reports.show',
                                                                r.id,
                                                            )}
                                                        >
                                                            {r.title}
                                                        </Link>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Catatan Sensitif jika diizinkan */}
                                    {can_view_sensitive &&
                                        sensitive.length > 0 && (
                                            <div className="space-y-1 rounded border border-border bg-muted/30 p-2.5 text-xs">
                                                <div className="flex items-center gap-1 font-semibold text-foreground">
                                                    <Lock className="size-3 text-primary" />
                                                    Catatan Sensitif (
                                                    {sensitive.length})
                                                </div>
                                                {sensitive.map((s) => (
                                                    <div
                                                        key={s.id}
                                                        className="text-foreground"
                                                    >
                                                        • [{s.category}]{' '}
                                                        {s.content}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Paginasi Riwayat */}
            {encounters.last_page > 1 && (
                <div className="flex justify-end">
                    <Pagination
                        links={encounters.links}
                        from={encounters.from}
                        to={encounters.to}
                        total={encounters.total}
                    />
                </div>
            )}
        </div>
    );
}
