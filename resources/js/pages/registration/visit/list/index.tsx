import { Head, Link } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';

import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

import type {
    Encounter,
    EncounterFilters,
    EncounterStatus,
    PaginatedEncounters,
} from '../../types/registration';
import { EncounterFiltersComponent } from '../components/encounter-filters';

type Props = {
    encounters: PaginatedEncounters;
    units: Array<{ id: number; name: string; code: string }>;
    filters: EncounterFilters;
};

function getStatusBadge(status: EncounterStatus) {
    switch (status) {
        case 'arrived':
            return (
                <Badge variant="secondary" className="text-xs">
                    Menunggu
                </Badge>
            );
        case 'in_consultation':
            return (
                <Badge variant="default" className="text-xs">
                    Sedang Dilayani
                </Badge>
            );
        case 'finished':
            return (
                <Badge variant="outline" className="text-xs">
                    Selesai
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="border-destructive text-xs text-destructive"
                >
                    Dibatalkan
                </Badge>
            );
    }
}

export default function EncounterList({ encounters, units, filters }: Props) {
    const columns: DataTableColumn<Encounter>[] = [
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
            render: (encounter) => getStatusBadge(encounter.status),
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

    return (
        <>
            <Head title="Daftar Kunjungan Pasien" />

            <PageHeader
                title="Daftar Kunjungan"
                description="Riwayat pendaftaran kunjungan pasien dan status antrean poli."
                actions={
                    <Can permission="registration.visit.create">
                        <Button asChild>
                            <Link href={route('registration.visits.create')}>
                                <Plus className="mr-1.5 size-4" />
                                Daftar Pasien
                            </Link>
                        </Button>
                    </Can>
                }
            />

            <DataTable
                columns={columns}
                rows={encounters.data}
                rowKey={(encounter) => encounter.id}
                empty="Belum ada pendaftaran pasien yang sesuai dengan filter pencarian."
                toolbar={
                    <EncounterFiltersComponent
                        filters={filters}
                        units={units}
                        current={encounters.data.length}
                        total={encounters.total}
                    />
                }
                footer={
                    <Pagination
                        links={encounters.links}
                        from={encounters.from ?? 0}
                        to={encounters.to ?? 0}
                        total={encounters.total}
                    />
                }
            />
        </>
    );
}
