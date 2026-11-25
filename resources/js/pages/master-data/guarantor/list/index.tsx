import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { GuarantorFilters } from '../components/guarantor-filters';
import type {
    Guarantor,
    GuarantorFilters as Filters,
    Paginated,
} from '../types/guarantor';
import { createGuarantorColumns } from './components/guarantor-columns';

type Props = {
    guarantors: Paginated<Guarantor>;
    filters: Filters;
};

export default function GuarantorIndex({ guarantors, filters }: Props) {
    const { can } = usePermissions();
    const canManage = can('master-data.guarantor.manage');

    const handleDeactivate = useCallback((guarantor: Guarantor) => {
        if (!window.confirm(`Hapus penjamin ${guarantor.name}?`)) {
            return;
        }

        router.delete(route('master-data.guarantors.destroy', guarantor.id), {
            preserveScroll: true,
        });
    }, []);

    const columns = useMemo(
        () =>
            createGuarantorColumns({
                canManage,
                onDeactivate: handleDeactivate,
            }),
        [canManage, handleDeactivate],
    );

    return (
        <div className="space-y-4">
            <Head title="Master Data Penjamin — SIMRS" />

            <DataTable
                columns={columns}
                rows={guarantors.data}
                rowKey={(guarantor) => guarantor.id}
                empty="Tidak ada penjamin yang ditemukan."
                toolbar={
                    <GuarantorFilters
                        filters={filters}
                        current={guarantors.data.length}
                        total={guarantors.total}
                        actions={
                            <Can permission="master-data.guarantor.manage">
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Link
                                        href={route(
                                            'master-data.guarantors.create',
                                        )}
                                    >
                                        <Plus className="size-3.5" />
                                        Tambah Penjamin
                                    </Link>
                                </Button>
                            </Can>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={guarantors.links}
                        from={guarantors.from}
                        to={guarantors.to}
                        total={guarantors.total}
                    />
                }
            />
        </div>
    );
}
