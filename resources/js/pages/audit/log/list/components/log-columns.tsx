import { Eye } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatDateTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

import type { ActivityLog } from '../../../types/audit';

type ColumnOptions = {
    onViewDetail: (log: ActivityLog) => void;
};

export function getLogColumns({
    onViewDetail,
}: ColumnOptions): DataTableColumn<ActivityLog>[] {
    return [
        {
            key: 'time',
            header: 'Waktu Aktivitas',
            className: 'w-40',
            render: (log) => (
                <div className="space-y-0.5">
                    <div className="font-mono text-xs text-foreground">
                        {formatDateTime(log.created_at)}
                    </div>
                    {log.log_name && (
                        <Badge variant="outline" className="text-[10px]">
                            {log.log_name}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'causer',
            header: 'Pelaku (User)',
            className: 'w-48',
            render: (log) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">
                        {log.causer?.name ?? 'Sistem'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {log.causer?.email ?? 'Otomatis'}
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Deskripsi Log',
            render: (log) => (
                <div className="text-xs font-medium text-foreground">
                    {log.description}
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-20 text-right',
            render: (log) => (
                <Button
                    size="sm"
                    variant="ghost"
                    className="size-7 p-0"
                    onClick={() => onViewDetail(log)}
                    title="Lihat Detail Snapshot"
                >
                    <Eye className="size-3.5" />
                </Button>
            ),
        },
    ];
}
