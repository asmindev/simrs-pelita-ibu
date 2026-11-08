import { Head, Link } from '@inertiajs/react';
import { Hospital, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { Bed, PaginatedData } from '../../types/inpatient';
import { getBedColumns } from './components/bed-columns';
import { BedFilters } from './components/bed-filters';
import { BedStatistics } from './components/bed-statistics';
import { NewBedDialog } from './components/new-bed-dialog';

type Props = {
    beds: PaginatedData<Bed>;
    filters: {
        search: string;
        status: string;
        class: string;
    };
    statistics: {
        total_beds: number;
        available_beds: number;
        occupied_beds: number;
        maintenance_beds: number;
    };
};

export default function BedIndexPage({ beds, filters, statistics }: Props) {
    const [newBedOpen, setNewBedOpen] = useState(false);
    const columns = useMemo(() => getBedColumns(), []);

    return (
        <div className="space-y-6">
            <Head title="Manajemen Bed & Kamar — SIMRS" />

            <PageHeader
                title="Manajemen Bed & Kamar"
                description="Kelola ketersediaan tempat tidur, status kamar, dan pantau pasien rawat inap."
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('inpatient.admissions.index')}>
                                <Hospital className="mr-1.5 size-4" />
                                Daftar Pasien Rawat Inap
                            </Link>
                        </Button>
                        <Button size="sm" onClick={() => setNewBedOpen(true)}>
                            <Plus className="mr-1.5 size-4" />
                            Tambah Bed
                        </Button>
                    </div>
                }
            />

            <BedStatistics statistics={statistics} />

            <DataTable<Bed>
                columns={columns}
                rows={beds.data}
                rowKey={(bed) => bed.id}
                empty="Belum ada data tempat tidur yang terdaftar."
                toolbar={
                    <BedFilters
                        filters={filters}
                        current={beds.data.length}
                        total={beds.total}
                    />
                }
                footer={
                    <Pagination
                        links={beds.links}
                        from={beds.from}
                        to={beds.to}
                        total={beds.total}
                    />
                }
            />

            <NewBedDialog open={newBedOpen} onOpenChange={setNewBedOpen} />
        </div>
    );
}
