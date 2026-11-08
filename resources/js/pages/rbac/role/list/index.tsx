import { Head, Link } from '@inertiajs/react';
import { Plus, ShieldAlert, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { GroupedPermission, Role } from '../../types/rbac';
import { NewRoleDialog } from './components/new-role-dialog';
import { getRoleColumns } from './components/role-columns';
import { RoleMatrixDialog } from './components/role-matrix-dialog';

type Props = {
    roles: Role[];
    groupedPermissions: GroupedPermission[];
};

export default function RoleListIndex({ roles, groupedPermissions }: Props) {
    const [matrixOpen, setMatrixOpen] = useState(false);
    const [newRoleOpen, setNewRoleOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    function handleConfigurePermissions(role: Role) {
        setSelectedRole(role);
        setMatrixOpen(true);
    }

    const columns = useMemo(
        () =>
            getRoleColumns({
                onConfigurePermissions: handleConfigurePermissions,
            }),
        [],
    );

    return (
        <div className="space-y-6">
            <Head title="Manajemen Peran & Hak Akses (RBAC) — SIMRS" />

            <PageHeader
                title="Peran & Hak Akses (RBAC)"
                description="Kelola daftar peran pengguna dan tentukan matriks izin (permissions) per modul layanan rumah sakit."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('rbac.users.index')}>
                                <Users className="mr-1.5 size-4" />
                                Daftar Pengguna
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('rbac.break-glass.index')}>
                                <ShieldAlert className="mr-1.5 size-4" />
                                Break-Glass
                            </Link>
                        </Button>
                        <Button size="sm" onClick={() => setNewRoleOpen(true)}>
                            <Plus className="mr-1.5 size-4" />
                            Tambah Role
                        </Button>
                    </div>
                }
            />

            <DataTable<Role>
                columns={columns}
                rows={roles}
                rowKey={(r) => r.id}
                empty="Belum ada peran pengguna yang terdaftar."
            />

            <RoleMatrixDialog
                role={selectedRole}
                open={matrixOpen}
                onOpenChange={setMatrixOpen}
                groupedPermissions={groupedPermissions}
            />

            <NewRoleDialog open={newRoleOpen} onOpenChange={setNewRoleOpen} />
        </div>
    );
}
