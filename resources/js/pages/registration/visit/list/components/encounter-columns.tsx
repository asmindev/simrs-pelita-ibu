import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { Encounter } from '../../../types/registration';
import { EncounterStatusBadge } from './encounter-status-badge';

export function getEncounterColumns(): DataTableColumn<Encounter>[] {
    return [
        {
            key: 'queue',
            header: 'Antrean',
            className: 'w-24',
            render: (encounter) => (
                <span className="font-mono text-sm font-bold text-primary tabular-nums">
                    {encounter.queue?.queue_code ?? '-'}
                </span>
            ),
        },
        {
            key: 'encounter_number',
            header: 'No. Kunjungan',
            render: (encounter) => (
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {encounter.encounter_number}
                </span>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (encounter) => (
                <div className="space-y-0.5">
                    <div className="font-medium text-foreground">
                        {encounter.patient?.name}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground tabular-nums">
                        {encounter.patient?.medical_record_number}
                    </div>
                </div>
            ),
        },
        {
            key: 'unit',
            header: 'Unit / Poli',
            render: (encounter) => (
                <div className="text-sm font-medium">
                    {encounter.unit?.name}
                </div>
            ),
        },
        {
            key: 'doctor',
            header: 'Dokter',
            render: (encounter) => (
                <span className="text-sm">
                    {encounter.doctor?.name ?? 'Dokter Jaga / Umum'}
                </span>
            ),
        },
        {
            key: 'guarantor',
            header: 'Penjamin',
            render: (encounter) => (
                <span className="text-sm">{encounter.guarantor?.name}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (encounter) => (
                <EncounterStatusBadge status={encounter.status} />
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-20 text-right',
            render: (encounter) => (
                <Button asChild size="icon" variant="ghost">
                    <Link
                        href={route('registration.visits.show', encounter.id)}
                        aria-label="Detail Kunjungan"
                    >
                        <Eye className="size-4" />
                    </Link>
                </Button>
            ),
        },
    ];
}
