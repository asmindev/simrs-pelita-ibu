import { Edit2, MoreHorizontal, ShieldCheck, Users } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type { Role } from '../../../types/rbac';

type ColumnOptions = {
    onEdit: (role: Role) => void;
    onConfigurePermissions: (role: Role) => void;
};

export function getRoleColumns({
    onEdit,
    onConfigurePermissions,
}: ColumnOptions): DataTableColumn<Role>[] {
    return [
        {
            key: 'role_name',
            header: 'Nama Role',
            render: (role) => (
                <div className="space-y-0.5">
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {role.name}
                    </span>
                    {role.name === 'super-admin' && (
                        <div className="text-[11px] font-medium text-primary">
                            Akses Penuh Tanpa Batas
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'permissions_count',
            header: 'Hak Akses (Permissions)',
            render: (role) => {
                if (role.name === 'super-admin') {
                    return (
                        <Badge variant="default" className="text-xs">
                            Semua Izin (Bypass)
                        </Badge>
                    );
                }
                const count = role.permissions?.length ?? 0;
                return (
                    <Badge variant="secondary" className="text-xs">
                        {count} izin aktif
                    </Badge>
                );
            },
        },
        {
            key: 'users_count',
            header: 'Jumlah Pengguna',
            render: (role) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                        {role.users_count ?? 0}
                    </span>{' '}
                    pengguna
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (role) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Buka menu aksi</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {role.name !== 'super-admin' && (
                                <DropdownMenuItem onClick={() => onEdit(role)}>
                                    <Edit2 className="mr-2 size-3.5" />
                                    Edit Nama
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => onConfigurePermissions(role)}
                            >
                                <ShieldCheck className="mr-2 size-3.5" />
                                Atur Izin Akses
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];
}
