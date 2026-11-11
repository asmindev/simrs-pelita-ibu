import { Head, Link } from '@inertiajs/react';
import { Key, Plus, ShieldAlert, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { GroupedPermission, Role } from '../../types/rbac';
import { getRoleColumns } from './components/role-columns';
import { RoleFormDialog } from './components/role-form-dialog';
import { RoleMatrixDialog } from './components/role-matrix-dialog';

type Props = {
    roles: Role[];
    groupedPermissions: GroupedPermission[];
};

export default function RoleIndex({ roles, groupedPermissions }: Props) {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [matrixOpen, setMatrixOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);

    function handleOpenMatrix(role: Role) {
        setSelectedRole(role);
        setMatrixOpen(true);
    }

    function handleCreateRole() {
        setSelectedRole(null);
        setFormOpen(true);
    }

    function handleEditRole(role: Role) {
        setSelectedRole(role);
        setFormOpen(true);
    }

    const columns = useMemo<DataTableColumn<Role>[]>(
        () =>
            getRoleColumns({
                onConfigurePermissions: handleOpenMatrix,
                onEdit: handleEditRole,
            }),
        [],
    );

    return (
        <div className="space-y-4">
            <Head title="Manajemen Peran & Hak Akses (RBAC) — SIMRS" />

            <DataTable<Role>
                columns={columns}
                rows={roles}
                rowKey={(r) => r.id}
                empty="Belum ada peran pengguna yang terdaftar."
                toolbar={
                    <TableToolbar
                        title="Daftar Peran & Matriks Akses"
                        description="Kelola peran pengguna dan tentukan matriks izin (permissions) per modul."
                        icon={Key}
                        current={roles.length}
                        total={roles.length}
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-medium"
                                    asChild
                                >
                                    <Link href={route('rbac.users.index')}>
                                        <Users className="size-3.5" />
                                        Daftar Pengguna
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-medium"
                                    asChild
                                >
                                    <Link
                                        href={route('rbac.break-glass.index')}
                                    >
                                        <ShieldAlert className="size-3.5" />
                                        Break-Glass
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleCreateRole}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Role
                                </Button>
                            </div>
                        }
                    />
                }
            />

            <RoleMatrixDialog
                role={selectedRole}
                open={matrixOpen}
                onOpenChange={setMatrixOpen}
                groupedPermissions={groupedPermissions}
            />

            <RoleFormDialog
                role={selectedRole}
                open={formOpen}
                onOpenChange={setFormOpen}
            />
        </div>
    );
}
