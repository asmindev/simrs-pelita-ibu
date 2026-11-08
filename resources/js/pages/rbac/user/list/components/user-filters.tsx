import { router } from '@inertiajs/react';
import { Search, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { FilterPopover } from '@/shared/components/filter-popover';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import type { Role } from '../../../types/rbac';

type Props = {
    filters: {
        search: string;
        role: string;
    };
    availableRoles: Role[];
    current: number;
    total: number;
};

export function UserFilters({
    filters,
    availableRoles,
    current,
    total,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');

    const activeFilterCount = role !== 'all' && role !== '' ? 1 : 0;

    function executeFilter(nextParams?: { search?: string; role?: string }) {
        const queryParams: Record<string, string> = {};

        const s =
            nextParams && 'search' in nextParams ? nextParams.search : search;
        const r = nextParams && 'role' in nextParams ? nextParams.role : role;

        if (s) queryParams.search = s;
        if (r && r !== 'all') queryParams.role = r;

        router.get(route('rbac.users.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function handleSearchSubmit(e: FormEvent) {
        e.preventDefault();
        executeFilter();
    }

    function handleReset() {
        setSearch('');
        setRole('all');
        router.get(
            route('rbac.users.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <TableToolbar
            title="Daftar Pengguna / Staf"
            description="Manajemen akun pegawai dan penugasan peran (role assignment)."
            icon={Users}
            current={current}
            total={total}
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Nama staf atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 bg-background pl-8 text-xs"
                    />
                </div>
                <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                >
                    Cari
                </Button>
                <FilterPopover
                    activeCount={activeFilterCount}
                    onReset={handleReset}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role-filter">Filter Role</Label>
                            <Select
                                value={role}
                                onValueChange={(val) => {
                                    setRole(val);
                                    executeFilter({ role: val });
                                }}
                            >
                                <SelectTrigger
                                    id="role-filter"
                                    className="bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Role
                                    </SelectItem>
                                    {availableRoles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </FilterPopover>
            </form>
        </TableToolbar>
    );
}
