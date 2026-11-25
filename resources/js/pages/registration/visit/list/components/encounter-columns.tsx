import type { DataTableColumn } from '@/shared/components/data-table';

import type { Encounter } from '../../../types/registration';
import { EncounterStatusBadge } from './encounter-status-badge';

export function getEncounterColumns(): DataTableColumn<Encounter>[] {
    return [
        {
            key: 'queue',
            header: 'Antrean',
            className: 'w-24 py-1.5',
            render: (encounter) => (
                <span className="font-mono text-xs font-bold text-primary tabular-nums">
                    {encounter.queue?.queue_code ?? '-'}
                </span>
            ),
        },
        {
            key: 'encounter_number',
            header: 'No. Kunjungan',
            className: 'py-1.5',
            render: (encounter) => (
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {encounter.encounter_number}
                </span>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            className: 'py-1.5',
            render: (encounter) => (
                <span className="text-xs font-medium text-foreground">
                    {encounter.patient?.name}
                </span>
            ),
        },
        {
            key: 'unit',
            header: 'Unit / Poli',
            className: 'py-1.5',
            render: (encounter) => (
                <span className="text-xs font-medium">
                    {encounter.unit?.name}
                </span>
            ),
        },
        {
            key: 'doctor',
            header: 'Dokter',
            className: 'py-1.5',
            render: (encounter) => (
                <span className="text-xs">
                    {encounter.doctor?.name ?? 'Dokter Jaga / Umum'}
                </span>
            ),
        },
        {
            key: 'guarantor',
            header: 'Penjamin',
            className: 'py-1.5',
            render: (encounter) => (
                <span className="text-xs">{encounter.guarantor?.name}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'py-1.5',
            render: (encounter) => (
                <EncounterStatusBadge status={encounter.status} />
            ),
        },
    ];
}
