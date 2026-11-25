import { Edit2, MoreHorizontal, PowerOff, Star } from 'lucide-react';

import { Can } from '@/shared/components/can';
import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { USAGE_LABELS, type WarehouseLocation } from '../../types/warehouse';

export function createWarehouseColumns(options: {
    onEdit: (warehouse: WarehouseLocation) => void;
    onDeactivate: (warehouse: WarehouseLocation) => void;
}): DataTableColumn<WarehouseLocation>[] {
    return [
        {
            key: 'code',
            header: 'Kode Lokasi',
            render: (warehouse) => (
                <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {warehouse.code}
                    </span>
                    {warehouse.is_default_warehouse && (
                        <Badge
                            variant="default"
                            className="gap-1 px-1.5 py-0 text-[10px]"
                        >
                            <Star className="size-2.5 fill-current" />
                            Default
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'name',
            header: 'Nama Gudang / Lokasi',
            render: (warehouse) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">
                        {warehouse.name}
                    </div>
                    {warehouse.description && (
                        <div className="max-w-md truncate text-[11px] text-muted-foreground">
                            {warehouse.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'usage',
            header: 'Tipe',
            render: (warehouse) => (
                <Badge
                    variant={
                        warehouse.usage === 'internal' ? 'secondary' : 'outline'
                    }
                    className="text-[11px]"
                >
                    {USAGE_LABELS[warehouse.usage] ?? warehouse.usage}
                </Badge>
            ),
        },
        {
            key: 'stock',
            header: 'Stok On-Hand',
            className: 'text-right',
            render: (warehouse) => (
                <div className="space-y-0.5">
                    <div className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {Number(warehouse.total_stock ?? 0).toLocaleString(
                            'id-ID',
                        )}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                        {warehouse.active_items_count ?? 0} batch aktif
                    </div>
                </div>
            ),
        },
        {
            key: 'valuation',
            header: 'Nilai Persediaan',
            className: 'text-right',
            render: (warehouse) => (
                <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                    {formatCurrency(warehouse.total_valuation ?? 0)}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (warehouse) => (
                <Badge
                    variant={warehouse.is_active ? 'default' : 'outline'}
                    className="text-[10px]"
                >
                    {warehouse.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (warehouse) => (
                <Can permission="pharmacy.stock.adjust">
                    <div
                        className="flex justify-end"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="size-8 p-0"
                                >
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">
                                        Buka menu aksi
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                    onClick={() => options.onEdit(warehouse)}
                                >
                                    <Edit2 className="mr-2 size-3.5" />
                                    Edit Gudang
                                </DropdownMenuItem>
                                {warehouse.is_active &&
                                    !warehouse.is_default_warehouse && (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                options.onDeactivate(warehouse)
                                            }
                                        >
                                            <PowerOff className="mr-2 size-3.5" />
                                            Nonaktifkan
                                        </DropdownMenuItem>
                                    )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </Can>
            ),
        },
    ];
}
