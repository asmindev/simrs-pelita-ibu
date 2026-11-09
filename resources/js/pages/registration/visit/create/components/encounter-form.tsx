import { Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    CreditCard,
    FileText,
    UserCheck,
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

import { Combobox, type ComboboxOption } from '@/shared/components/combobox';
import { FormField } from '@/shared/components/form-field';
import { PatientPicker } from '@/shared/components/patient-picker';
import { route } from '@/shared/lib/route';
import type { PatientSearchResult } from '@/shared/types/patient';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

type UnitOption = {
    id: number;
    name: string;
    code: string;
    type?: string;
};

type DoctorOption = {
    id: number;
    name: string;
    code?: string;
    specialization?: string | null;
    schedules?: Array<{
        day_of_week: number;
        start_time: string;
        end_time: string;
        unit?: { id: number; name: string };
    }>;
};

type GuarantorOption = {
    id: number;
    name: string;
    code: string;
    type: string;
};

type TypeOption = {
    value: string;
    label: string;
};

type Props = {
    units: UnitOption[];
    doctors: DoctorOption[];
    guarantors: GuarantorOption[];
    types: TypeOption[];
    preselectedPatient?: PatientSearchResult | null;
};

export function EncounterForm({
    units,
    doctors,
    guarantors,
    types,
    preselectedPatient = null,
}: Props) {
    const [selectedPatient, setSelectedPatient] =
        useState<PatientSearchResult | null>(preselectedPatient);

    const { data, setData, post, processing, errors } = useForm({
        patient_id: preselectedPatient?.id ?? 0,
        unit_id: units[0]?.id ? String(units[0].id) : '',
        doctor_id: '',
        type: 'outpatient',
        guarantor_id: guarantors[0]?.id ? String(guarantors[0].id) : '',
        card_number: '',
        claim_number: '',
        notes: '',
        override_duplicate: false,
    });

    const selectedGuarantor = useMemo(
        () =>
            guarantors.find((g) => String(g.id) === String(data.guarantor_id)),
        [guarantors, data.guarantor_id],
    );

    const isInsuranceOrBpjs =
        selectedGuarantor?.type === 'bpjs' ||
        selectedGuarantor?.type === 'insurance';

    // Combobox Options
    const unitOptions: ComboboxOption[] = useMemo(
        () =>
            units.map((u) => ({
                value: String(u.id),
                label: u.name,
                badge: u.code,
                description: u.type ? `Jenis: ${u.type}` : undefined,
            })),
        [units],
    );

    const doctorOptions: ComboboxOption[] = useMemo(
        () =>
            doctors.map((d) => ({
                value: String(d.id),
                label: d.name,
                badge: d.code,
                description: d.specialization || 'Dokter Spesialis / Umum',
            })),
        [doctors],
    );

    const guarantorOptions: ComboboxOption[] = useMemo(
        () =>
            guarantors.map((g) => ({
                value: String(g.id),
                label: g.name,
                badge: g.code,
                description: `Kategori: ${g.type.toUpperCase()}`,
            })),
        [guarantors],
    );

    function handlePatientChange(patient: PatientSearchResult | null) {
        setSelectedPatient(patient);
        setData('patient_id', patient?.id ?? 0);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('registration.visits.store'));
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Kolom Kiri (2/3): Form Utama */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Seksi 1: Pencarian Berkas Pasien */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <UserCheck className="size-4 text-primary" />
                                1. Berkas Rekam Medis Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            <PatientPicker
                                value={selectedPatient}
                                onChange={handlePatientChange}
                                error={errors.patient_id}
                                placeholder="Ketik nama pasien, NIK, atau nomor rekam medis..."
                            />

                            {/* Warning / Duplicate override alert */}
                            {errors.patient_id && (
                                <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                        <span>{errors.patient_id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-6">
                                        <Checkbox
                                            id="override_duplicate"
                                            checked={data.override_duplicate}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'override_duplicate',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="override_duplicate"
                                            className="cursor-pointer text-xs font-semibold text-foreground"
                                        >
                                            Konfirmasi tetap buat kunjungan
                                            ganda hari ini
                                        </Label>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Seksi 2: Tujuan Pelayanan & Penjamin */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Building2 className="size-4 text-primary" />
                                2. Unit Tujuan & Penjamin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {/* Jenis Kunjungan (Radio / Button Pills) */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Jenis Pelayanan
                                </Label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {types.map((type) => {
                                        const isSelected =
                                            data.type === type.value;
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() =>
                                                    setData('type', type.value)
                                                }
                                                className={`flex items-center justify-center rounded-lg border p-2.5 text-xs font-medium transition-colors ${
                                                    isSelected
                                                        ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                                                        : 'border-border/80 bg-card text-muted-foreground hover:bg-muted/40'
                                                }`}
                                            >
                                                {type.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.type && (
                                    <p className="text-xs text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Unit / Poli Tujuan (Combobox Search) */}
                                <FormField
                                    label="Unit / Poliklinik Tujuan"
                                    htmlFor="unit_id"
                                    error={errors.unit_id}
                                >
                                    <Combobox
                                        options={unitOptions}
                                        value={data.unit_id}
                                        onValueChange={(val) =>
                                            setData('unit_id', val)
                                        }
                                        placeholder="Pilih unit atau poliklinik..."
                                        searchPlaceholder="Cari nama atau kode unit..."
                                    />
                                </FormField>

                                {/* Dokter Pemeriksa (Combobox Search) */}
                                <FormField
                                    label="Dokter Pemeriksa (Opsional)"
                                    htmlFor="doctor_id"
                                    error={errors.doctor_id}
                                    hint="Bisa dikosongkan untuk dokter jaga"
                                >
                                    <Combobox
                                        options={doctorOptions}
                                        value={data.doctor_id}
                                        onValueChange={(val) =>
                                            setData('doctor_id', val)
                                        }
                                        placeholder="Pilih dokter pemeriksa..."
                                        searchPlaceholder="Cari nama atau spesialis dokter..."
                                        clearable
                                    />
                                </FormField>
                            </div>

                            {/* Penjamin Pembayaran (Combobox Search) */}
                            <FormField
                                label="Penjamin Pembayaran Pasien"
                                htmlFor="guarantor_id"
                                error={errors.guarantor_id}
                            >
                                <Combobox
                                    options={guarantorOptions}
                                    value={data.guarantor_id}
                                    onValueChange={(val) =>
                                        setData('guarantor_id', val)
                                    }
                                    placeholder="Pilih penjamin pembayaran..."
                                    searchPlaceholder="Cari penjamin (BPJS, Umum, dll)..."
                                />
                            </FormField>

                            {/* Kolom Khusus BPJS / Asuransi */}
                            {isInsuranceOrBpjs && (
                                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3.5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                        <CreditCard className="size-4 text-primary" />
                                        Informasi Kepesertaan{' '}
                                        {selectedGuarantor?.name}
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <FormField
                                            label="Nomor Kartu Peserta"
                                            htmlFor="card_number"
                                            error={errors.card_number}
                                        >
                                            <Input
                                                id="card_number"
                                                value={data.card_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'card_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 0001234567890"
                                                className="h-8 bg-background text-xs"
                                            />
                                        </FormField>

                                        <FormField
                                            label="Nomor Rujukan / SEP (Opsional)"
                                            htmlFor="claim_number"
                                            error={errors.claim_number}
                                        >
                                            <Input
                                                id="claim_number"
                                                value={data.claim_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'claim_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 0301R001..."
                                                className="h-8 bg-background text-xs"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            {/* Catatan / Keluhan Awal */}
                            <FormField
                                label="Catatan Pendaftaran / Keluhan Awal"
                                htmlFor="notes"
                                error={errors.notes}
                            >
                                <Textarea
                                    id="notes"
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    placeholder="Keterangan keluhan awal atau catatan loket..."
                                    className="bg-background text-xs"
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-2">
                        <Button
                            type="submit"
                            size="default"
                            disabled={
                                processing || !data.patient_id || !data.unit_id
                            }
                            className="gap-1.5"
                        >
                            <Calendar className="size-4" />
                            {processing
                                ? 'Mendaftarkan...'
                                : 'Terbitkan Antrean Kunjungan'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={route('registration.visits.index')}>
                                Batal
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Kolom Kanan (1/3): Summary Card Preview */}
                <div className="space-y-4">
                    <Card className="border-border/80 bg-card shadow-xs">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <FileText className="size-4 text-primary" />
                                Ringkasan Tiket Pendaftaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4 text-xs">
                            <div className="space-y-1">
                                <span className="text-[11px] text-muted-foreground uppercase">
                                    Pasien Terpilih
                                </span>
                                <div className="font-semibold text-foreground">
                                    {selectedPatient
                                        ? selectedPatient.name
                                        : '(Belum dipilih)'}
                                </div>
                                {selectedPatient && (
                                    <p className="font-mono text-[11px] text-muted-foreground">
                                        RM:{' '}
                                        {selectedPatient.medical_record_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1 border-t border-border/60 pt-3">
                                <span className="text-[11px] text-muted-foreground uppercase">
                                    Unit Tujuan
                                </span>
                                <div className="font-semibold text-foreground">
                                    {unitOptions.find(
                                        (u) => u.value === data.unit_id,
                                    )?.label || '-'}
                                </div>
                            </div>

                            <div className="space-y-1 border-t border-border/60 pt-3">
                                <span className="text-[11px] text-muted-foreground uppercase">
                                    Dokter Pemeriksa
                                </span>
                                <div className="font-medium text-foreground">
                                    {doctorOptions.find(
                                        (d) => d.value === data.doctor_id,
                                    )?.label || 'Dokter Jaga / Umum'}
                                </div>
                            </div>

                            <div className="space-y-1 border-t border-border/60 pt-3">
                                <span className="text-[11px] text-muted-foreground uppercase">
                                    Penjamin Pembayaran
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Badge
                                        variant="outline"
                                        className="text-[11px]"
                                    >
                                        {selectedGuarantor?.name ||
                                            'Umum / Pribadi'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
                                💡 Setelah pendaftaran berhasil disimpan, nomor
                                antrean otomatis diterbitkan dan langsung muncul
                                pada papan antrean poli terkait.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
