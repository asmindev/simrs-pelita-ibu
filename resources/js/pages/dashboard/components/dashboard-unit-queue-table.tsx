import { Building2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

import type { UnitQueueSummary } from '../types/dashboard';

interface Props {
    items: UnitQueueSummary[];
}

export function DashboardUnitQueueTable({ items }: Props) {
    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter(
            (item) =>
                item.unit_name.toLowerCase().includes(q) ||
                item.unit_code.toLowerCase().includes(q) ||
                item.doctor_name.toLowerCase().includes(q),
        );
    }, [items, search]);

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
        <DataTable<UnitQueueSummary>
            columns={columns}
            rows={filteredItems}
            rowKey={(item) => item.id}
            empty="Belum ada aktivitas antrean poli tercatat hari ini."
            toolbar={
                <TableToolbar
                    title="Monitoring Antrean & Beban Kerja Poli"
                    description="Status antrean pasien rawat jalan dan instalasi gawat darurat hari ini."
                    icon={Building2}
                    current={filteredItems.length}
                    total={items.length}
                >
                    <div className="relative min-w-44 sm:w-60">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari poli atau dokter..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 bg-background pl-8 text-xs"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
