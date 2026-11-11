import { Head, Link } from '@inertiajs/react';
import { Key, ShieldAlert, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { PaginatedData, Role, Unit, User } from '../../types/rbac';
import { getUserColumns } from './components/user-columns';
import { UserFilters } from './components/user-filters';
import { UserFormDialog } from './components/user-form-dialog';
import { UserStatistics } from './components/user-statistics';

type Props = {
    users: PaginatedData<User>;
    filters: {
        search: string;
        role: string;
    };
    statistics: {
        total_users: number;
        total_roles: number;
        total_units: number;
        total_super_admins: number;
    };
    availableRoles: Role[];
    availableUnits: Unit[];
};

export default function UserListIndex({
    users,
    filters,
    statistics,
    availableRoles,
    availableUnits,
}: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    function handleCreate() {
        setSelectedUser(null);
        setFormOpen(true);
    }

    function handleEdit(user: User) {
        setSelectedUser(user);
        setFormOpen(true);
    }

    const columns = useMemo(() => getUserColumns({ onEdit: handleEdit }), []);

    return (
        <div className="space-y-4">
            <Head title="Manajemen Pengguna & Staf — SIMRS" />

            <UserStatistics statistics={statistics} />

            <DataTable<User>
                columns={columns}
                rows={users.data}
                rowKey={(u) => u.id}
                empty="Tidak ada pengguna yang sesuai dengan kriteria."
                toolbar={
                    <UserFilters
                        filters={filters}
                        availableRoles={availableRoles}
                        current={users.data.length}
                        total={users.total}
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-medium"
                                    asChild
                                >
                                    <Link href={route('rbac.roles.index')}>
                                        <Key className="size-3.5" />
                                        Matriks Role
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
                                    onClick={handleCreate}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <UserPlus className="size-3.5" />
                                    Tambah Pengguna
                                </Button>
                            </div>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={users.links}
                        from={users.from}
                        to={users.to}
                        total={users.total}
                    />
                }
            />

            <UserFormDialog
                user={selectedUser}
                open={formOpen}
                onOpenChange={setFormOpen}
                availableRoles={availableRoles}
                availableUnits={availableUnits}
            />
        </div>
    );
}
