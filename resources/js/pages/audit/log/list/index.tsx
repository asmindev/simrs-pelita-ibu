import { Head, Link } from '@inertiajs/react';
import { UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { ActivityLog, PaginatedData } from '../../types/audit';
import { getLogColumns } from './components/log-columns';
import { LogDetailDialog } from './components/log-detail-dialog';
import { LogFilters } from './components/log-filters';

type Props = {
    logs: PaginatedData<ActivityLog>;
    filters: {
        search: string;
        log_name: string;
        date: string;
    };
    statistics: {
        total_logs: number;
        total_today: number;
    };
    availableLogNames: string[];
};

export default function ActivityLogListIndex({
    logs,
    filters,
    statistics,
    availableLogNames,
}: Props) {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    function handleViewDetail(log: ActivityLog) {
        setSelectedLog(log);
        setDetailOpen(true);
    }

    const columns = useMemo(
        () => getLogColumns({ onViewDetail: handleViewDetail }),
        [],
    );

    return (
        <div className="space-y-6">
            <Head title="Audit Trail Log — SIMRS" />

            <PageHeader
                title="Audit Trail Log Aktivitas"
                description={`Tercatat ${statistics.total_logs} rekaman aktivitas sistem (${statistics.total_today} aktivitas tercatat hari ini).`}
                actions={
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('audit.patient-access.index')}>
                            <UserCheck className="mr-1.5 size-4" />
                            Log Akses Pasien
                        </Link>
                    </Button>
                }
            />

            <DataTable<ActivityLog>
                columns={columns}
                rows={logs.data}
                rowKey={(l) => l.id}
                empty="Tidak ada log aktivitas yang cocok dengan kriteria pencarian."
                toolbar={
                    <LogFilters
                        filters={filters}
                        availableLogNames={availableLogNames}
                        current={logs.data.length}
                        total={logs.total}
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

            <LogDetailDialog
                log={selectedLog}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
