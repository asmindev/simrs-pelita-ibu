import type { DataTableColumn } from '@/shared/components/data-table';
import { formatDateTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';

import type { PatientAccessLog } from '../../../types/audit';

export function getPatientAccessColumns(): DataTableColumn<PatientAccessLog>[] {
    return [
        {
            key: 'time',
            header: 'Waktu Akses',
            className: 'w-40',
            render: (log) => (
                <div className="font-mono text-xs text-foreground">
                    {formatDateTime(log.accessed_at)}
                </div>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien Terbuka',
            render: (log) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">
                        {log.patient?.name ?? 'Data Pasien'}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                        RM: {log.patient?.medical_record_number ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'user',
            header: 'Pengakses',
            render: (log) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {log.user?.name ?? 'Sistem / Anonim'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {log.unit?.name
                            ? `Unit: ${log.unit.name}`
                            : log.user?.email}
                    </div>
                </div>
            ),
        },
        {
            key: 'action',
            header: 'Aksi',
            render: (log) => {
                if (log.action === 'break_glass') {
                    return (
                        <Badge variant="destructive" className="text-[11px]">
                            Break-Glass
                        </Badge>
                    );
                }
                if (log.action === 'export') {
                    return (
                        <Badge variant="outline" className="text-[11px]">
                            Ekspor Data
                        </Badge>
                    );
                }
                return (
                    <Badge variant="secondary" className="text-[11px]">
                        Melihat Data
                    </Badge>
                );
            },
        },
        {
            key: 'network',
            header: 'IP & Client',
            className: 'w-44',
            render: (log) => (
                <div className="space-y-0.5 font-mono text-[11px] text-muted-foreground">
                    <div>{log.ip_address ?? '-'}</div>
                    <div
                        className="line-clamp-1 truncate text-[10px]"
                        title={log.user_agent ?? ''}
                    >
                        {log.user_agent ?? ''}
                    </div>
                </div>
            ),
        },
    ];
}
