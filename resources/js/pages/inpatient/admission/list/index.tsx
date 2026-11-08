import { Head, Link } from '@inertiajs/react';
import { BedDouble, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type {
    Admission,
    AdmissionEncounter,
    Bed,
    PaginatedData,
} from '../../types/inpatient';
import { getAdmissionColumns } from '../components/admission-columns';
import { AdmissionFilters } from '../components/admission-filters';
import { AdmissionStatistics } from '../components/admission-statistics';
import { NewAdmissionDialog } from '../components/new-admission-dialog';

type Props = {
    admissions: PaginatedData<Admission>;
    availableBeds: Bed[];
    activeEncounters: AdmissionEncounter[];
    filters: {
        search: string;
        status: string;
    };
    statistics: {
        active_patients: number;
        discharged_today: number;
        available_beds: number;
        bed_occupancy_rate: number;
    };
};

export default function AdmissionIndexPage({
    admissions,
    availableBeds,
    activeEncounters,
    filters,
    statistics,
}: Props) {
    const [newAdmissionOpen, setNewAdmissionOpen] = useState(false);
    const columns = useMemo(() => getAdmissionColumns(), []);

    return (
        <div className="space-y-6">
            <Head title="Rawat Inap Pasien — SIMRS" />

            <PageHeader
                title="Rawat Inap Pasien (Inpatient)"
                description="Kelola admisi, perpindahan bed, dan pemulangan pasien rawat inap."
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('inpatient.beds.index')}>
                                <BedDouble className="mr-1.5 size-4" />
                                Katalog Bed
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setNewAdmissionOpen(true)}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Admisi Pasien Baru
                        </Button>
                    </div>
                }
            />

            <AdmissionStatistics statistics={statistics} />

            <DataTable<Admission>
                columns={columns}
                rows={admissions.data}
                rowKey={(adm) => adm.id}
                empty="Belum ada catatan admisi rawat inap."
                toolbar={
                    <AdmissionFilters
                        filters={filters}
                        current={admissions.data.length}
                        total={admissions.total}
                    />
                }
                footer={
                    <Pagination
                        links={admissions.links}
                        from={admissions.from}
                        to={admissions.to}
                        total={admissions.total}
                    />
                }
            />

            <NewAdmissionDialog
                open={newAdmissionOpen}
                onOpenChange={setNewAdmissionOpen}
                availableBeds={availableBeds}
                activeEncounters={activeEncounters}
            />
        </div>
    );
}
