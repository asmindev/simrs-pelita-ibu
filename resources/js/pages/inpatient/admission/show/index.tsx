import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    ArrowRightLeft,
    BedDouble,
    Clock,
    HeartPulse,
    LogOut,
    Plus,
    UserCircle,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/shared/components/page-header';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';

import type { Admission, Bed } from '../../types/inpatient';
import { DailyNoteDialog } from '../components/daily-note-dialog';
import { DischargeDialog } from '../components/discharge-dialog';
import { TransferBedDialog } from '../components/transfer-bed-dialog';

type Props = {
    admission: Admission;
    availableBeds: Bed[];
};

export default function AdmissionShowPage({ admission, availableBeds }: Props) {
    const [transferOpen, setTransferOpen] = useState(false);
    const [dischargeOpen, setDischargeOpen] = useState(false);
    const [dailyNoteOpen, setDailyNoteOpen] = useState(false);

    const currentBed = admission.current_assignment?.bed;
    const isActive = admission.status === 'active';

    return (
        <div className="space-y-6">
            <Head
                title={`Rawat Inap: ${admission.patient?.name ?? 'Pasien'} — SIMRS`}
            />
            <PageHeader
                title={`Rawat Inap: ${admission.patient?.name ?? 'Pasien'}`}
                description={`No. Admisi: ${admission.admission_number} | No. RM: ${admission.patient?.medical_record_number ?? '-'}`}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('inpatient.admissions.index')}>
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>

                        {isActive && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setTransferOpen(true)}
                                >
                                    <ArrowRightLeft className="mr-1.5 size-4" />
                                    Pindah Bed
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => setDailyNoteOpen(true)}
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Catat CPPT
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDischargeOpen(true)}
                                >
                                    <LogOut className="mr-1.5 size-4" />
                                    Pulangkan Pasien
                                </Button>
                            </>
                        )}
                    </div>
                }
            />

            {/* Top Cards: Status & Bed */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Patient & Admission Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserCircle className="size-5 text-primary" />
                                Profil Pasien & Rincian Admisi
                            </CardTitle>
                            <Badge
                                variant={isActive ? 'default' : 'secondary'}
                                className="text-xs"
                            >
                                {isActive ? 'Sedang Dirawat' : 'Sudah Pulang'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                        <div>
                            <span className="block text-muted-foreground">
                                Nama Lengkap Pasien
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                                {admission.patient?.name ?? '-'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground">
                                Nomor Rekam Medis
                            </span>
                            <span className="font-medium text-foreground">
                                {admission.patient?.medical_record_number ??
                                    '-'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground">
                                DPJP (Dokter Penanggung Jawab)
                            </span>
                            <span className="font-medium text-foreground">
                                {admission.doctor?.name ??
                                    admission.doctor?.user?.name ??
                                    'Dokter Jaga'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground">
                                Tanggal & Waktu Masuk
                            </span>
                            <span className="font-medium text-foreground">
                                {formatDateTime(admission.admitted_at)}
                            </span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground">
                                Tanggal & Waktu Pulang
                            </span>
                            <span className="font-medium text-foreground">
                                {admission.discharged_at
                                    ? formatDateTime(admission.discharged_at)
                                    : 'Masih dirawat'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground">
                                Kunjungan Terkait
                            </span>
                            <span className="font-medium text-foreground">
                                {admission.encounter?.encounter_number ?? '-'}
                            </span>
                        </div>

                        <div className="col-span-2 mt-1 border-t border-border pt-3 sm:col-span-3">
                            <span className="mb-1 block text-muted-foreground">
                                Diagnosa Masuk Awal
                            </span>
                            <p className="font-medium text-foreground">
                                {admission.initial_diagnosis ||
                                    'Tidak ada catatan diagnosa awal.'}
                            </p>
                        </div>

                        {admission.discharge_diagnosis && (
                            <div className="col-span-2 rounded-lg border border-border bg-muted/40 p-3 sm:col-span-3">
                                <span className="mb-1 block font-semibold text-foreground">
                                    Diagnosa Akhir / Pulang:
                                </span>
                                <p className="mb-2 text-muted-foreground">
                                    {admission.discharge_diagnosis}
                                </p>
                                {admission.discharge_summary && (
                                    <>
                                        <span className="mb-1 block font-semibold text-foreground">
                                            Ringkasan Pulang (Discharge
                                            Summary):
                                        </span>
                                        <p className="whitespace-pre-wrap text-muted-foreground">
                                            {admission.discharge_summary}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Bed Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BedDouble className="size-5 text-primary" />
                            Tempat Tidur Saat Ini
                        </CardTitle>
                        <CardDescription>
                            Lokasi bangsal dan kamar perawatan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        {currentBed ? (
                            <>
                                <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-foreground">
                                            Bed {currentBed.bed_number}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="text-xs uppercase"
                                        >
                                            Kelas{' '}
                                            {currentBed.class.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        {currentBed.room_name}
                                    </div>
                                    <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                                        Tarif:{' '}
                                        <span className="font-semibold text-foreground">
                                            {formatCurrency(
                                                currentBed.daily_rate,
                                            )}
                                        </span>{' '}
                                        / hari
                                    </div>
                                </div>

                                {isActive && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs"
                                        onClick={() => setTransferOpen(true)}
                                    >
                                        <ArrowRightLeft className="mr-1.5 size-3.5" />
                                        Pindah ke Bed Lain
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border p-4 text-center text-muted-foreground">
                                Pasien sudah tidak menempati bed (sudah
                                dipulangkan).
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Inpatient Daily Notes (CPPT) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="size-5 text-primary" />
                            Catatan Perkembangan Pasien Terintegrasi (CPPT)
                        </CardTitle>
                        <CardDescription>
                            Riwayat evaluasi harian tanda vital, kondisi klinis,
                            dan instruksi terapi (SOAP)
                        </CardDescription>
                    </div>
                    {isActive && (
                        <Button
                            size="sm"
                            onClick={() => setDailyNoteOpen(true)}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Tambah CPPT
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {!admission.daily_notes ||
                    admission.daily_notes.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                            Belum ada catatan CPPT yang dimasukkan untuk pasien
                            ini.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {admission.daily_notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="space-y-3 rounded-lg border border-border bg-card p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between border-b border-border pb-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    note.note_type ===
                                                    'doctor_visit'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="text-xs"
                                            >
                                                {note.note_type ===
                                                'doctor_visit'
                                                    ? 'Visite DPJP / Dokter'
                                                    : 'Observasi Perawat'}
                                            </Badge>
                                            <span className="font-semibold text-foreground">
                                                {note.author?.name ??
                                                    'Tenaga Medis'}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="size-3" />
                                            {formatDateTime(note.created_at)}
                                        </span>
                                    </div>

                                    {/* Vital Signs Row */}
                                    {note.vital_signs && (
                                        <div className="flex flex-wrap gap-2 rounded-md bg-muted/30 p-2.5 text-xs">
                                            <span className="mr-2 flex items-center gap-1 font-medium text-foreground">
                                                <HeartPulse className="size-3.5 text-primary" />
                                                TTV:
                                            </span>
                                            {note.vital_signs
                                                .blood_pressure && (
                                                <span className="rounded border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                                    TD:{' '}
                                                    <b className="text-foreground">
                                                        {
                                                            note.vital_signs
                                                                .blood_pressure
                                                        }
                                                    </b>{' '}
                                                    mmHg
                                                </span>
                                            )}
                                            {note.vital_signs.heart_rate && (
                                                <span className="rounded border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                                    HR:{' '}
                                                    <b className="text-foreground">
                                                        {
                                                            note.vital_signs
                                                                .heart_rate
                                                        }
                                                    </b>{' '}
                                                    x/m
                                                </span>
                                            )}
                                            {note.vital_signs
                                                .respiratory_rate && (
                                                <span className="rounded border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                                    RR:{' '}
                                                    <b className="text-foreground">
                                                        {
                                                            note.vital_signs
                                                                .respiratory_rate
                                                        }
                                                    </b>{' '}
                                                    x/m
                                                </span>
                                            )}
                                            {note.vital_signs.temperature && (
                                                <span className="rounded border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                                    Suhu:{' '}
                                                    <b className="text-foreground">
                                                        {
                                                            note.vital_signs
                                                                .temperature
                                                        }
                                                    </b>{' '}
                                                    °C
                                                </span>
                                            )}
                                            {note.vital_signs
                                                .oxygen_saturation && (
                                                <span className="rounded border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                                    SpO2:{' '}
                                                    <b className="text-foreground">
                                                        {
                                                            note.vital_signs
                                                                .oxygen_saturation
                                                        }
                                                    </b>{' '}
                                                    %
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* SOAP Grid */}
                                    <div className="grid grid-cols-1 gap-2 pt-1 text-xs sm:grid-cols-2">
                                        <div className="space-y-0.5">
                                            <span className="font-semibold text-foreground">
                                                S (Subjektif):
                                            </span>
                                            <p className="whitespace-pre-wrap text-muted-foreground">
                                                {note.subjective || '-'}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="font-semibold text-foreground">
                                                O (Objektif):
                                            </span>
                                            <p className="whitespace-pre-wrap text-muted-foreground">
                                                {note.objective || '-'}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="font-semibold text-foreground">
                                                A (Assessment):
                                            </span>
                                            <p className="whitespace-pre-wrap text-muted-foreground">
                                                {note.assessment || '-'}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="font-semibold text-foreground">
                                                P (Plan / Terapi):
                                            </span>
                                            <p className="whitespace-pre-wrap text-muted-foreground">
                                                {note.plan || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bed History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="size-5 text-primary" />
                        Riwayat Penempatan & Perpindahan Tempat Tidur
                    </CardTitle>
                    <CardDescription>
                        Audit alokasi bed pasien sejak pertama kali masuk rawat
                        inap
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!admission.assignments ||
                    admission.assignments.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            Tidak ada riwayat penempatan bed.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {admission.assignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex flex-wrap items-center justify-between rounded-lg border border-border bg-card p-3 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <BedDouble className="size-3.5 text-muted-foreground" />
                                            {assignment.bed
                                                ? `${assignment.bed.room_name} — Bed ${assignment.bed.bed_number}`
                                                : 'Bed'}
                                            {assignment.bed && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs uppercase"
                                                >
                                                    Kelas{' '}
                                                    {assignment.bed.class.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-muted-foreground">
                                            Alasan:{' '}
                                            {assignment.reason || 'Admisi awal'}
                                        </div>
                                    </div>

                                    <div className="text-right text-xs text-muted-foreground">
                                        <div>
                                            Masuk:{' '}
                                            <b className="text-foreground">
                                                {formatDateTime(
                                                    assignment.assigned_at,
                                                )}
                                            </b>
                                        </div>
                                        <div>
                                            Selesai:{' '}
                                            {assignment.released_at ? (
                                                <b className="text-foreground">
                                                    {formatDateTime(
                                                        assignment.released_at,
                                                    )}
                                                </b>
                                            ) : (
                                                <span className="font-medium text-primary">
                                                    Saat Ini
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <TransferBedDialog
                open={transferOpen}
                onOpenChange={setTransferOpen}
                admission={admission}
                availableBeds={availableBeds}
            />

            <DischargeDialog
                open={dischargeOpen}
                onOpenChange={setDischargeOpen}
                admission={admission}
            />

            <DailyNoteDialog
                open={dailyNoteOpen}
                onOpenChange={setDailyNoteOpen}
                admission={admission}
            />
        </div>
    );
}
