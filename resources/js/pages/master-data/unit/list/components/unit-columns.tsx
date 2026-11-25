import { Edit2, MoreHorizontal, PowerOff } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { type Unit, unitTypeLabels } from '../../types/unit';

type CreateUnitColumnsOptions = {
    canManage: boolean;
    onEdit: (unit: Unit) => void;
    onDeactivate: (unit: Unit) => void;
};

export function createUnitColumns({
    canManage,
    onEdit,
    onDeactivate,
}: CreateUnitColumnsOptions): DataTableColumn<Unit>[] {
    return [
        {
            key: 'code',
            header: 'Kode',
            className: 'py-1',
            render: (unit) => (
                <span className="font-mono text-xs font-semibold text-foreground">
                    {unit.code}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Nama',
            className: 'py-1',
            render: (unit) => (
                <button
                    type="button"
                    onClick={() => onEdit(unit)}
                    className="cursor-pointer text-left text-xs font-semibold text-foreground transition-colors hover:text-primary"
                >
                    {unit.name}
                </button>
            ),
        },
        {
            key: 'type',
            header: 'Tipe',
            className: 'py-1',
            render: (unit) => (
                <Badge
                    variant="secondary"
                    className="font-mono text-[10px] uppercase"
                >
                    {unitTypeLabels[unit.type]}
                </Badge>
            ),
        },
        {
            key: 'description',
            header: 'Deskripsi',
            className: 'py-1',
            render: (unit) => (
                <span className="text-xs text-muted-foreground">
                    {unit.description ?? '-'}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            className: 'py-1',
            render: (unit) => (
                <Badge
                    variant={unit.is_active ? 'default' : 'outline'}
                    className="text-[10px]"
                >
                    {unit.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 py-1 text-right',
            render: (unit) => {
                if (!canManage) {
                    return null;
                }

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="size-7 p-0"
                                >
                                    <MoreHorizontal className="size-3.5" />
                                    <span className="sr-only">
                                        Buka menu aksi
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={() => onEdit(unit)}>
                                    <Edit2 className="mr-2 size-3.5" />
                                    Ubah
                                </DropdownMenuItem>
                                {unit.is_active && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => onDeactivate(unit)}
                                    >
                                        <PowerOff className="mr-2 size-3.5" />
                                        Nonaktifkan
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}
