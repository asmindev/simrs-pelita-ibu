import { formatDate, formatDateTime } from '@/shared/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { Encounter } from '../../../types/registration';

type Props = {
    encounter: Encounter;
};

type KeyValueRow = {
    label: string;
    value: string;
    mono?: boolean;
};

function DetailList({ rows }: { rows: KeyValueRow[] }) {
    return (
        <dl className="divide-y divide-border/60 text-xs">
            {rows.map((row) => (
                <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
                >
                    <dt className="shrink-0 text-muted-foreground">
                        {row.label}
                    </dt>
                    <dd
                        className={
                            row.mono
                                ? 'text-right font-mono font-medium text-foreground tabular-nums'
                                : 'text-right font-medium text-foreground'
                        }
                    >
                        {row.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function VisitOverviewTab({ encounter }: Props) {
    const patient = encounter.patient;
    const queue = encounter.queue;

    const patientRows: KeyValueRow[] = [
        { label: 'Nama Lengkap', value: patient?.name ?? '-' },
        {
            label: 'No. Rekam Medis',
            value: patient?.medical_record_number ?? '-',
            mono: true,
        },
        { label: 'NIK', value: patient?.nik ?? '-', mono: true },
        {
            label: 'Tanggal Lahir',
            value: patient?.birth_date ? formatDate(patient.birth_date) : '-',
        },
        { label: 'No. Telepon', value: patient?.phone ?? '-', mono: true },
        { label: 'Alamat', value: patient?.address ?? '-' },
        { label: 'Penjamin', value: encounter.guarantor?.name ?? 'Umum' },
    ];

    if (encounter.insurance_coverage?.card_number) {
        patientRows.push({
            label: 'No. Kartu Peserta',
            value: encounter.insurance_coverage.card_number,
            mono: true,
        });
    }

    if (encounter.insurance_coverage?.claim_number) {
        patientRows.push({
            label: 'No. Rujukan / SEP',
            value: encounter.insurance_coverage.claim_number,
            mono: true,
        });
    }

    const adminRows: KeyValueRow[] = [
        {
            label: 'No. Kunjungan',
            value: encounter.encounter_number,
            mono: true,
        },
        {
            label: 'Jenis Kunjungan',
            value:
                encounter.type === 'emergency'
                    ? 'Gawat Darurat (IGD)'
                    : 'Rawat Jalan',
        },
        {
            label: 'Unit / Poliklinik',
            value: encounter.unit
                ? `${encounter.unit.name} (${encounter.unit.code})`
                : '-',
        },
        {
            label: 'Dokter Pemeriksa',
            value: encounter.doctor?.name ?? 'Dokter Jaga / Umum',
        },
        {
            label: 'Nomor Antrean',
            value: queue?.queue_code
                ? `${queue.queue_code} (#${queue.queue_number})`
                : '-',
            mono: true,
        },
        {
            label: 'Waktu Masuk',
            value: formatDateTime(encounter.arrived_at),
        },
        {
            label: 'Mulai Layanan',
            value: encounter.consultation_started_at
                ? formatDateTime(encounter.consultation_started_at)
                : '-',
        },
        {
            label: 'Selesai Layanan',
            value: encounter.consultation_ended_at
                ? formatDateTime(encounter.consultation_ended_at)
                : '-',
        },
        {
            label: 'Didaftarkan Oleh',
            value: encounter.created_by?.name ?? '-',
        },
    ];

    if (queue?.called_by) {
        adminRows.push({
            label: 'Dipanggil Oleh',
            value: queue.called_by.name,
        });
    }

    return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className="gap-0 border-border bg-card py-0 shadow-xs">
                <CardHeader className="border-b border-border px-3.5 py-2.5 [.border-b]:pb-2.5">
                    <CardTitle className="text-xs font-semibold tracking-wide text-foreground uppercase">
                        Identitas Pasien & Kepesertaan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3.5">
                    <DetailList rows={patientRows} />
                </CardContent>
            </Card>

            <div className="space-y-3">
                <Card className="gap-0 border-border bg-card py-0 shadow-xs">
                    <CardHeader className="border-b border-border px-3.5 py-2.5 [.border-b]:pb-2.5">
                        <CardTitle className="text-xs font-semibold tracking-wide text-foreground uppercase">
                            Administrasi Kunjungan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3.5">
                        <DetailList rows={adminRows} />
                    </CardContent>
                </Card>

                {encounter.notes && (
                    <Card className="gap-0 border-border bg-card py-0 shadow-xs">
                        <CardHeader className="border-b border-border px-3.5 py-2.5 [.border-b]:pb-2.5">
                            <CardTitle className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                Catatan Awal Pendaftaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 text-xs leading-relaxed text-foreground">
                            {encounter.notes}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
