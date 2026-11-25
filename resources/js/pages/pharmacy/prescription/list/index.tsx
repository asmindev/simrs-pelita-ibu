import { Head, Link } from '@inertiajs/react';
import { Boxes, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import type { PrescribableDrug } from '@/shared/components/prescription-items-editor';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { PaginatedData, Prescription } from '../../types/pharmacy';
import {
    type ActiveEncounterOption,
    CreatePrescriptionDialog,
} from './components/create-prescription-dialog';
import { getPrescriptionColumns } from './components/prescription-columns';
import { PrescriptionFilters } from './components/prescription-filters';
import { PrescriptionStatistics } from './components/prescription-statistics';

type Props = {
    prescriptions: PaginatedData<Prescription>;
    units: Array<{ id: number; name: string; code: string }>;
    drugs?: PrescribableDrug[];
    activeEncounters?: ActiveEncounterOption[];
    filters: {
        search: string;
        status: string;
        unit_id: number | null;
        date: string;
    };
    statistics: {
        total_today: number;
        submitted: number;
        verified: number;
        dispensed: number;
    };
};

export default function PrescriptionList({
    prescriptions,
    units,
    drugs = [],
    activeEncounters = [],
    filters,
    statistics,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const columns = useMemo(() => getPrescriptionColumns(), []);

    return (
        <div className="space-y-4">
            <Head title="Pelayanan Resep Farmasi — SIMRS" />

            <PrescriptionStatistics statistics={statistics} />

            <DataTable
                columns={columns}
                rows={prescriptions.data}
                rowKey={(rx) => rx.id}
                empty="Belum ada data resep yang sesuai dengan kriteria."
                toolbar={
                    <PrescriptionFilters
                        filters={filters}
                        units={units}
                        current={prescriptions.data.length}
                        total={prescriptions.total}
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <Can permission="pharmacy.prescription.create">
                                    <Button
                                        size="sm"
                                        onClick={() => setIsCreateOpen(true)}
                                        className="h-8 gap-1.5 text-xs font-medium"
                                    >
                                        <Plus className="size-3.5" />
                                        Buat E-Resep
                                    </Button>
                                </Can>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Link href={route('inventory.stock.index')}>
                                        <Boxes className="size-3.5" />
                                        Stok & Batch Obat
                                    </Link>
                                </Button>
                            </div>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={prescriptions.links}
                        from={prescriptions.from}
                        to={prescriptions.to}
                        total={prescriptions.total}
                    />
                }
            />

            <CreatePrescriptionDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                drugs={drugs}
                activeEncounters={activeEncounters}
            />
        </div>
    );
}
