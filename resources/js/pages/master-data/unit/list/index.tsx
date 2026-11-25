import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { UnitFilters } from '../components/unit-filters';
import type { Paginated, Unit, UnitFilters as Filters } from '../types/unit';
import { createUnitColumns } from './components/unit-columns';
import { UnitFormDialog } from './components/unit-form-dialog';

type Props = {
    units: Paginated<Unit>;
    filters: Filters;
};

export default function UnitIndex({ units, filters }: Props) {
    const { can } = usePermissions();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    const canManage = can('master-data.unit.manage');

    function handleCreate() {
        setSelectedUnit(null);
        setFormOpen(true);
    }

    const handleEdit = useCallback((unit: Unit) => {
        setSelectedUnit(unit);
        setFormOpen(true);
    }, []);

    const handleDeactivate = useCallback((unit: Unit) => {
        if (!window.confirm(`Nonaktifkan unit ${unit.name}?`)) {
            return;
        }

        router.delete(route('master-data.units.destroy', unit.id), {
            preserveScroll: true,
        });
    }, []);

    const columns = useMemo(
        () =>
            createUnitColumns({
                canManage,
                onEdit: handleEdit,
                onDeactivate: handleDeactivate,
            }),
        [canManage, handleEdit, handleDeactivate],
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
