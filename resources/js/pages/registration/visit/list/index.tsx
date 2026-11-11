import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type {
    Encounter,
    EncounterFilters,
    PaginatedEncounters,
} from '../../types/registration';
import { getEncounterColumns } from './components/encounter-columns';
import { EncounterFiltersComponent } from './components/encounter-filters';

type Props = {
    encounters: PaginatedEncounters;
    units: Array<{ id: number; name: string; code: string }>;
    filters: EncounterFilters;
};

export default function EncounterList({ encounters, units, filters }: Props) {
    const columns = useMemo(() => getEncounterColumns(), []);

    return (
        <div className="space-y-4">
            <Head title="Daftar Kunjungan Pasien — SIMRS" />

            <DataTable<Encounter>
                columns={columns}
                rows={encounters.data}
                rowKey={(e) => e.id}
                empty="Tidak ada data kunjungan yang cocok dengan filter."
                toolbar={
                    <EncounterFiltersComponent
                        filters={filters}
                        units={units}
                        current={encounters.data.length}
                        total={encounters.total}
                        actions={
                            <Can permission="registration.visit.create">
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Link
                                        href={route(
                                            'registration.visits.create',
                                        )}
                                    >
                                        <Plus className="size-3.5" />
                                        Daftarkan Pasien
                                    </Link>
                                </Button>
                            </Can>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={encounters.links}
                        from={encounters.from}
                        to={encounters.to}
                        total={encounters.total}
                    />
                }
            />
        </div>
    );
}
