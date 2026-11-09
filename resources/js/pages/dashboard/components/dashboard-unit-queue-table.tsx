import { useMemo } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { Badge } from '@/shared/ui/badge';

import type { UnitQueueSummary } from '../types/dashboard';

interface Props {
    items: UnitQueueSummary[];
}

export function DashboardUnitQueueTable({ items }: Props) {
    const columns: DataTableColumn<UnitQueueSummary>[] = useMemo(
        () => [
            {
                key: 'unit',
                header: 'Unit / Poliklinik',
                className: 'font-medium',
                render: (item) => (
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">
                            {item.unit_name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                            {item.unit_code}
                        </Badge>
                    </div>
                ),
            },
            {
                key: 'doctor',
                header: 'Dokter Bertugas',
                className: 'text-muted-foreground',
                render: (item) => item.doctor_name,
            },
            {
                key: 'waiting',
                header: 'Menunggu',
                className: 'text-center',
                render: (item) =>
                    item.waiting > 0 ? (
                        <Badge
                            variant="secondary"
                            className="font-mono text-xs font-semibold"
                        >
                            {item.waiting}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    ),
            },
            {
                key: 'serving',
                header: 'Dilayani',
                className: 'text-center',
                render: (item) =>
                    item.serving > 0 ? (
                        <Badge variant="default" className="font-mono text-xs">
                            {item.serving}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    ),
            },
            {
                key: 'completed',
                header: 'Selesai',
                className: 'text-center font-mono text-muted-foreground',
                render: (item) => item.completed,
            },
            {
                key: 'total',
                header: 'Total Kunjungan',
                className: 'text-right font-mono font-semibold text-foreground',
                render: (item) => item.total,
            },
        ],
        [],
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">
                        Monitoring Antrean & Beban Kerja Poli
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Status antrean pasien rawat jalan dan instalasi gawat
                        darurat hari ini.
                    </p>
                </div>
                <Badge variant="outline" className="text-xs">
                    {items.length} Poli Aktif
                </Badge>
            </div>

            <DataTable<UnitQueueSummary>
                columns={columns}
                rows={items}
                rowKey={(item) => item.id}
                empty="Belum ada aktivitas antrean poli tercatat hari ini."
            />
        </div>
    );
}
