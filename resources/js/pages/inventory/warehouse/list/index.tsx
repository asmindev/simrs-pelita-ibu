import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { WarehouseFormDialog } from '../components/warehouse-form-dialog';
import type {
    Paginated,
    UsageOption,
    WarehouseFilters as Filters,
    WarehouseLocation,
    WarehouseStatistics as Stats,
} from '../types/warehouse';
import { createWarehouseColumns } from './components/warehouse-columns';
import { WarehouseFilters } from './components/warehouse-filters';
import { WarehouseStatistics } from './components/warehouse-statistics';

type Props = {
    warehouses: Paginated<WarehouseLocation>;
    usageOptions: UsageOption[];
    filters: Filters;
    statistics: Stats;
};

export default function WarehouseIndex({
    warehouses,
    usageOptions,
    filters,
    statistics,
}: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] =
        useState<WarehouseLocation | null>(null);

    function handleCreate() {
        setSelectedWarehouse(null);
        setFormOpen(true);
    }

    const handleEdit = useCallback((warehouse: WarehouseLocation) => {
        setSelectedWarehouse(warehouse);
        setFormOpen(true);
    }, []);

    const handleDeactivate = useCallback((warehouse: WarehouseLocation) => {
        if (
            !window.confirm(
                `Nonaktifkan lokasi ${warehouse.code} (${warehouse.name})?`,
            )
        ) {
            return;
        }

        router.delete(route('inventory.warehouses.destroy', warehouse.id), {
            preserveScroll: true,
        });
    }, []);

    const columns = useMemo(
        () =>
            createWarehouseColumns({
                onEdit: handleEdit,
                onDeactivate: handleDeactivate,
            }),
        [handleEdit, handleDeactivate],
    );

    return (
        <div className="space-y-4">
            <Head title="Gudang & Lokasi Stok — SIMRS" />

            <WarehouseStatistics statistics={statistics} />

            <DataTable<WarehouseLocation>
                columns={columns}
                rows={warehouses.data}
                rowKey={(warehouse) => warehouse.id}
                onRowClick={(warehouse) =>
                    router.visit(
                        route('inventory.warehouses.show', warehouse.id),
                    )
                }
                empty="Belum ada data gudang / lokasi stok yang sesuai."
                toolbar={
                    <WarehouseFilters
                        filters={filters}
                        usageOptions={usageOptions}
                        current={warehouses.data.length}
                        total={warehouses.total}
                        actions={
                            <Can permission="pharmacy.stock.adjust">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleCreate}
                                    className="h-8 gap-1.5 text-xs"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Gudang
                                </Button>
                            </Can>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={warehouses.links}
                        from={warehouses.from}
                        to={warehouses.to}
                        total={warehouses.total}
                    />
                }
            />

            <WarehouseFormDialog
                warehouse={selectedWarehouse}
                usageOptions={usageOptions}
                open={formOpen}
                onOpenChange={setFormOpen}
            />
        </div>
    );
}
