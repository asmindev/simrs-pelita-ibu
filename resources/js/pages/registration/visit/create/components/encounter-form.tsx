import { Link, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Building2,
    Calendar,
    CreditCard,
    FileText,
    Stethoscope,
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
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';

import { SelectedPatientCard } from './selected-patient-card';

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
    types: _types,
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

    // Filter units based on service tab (Emergency vs Outpatient)
    const filteredUnits = useMemo(() => {
        if (data.type === 'emergency') {
            const igdUnits = units.filter(
                (u) =>
                    u.code.toLowerCase().includes('igd') ||
                    u.name.toLowerCase().includes('gawat darurat') ||
                    u.type?.toLowerCase() === 'emergency',
            );
            return igdUnits.length > 0 ? igdUnits : units;
        }
        return units;
    }, [units, data.type]);

    // Combobox Options
    const unitOptions: ComboboxOption[] = useMemo(
        () =>
            filteredUnits.map((u) => ({
                value: String(u.id),
                label: u.name,
                badge: u.code,
                description: u.type ? `Jenis: ${u.type}` : undefined,
            })),
        [filteredUnits],
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

    function handleTypeTabChange(typeValue: string) {
        setData('type', typeValue);
        // If switched to emergency, auto select IGD unit if found
        if (typeValue === 'emergency') {
            const igdUnit = units.find(
                (u) =>
                    u.code.toLowerCase().includes('igd') ||
                    u.name.toLowerCase().includes('gawat darurat'),
            );
            if (igdUnit) {
                setData('unit_id', String(igdUnit.id));
            }
        }
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
                    {/* Seksi 1: Pasien Terpilih / Pencarian Berkas */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="border-b border-border pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <UserCheck className="size-4 text-primary" />
                                1. Identitas & Berkas Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            {selectedPatient ? (
                                <SelectedPatientCard
                                    patient={selectedPatient}
                                    onClear={() => handlePatientChange(null)}
                                />
                            ) : (
                                <PatientPicker
                                    value={selectedPatient}
                                    onChange={handlePatientChange}
                                    error={errors.patient_id}
                                    placeholder="Ketik nama pasien, NIK, atau nomor rekam medis..."
                                />
                            )}

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

                    {/* Seksi 2: Jenis Pelayanan (Tabs), Unit & Penjamin */}
                    <Card className="border-border shadow-xs">
                        <CardHeader className="border-b border-border pb-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <Building2 className="size-4 text-primary" />
                                    2. Unit Tujuan & Penjamin Pelayanan
                                </CardTitle>

                                {/* Tabs Jenis Pelayanan */}
                                <Tabs
                                    value={data.type}
                                    onValueChange={handleTypeTabChange}
                                    className="w-full sm:w-auto"
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger
                                            value="outpatient"
                                            className="gap-1.5 text-xs font-medium"
                                        >
                                            <Stethoscope className="size-3.5" />
                                            Rawat Jalan
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="emergency"
                                            className="gap-1.5 text-xs font-medium"
                                        >
                                            <Activity className="size-3.5" />
                                            Gawat Darurat (IGD)
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Unit / Poli Tujuan */}
                                <FormField
                                    label={
                                        data.type === 'emergency'
                                            ? 'Unit Gawat Darurat'
                                            : 'Poliklinik Tujuan'
                                    }
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

                                {/* Dokter Pemeriksa */}
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

                            {/* Penjamin Pembayaran */}
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

                            {/* Catatan Pendaftaran */}
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
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="border-b border-border pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <FileText className="size-4 text-primary" />
                                Ringkasan Tiket Pendaftaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4 text-xs">
                            <div className="space-y-1">
                                <span className="text-[11px] text-muted-foreground uppercase">
                                    Jenis Pelayanan
                                </span>
                                <div>
                                    <Badge
                                        variant={
                                            data.type === 'emergency'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                        className="text-xs font-semibold uppercase"
                                    >
                                        {data.type === 'emergency'
                                            ? 'Gawat Darurat (IGD)'
                                            : 'Rawat Jalan'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-1 border-t border-border pt-3">
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
                                        No. RM:{' '}
                                        {selectedPatient.medical_record_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1 border-t border-border pt-3">
                                <span className="text-[11px] text-muted-foreground uppercase">
                                    Unit Tujuan
                                </span>
                                <div className="font-semibold text-foreground">
                                    {unitOptions.find(
                                        (u) => u.value === data.unit_id,
                                    )?.label || '-'}
                                </div>
                            </div>

                            <div className="space-y-1 border-t border-border pt-3">
                                <span className="text-[11px] text-muted-foreground uppercase">
                                    Dokter Pemeriksa
                                </span>
                                <div className="font-medium text-foreground">
                                    {doctorOptions.find(
                                        (d) => d.value === data.doctor_id,
                                    )?.label || 'Dokter Jaga / Umum'}
                                </div>
                            </div>

                            <div className="space-y-1 border-t border-border pt-3">
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
                                antrean otomatis diterbitkan dan langsung siap
                                diproses di unit pelayanan.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
