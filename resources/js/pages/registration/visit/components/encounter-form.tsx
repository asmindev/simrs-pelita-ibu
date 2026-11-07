import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Calendar } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { FormField } from '@/shared/components/form-field';
import { PatientPicker } from '@/shared/components/patient-picker';
import { route } from '@/shared/lib/route';
import type { PatientSearchResult } from '@/shared/types/patient';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
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

    const selectedGuarantor = guarantors.find(
        (g) => String(g.id) === String(data.guarantor_id),
    );
    const isInsuranceOrBpjs =
        selectedGuarantor?.type === 'bpjs' ||
        selectedGuarantor?.type === 'insurance';

    function handlePatientChange(patient: PatientSearchResult | null) {
        setSelectedPatient(patient);
        setData('patient_id', patient?.id ?? 0);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('registration.visits.store'));
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-5">
            {/* Patient Picker */}
            <div className="space-y-1.5">
                <PatientPicker
                    label="Berkas Rekam Medis Pasien"
                    value={selectedPatient}
                    onChange={handlePatientChange}
                    error={errors.patient_id}
                    placeholder="Ketik nama pasien, NIK, atau nomor rekam medis..."
                />
            </div>

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
                                setData('override_duplicate', checked === true)
                            }
                        />
                        <Label
                            htmlFor="override_duplicate"
                            className="cursor-pointer text-xs font-semibold text-foreground"
                        >
                            Konfirmasi tetap buat kunjungan ganda hari ini
                        </Label>
                    </div>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                {/* Jenis Kunjungan */}
                <FormField
                    label="Jenis Kunjungan"
                    htmlFor="type"
                    error={errors.type}
                >
                    <Select
                        value={data.type}
                        onValueChange={(val) => setData('type', val)}
                    >
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Pilih jenis kunjungan" />
                        </SelectTrigger>
                        <SelectContent>
                            {types.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                {/* Unit / Poli Tujuan */}
                <FormField
                    label="Unit / Poli Pelayanan"
                    htmlFor="unit_id"
                    error={errors.unit_id}
                >
                    <Select
                        value={data.unit_id}
                        onValueChange={(val) => setData('unit_id', val)}
                    >
                        <SelectTrigger id="unit_id">
                            <SelectValue placeholder="Pilih unit poli" />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((unit) => (
                                <SelectItem
                                    key={unit.id}
                                    value={String(unit.id)}
                                >
                                    {unit.name} ({unit.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                {/* Dokter Pemeriksa */}
                <FormField
                    label="Dokter Pemeriksa (Opsional)"
                    htmlFor="doctor_id"
                    error={errors.doctor_id}
                    hint="Bisa dikosongkan jika dokter belum ditentukan."
                >
                    <Select
                        value={data.doctor_id}
                        onValueChange={(val) => setData('doctor_id', val)}
                    >
                        <SelectTrigger id="doctor_id">
                            <SelectValue placeholder="Pilih dokter pemeriksa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Dokter Jaga / Umum</SelectItem>
                            {doctors.map((doctor) => (
                                <SelectItem
                                    key={doctor.id}
                                    value={String(doctor.id)}
                                >
                                    {doctor.name}{' '}
                                    {doctor.specialization
                                        ? `(${doctor.specialization})`
                                        : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                {/* Penjamin Pembayaran */}
                <FormField
                    label="Penjamin Pembayaran"
                    htmlFor="guarantor_id"
                    error={errors.guarantor_id}
                >
                    <Select
                        value={data.guarantor_id}
                        onValueChange={(val) => setData('guarantor_id', val)}
                    >
                        <SelectTrigger id="guarantor_id">
                            <SelectValue placeholder="Pilih penjamin" />
                        </SelectTrigger>
                        <SelectContent>
                            {guarantors.map((guarantor) => (
                                <SelectItem
                                    key={guarantor.id}
                                    value={String(guarantor.id)}
                                >
                                    {guarantor.name} ({guarantor.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </div>

            {/* Fields khusus BPJS / Asuransi */}
            {isInsuranceOrBpjs && (
                <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
                    <FormField
                        label="Nomor Kartu / Asuransi"
                        htmlFor="card_number"
                        error={errors.card_number}
                        hint="Nomor kartu peserta BPJS atau polis asuransi."
                    >
                        <Input
                            id="card_number"
                            value={data.card_number}
                            onChange={(e) =>
                                setData('card_number', e.target.value)
                            }
                            placeholder="Contoh: 0001234567890"
                        />
                    </FormField>

                    <FormField
                        label="Nomor Rujukan / SEP (Opsional)"
                        htmlFor="claim_number"
                        error={errors.claim_number}
                        hint="Nomor surat eligibilitas peserta atau nomor rujukan faskes."
                    >
                        <Input
                            id="claim_number"
                            value={data.claim_number}
                            onChange={(e) =>
                                setData('claim_number', e.target.value)
                            }
                            placeholder="Contoh: 0301R001..."
                        />
                    </FormField>
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
                    rows={3}
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Keterangan tambahan kunjungan atau keluhan pasien saat pendaftaran..."
                />
            </FormField>

            <div className="flex items-center gap-2 pt-2">
                <Button
                    type="submit"
                    disabled={processing || !data.patient_id || !data.unit_id}
                >
                    <Calendar className="mr-1.5 size-4" />
                    {processing ? 'Mendaftarkan...' : 'Daftarkan Kunjungan'}
                </Button>
                <Button asChild variant="outline">
                    <Link href={route('registration.visits.index')}>Batal</Link>
                </Button>
            </div>
        </form>
    );
}
