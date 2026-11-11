import { Head, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useMemo } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { PaginatedData, PatientAccessLog } from '../../types/audit';
import { getPatientAccessColumns } from './components/patient-access-columns';
import { PatientAccessFilters } from './components/patient-access-filters';

type Props = {
    logs: PaginatedData<PatientAccessLog>;
    filters: {
        search: string;
        action: string;
        date: string;
    };
    statistics: {
        total_logs: number;
        total_today: number;
    };
};

export default function PatientAccessLogListIndex({
    logs,
    filters,
    statistics: _statistics,
}: Props) {
    const columns = useMemo(() => getPatientAccessColumns(), []);

    return (
        <div className="space-y-4">
            <Head title="Log Akses Pasien — SIMRS" />

            <DataTable<PatientAccessLog>
                columns={columns}
                rows={logs.data}
                rowKey={(l) => l.id}
                empty="Tidak ada catatan akses pasien yang sesuai kriteria pencarian."
                toolbar={
                    <PatientAccessFilters
                        filters={filters}
                        current={logs.data.length}
                        total={logs.total}
                        actions={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                                asChild
                            >
                                <Link href={route('audit.logs.index')}>
                                    <FileText className="size-3.5" />
                                    Log Aktivitas Sistem
                                </Link>
                            </Button>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={logs.links}
                        from={logs.from}
                        to={logs.to}
                        total={logs.total}
                    />
                }
            />
        </div>
    );
}
