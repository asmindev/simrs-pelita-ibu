import { Head, Link } from '@inertiajs/react';
import { Boxes } from 'lucide-react';
import { useMemo } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { PaginatedData, Prescription } from '../../types/pharmacy';
import { getPrescriptionColumns } from './components/prescription-columns';
import { PrescriptionFilters } from './components/prescription-filters';
import { PrescriptionStatistics } from './components/prescription-statistics';

type Props = {
    prescriptions: PaginatedData<Prescription>;
    units: Array<{ id: number; name: string; code: string }>;
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
    filters,
    statistics,
}: Props) {
    const columns = useMemo(() => getPrescriptionColumns(), []);

    return (
        <div className="space-y-6">
            <Head title="Pelayanan Resep Farmasi" />

            <PageHeader
                title="Pelayanan Resep Farmasi"
                description="Verifikasi resep dokter, pengalokasian batch obat FEFO, dan penyerahan obat kepada pasien."
                actions={
                    <Button asChild variant="outline">
                        <Link href={route('pharmacy.stock.index')}>
                            <Boxes className="mr-1.5 size-4" />
                            Stok & Batch Obat
                        </Link>
                    </Button>
                }
            />

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
        </div>
    );
}
