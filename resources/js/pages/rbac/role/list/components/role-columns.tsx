import { ShieldCheck, Users } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

import type { Role } from '../../../types/rbac';

type ColumnOptions = {
    onConfigurePermissions: (role: Role) => void;
};

export function getRoleColumns({
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
            className: 'w-36 text-right',
            render: (role) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onConfigurePermissions(role)}
                >
                    <ShieldCheck className="mr-1.5 size-3.5 text-primary" />
                    Atur Izin
                </Button>
            ),
        },
    ];
}
