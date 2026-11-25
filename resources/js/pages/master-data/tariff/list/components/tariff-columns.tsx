import { Link } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { type Tariff, tariffCategoryLabels } from '../../types/tariff';

type CreateTariffColumnsOptions = {
    canManage: boolean;
    onDeactivate: (tariff: Tariff) => void;
};

export function createTariffColumns({
    canManage,
    onDeactivate,
}: CreateTariffColumnsOptions): DataTableColumn<Tariff>[] {
    return [
        {
            key: 'code',
            header: 'Kode',
            className: 'py-1',
            render: (tariff) => (
                <span className="font-mono text-xs font-semibold text-foreground">
                    {tariff.code}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Layanan / Tindakan',
            className: 'py-1',
            render: (tariff) => (
                <Link
                    href={route('master-data.tariffs.edit', tariff.id)}
                    className="text-xs font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                    {tariff.name}
                </Link>
            ),
        },
        {
            key: 'category',
            header: 'Kategori',
            className: 'py-1',
            render: (tariff) => (
                <Badge variant="outline" className="text-[10px]">
                    {tariffCategoryLabels[tariff.category] ?? tariff.category}
                </Badge>
            ),
        },
        {
            key: 'unit',
            header: 'Unit Terkait',
            className: 'py-1',
            render: (tariff) => (
                <span className="text-xs text-muted-foreground">
                    {tariff.unit?.name ?? 'Semua Unit'}
                </span>
            ),
        },
        {
            key: 'price',
            header: 'Nominal Tarif',
            className: 'py-1',
            render: (tariff) => (
                <span className="font-mono text-xs font-medium tabular-nums">
                    {formatCurrency(tariff.price)}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'py-1',
            render: (tariff) => (
                <Badge
                    variant={tariff.is_active ? 'default' : 'outline'}
                    className="text-[10px]"
                >
                    {tariff.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'action',
            header: '',
            className: 'w-12 py-1 text-right',
            render: (tariff) => {
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
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route(
                                            'master-data.tariffs.edit',
                                            tariff.id,
                                        )}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onDeactivate(tariff)}
                                >
                                    <Trash2 className="mr-2 size-3.5" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}
