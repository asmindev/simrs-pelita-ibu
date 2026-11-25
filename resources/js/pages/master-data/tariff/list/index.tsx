import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { TariffFilters } from '../components/tariff-filters';
import type {
    Paginated,
    Tariff,
    TariffFilters as Filters,
    UnitOption,
} from '../types/tariff';
import { createTariffColumns } from './components/tariff-columns';

type Props = {
    tariffs: Paginated<Tariff>;
    units: UnitOption[];
    filters: Filters;
};

export default function TariffIndex({ tariffs, units, filters }: Props) {
    const { can } = usePermissions();
    const canManage = can('master-data.tariff.manage');

    const handleDeactivate = useCallback((tariff: Tariff) => {
        if (!window.confirm(`Hapus tarif ${tariff.name}?`)) {
            return;
        }

        router.delete(route('master-data.tariffs.destroy', tariff.id), {
            preserveScroll: true,
        });
    }, []);

    const columns = useMemo(
        () =>
            createTariffColumns({
                canManage,
                onDeactivate: handleDeactivate,
            }),
        [canManage, handleDeactivate],
    );

    return (
        <div className="space-y-4">
            <Head title="Master Data Tarif & Layanan — SIMRS" />

            <DataTable
                columns={columns}
                rows={tariffs.data}
                rowKey={(tariff) => tariff.id}
                empty="Tidak ada tarif yang ditemukan."
                toolbar={
                    <TariffFilters
                        filters={filters}
                        units={units}
                        current={tariffs.data.length}
                        total={tariffs.total}
                        actions={
                            <Can permission="master-data.tariff.manage">
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Link
                                        href={route(
                                            'master-data.tariffs.create',
                                        )}
                                    >
                                        <Plus className="size-3.5" />
                                        Tambah Tarif
                                    </Link>
                                </Button>
                            </Can>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={tariffs.links}
                        from={tariffs.from}
                        to={tariffs.to}
                        total={tariffs.total}
                    />
                }
            />
        </div>
    );
}
