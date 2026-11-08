import { router } from '@inertiajs/react';
import { Edit2, Trash2 } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

import type { User } from '../../../types/rbac';
import { UserRoleBadge } from './user-status-badge';

type ColumnOptions = {
    onEdit: (user: User) => void;
};

export function getUserColumns({
    onEdit,
}: ColumnOptions): DataTableColumn<User>[] {
    return [
        {
            key: 'user_info',
            header: 'Nama & Email',
            render: (user) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">
                        {user.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {user.email}
                    </div>
                </div>
            ),
        },
        {
            key: 'roles',
            header: 'Peran (Roles)',
            render: (user) => {
                const roles = user.roles || [];
                if (roles.length === 0) {
                    return (
                        <span className="text-xs text-muted-foreground italic">
                            Tanpa Role
                        </span>
                    );
                }
                return (
                    <div className="flex max-w-xs flex-wrap gap-1">
                        {roles.map((r) => (
                            <UserRoleBadge key={r.id} role={r.name} />
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'units',
            header: 'Unit Terdaftar',
            render: (user) => {
                const units = user.units || [];
                if (units.length === 0) {
                    return (
                        <span className="text-xs text-muted-foreground italic">
                            Semua Unit / Global
                        </span>
                    );
                }
                return (
                    <div className="flex max-w-xs flex-wrap gap-1">
                        {units.map((u) => (
                            <Badge
                                key={u.id}
                                variant="outline"
                                className="text-[11px]"
                            >
                                {u.code}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            header: 'Terdaftar',
            render: (user) => (
                <span className="text-xs text-muted-foreground">
                    {formatDate(user.created_at)}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-24 text-right',
            render: (user) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="size-7 p-0"
                        onClick={() => onEdit(user)}
                        title="Edit User"
                    >
                        <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="size-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                            if (
                                confirm(
                                    `Hapus user ${user.name}? Tindakan ini tidak dapat dibatalkan.`,
                                )
                            ) {
                                router.delete(
                                    route('rbac.users.destroy', user.id),
                                );
                            }
                        }}
                        title="Hapus User"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
        },
    ];
}
