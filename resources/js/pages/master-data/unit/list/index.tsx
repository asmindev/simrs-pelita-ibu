import { Head, router } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Plus, PowerOff } from 'lucide-react';
import { useMemo, useState } from 'react';

import { usePermissions } from '@/shared/hooks/use-permissions';
import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { UnitFilters } from '../components/unit-filters';
import { UnitFormDialog } from './components/unit-form-dialog';
import {
    type Paginated,
    type Unit,
    type UnitFilters as Filters,
    unitTypeLabels,
} from '../types/unit';

type Props = {
    units: Paginated<Unit>;
    filters: Filters;
};

export default function UnitIndex({ units, filters }: Props) {
    const { can } = usePermissions();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    function handleCreate() {
        setSelectedUnit(null);
        setFormOpen(true);
    }

    function handleEdit(unit: Unit) {
        setSelectedUnit(unit);
        setFormOpen(true);
    }

    function deactivate(unit: Unit) {
        if (!window.confirm(`Nonaktifkan unit ${unit.name}?`)) {
            return;
        }

        router.delete(route('master-data.units.destroy', unit.id), {
            preserveScroll: true,
        });
    }

    const columns = useMemo<DataTableColumn<Unit>[]>(
        () => [
            {
                key: 'code',
                header: 'Kode',
                render: (unit) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {unit.code}
                    </span>
                ),
            },
            {
                key: 'name',
                header: 'Nama',
                render: (unit) => (
                    <button
                        type="button"
                        onClick={() => handleEdit(unit)}
                        className="text-left text-xs font-semibold text-foreground transition-colors hover:text-primary"
                    >
                        {unit.name}
                    </button>
                ),
            },
            {
                key: 'type',
                header: 'Tipe',
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
                render: (unit) => (
                    <span className="text-xs text-muted-foreground">
                        {unit.description ?? '-'}
                    </span>
                ),
            },
            {
                key: 'is_active',
                header: 'Status',
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
                className: 'w-12 text-right',
                render: (unit) => {
                    const canManage = can('master-data.unit.manage');

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
                                        className="size-8 p-0"
                                    >
                                        <MoreHorizontal className="size-4" />
                                        <span className="sr-only">
                                            Buka menu aksi
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-36"
                                >
                                    <DropdownMenuItem
                                        onClick={() => handleEdit(unit)}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah
                                    </DropdownMenuItem>
                                    {unit.is_active && (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => deactivate(unit)}
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
        ],
        [can],
    );

    return (
        <div className="space-y-4">
            <Head title="Master Data Unit — SIMRS" />

            <DataTable<Unit>
                columns={columns}
                rows={units.data}
                rowKey={(unit) => unit.id}
                empty="Tidak ada unit yang ditemukan."
                toolbar={
                    <UnitFilters
                        filters={filters}
                        current={units.data.length}
                        total={units.total}
                        actions={
                            <Can permission="master-data.unit.manage">
                                <Button
                                    size="sm"
                                    onClick={handleCreate}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Unit
                                </Button>
                            </Can>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={units.links}
                        from={units.from}
                        to={units.to}
                        total={units.total}
                    />
                }
            />

            <UnitFormDialog
                unit={selectedUnit}
                open={formOpen}
                onOpenChange={setFormOpen}
            />
        </div>
    );
}
