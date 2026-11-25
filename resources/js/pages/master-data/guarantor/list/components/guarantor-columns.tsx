import { Link } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { type Guarantor, guarantorTypeLabels } from '../../types/guarantor';

type CreateGuarantorColumnsOptions = {
    canManage: boolean;
    onDeactivate: (guarantor: Guarantor) => void;
};

export function createGuarantorColumns({
    canManage,
    onDeactivate,
}: CreateGuarantorColumnsOptions): DataTableColumn<Guarantor>[] {
    return [
        {
            key: 'code',
            header: 'Kode',
            className: 'py-1',
            render: (guarantor) => (
                <span className="font-mono text-xs font-semibold text-foreground">
                    {guarantor.code}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Penjamin',
            className: 'py-1',
            render: (guarantor) => (
                <Link
                    href={route('master-data.guarantors.edit', guarantor.id)}
                    className="text-xs font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                    {guarantor.name}
                </Link>
            ),
        },
        {
            key: 'type',
            header: 'Tipe',
            className: 'py-1',
            render: (guarantor) => (
                <Badge variant="outline" className="text-[10px]">
                    {guarantorTypeLabels[guarantor.type] ?? guarantor.type}
                </Badge>
            ),
        },
        {
            key: 'description',
            header: 'Keterangan',
            className: 'py-1',
            render: (guarantor) => (
                <span className="line-clamp-1 text-xs text-muted-foreground">
                    {guarantor.description || '-'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'py-1',
            render: (guarantor) => (
                <Badge
                    variant={guarantor.is_active ? 'default' : 'outline'}
                    className="text-[10px]"
                >
                    {guarantor.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'action',
            header: '',
            className: 'w-12 py-1 text-right',
            render: (guarantor) => {
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
                                            'master-data.guarantors.edit',
                                            guarantor.id,
                                        )}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onDeactivate(guarantor)}
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
