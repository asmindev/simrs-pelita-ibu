import { Head, Link } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';

import { Can } from '@/shared/components/can';
import { EmptyState } from '@/shared/components/empty-state';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

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
    return (
        <div className="space-y-4">
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

            <EncounterFiltersComponent
                filters={filters}
                units={units}
                current={encounters.data.length}
                total={encounters.total}
            />

            {encounters.data.length === 0 ? (
                <EmptyState
                    title="Tidak ada kunjungan"
                    description="Belum ada pendaftaran pasien yang sesuai dengan filter pencarian."
                />
            ) : (
                <div className="rounded-md border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Antrean</TableHead>
                                <TableHead>No. Kunjungan</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Unit / Poli</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead>Penjamin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-20 text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {encounters.data.map((encounter: Encounter) => (
                                <TableRow key={encounter.id}>
                                    <TableCell>
                                        <span className="font-mono text-sm font-bold text-primary tabular-nums">
                                            {encounter.queue?.queue_code ?? '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                            {encounter.encounter_number}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            <div className="font-medium text-foreground">
                                                {encounter.patient?.name}
                                            </div>
                                            <div className="font-mono text-xs text-muted-foreground tabular-nums">
                                                {
                                                    encounter.patient
                                                        ?.medical_record_number
                                                }
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">
                                            {encounter.unit?.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {encounter.doctor?.name ??
                                                'Dokter Jaga / Umum'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {encounter.guarantor?.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(encounter.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            asChild
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <Link
                                                href={route(
                                                    'registration.visits.show',
                                                    encounter.id,
                                                )}
                                                aria-label="Detail Kunjungan"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Pagination
                links={encounters.links}
                from={encounters.from ?? 0}
                to={encounters.to ?? 0}
                total={encounters.total}
            />
        </div>
    );
}
