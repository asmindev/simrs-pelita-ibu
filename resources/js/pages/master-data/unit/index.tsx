import { Head, Link, router } from '@inertiajs/react';

import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

import { UnitFilters } from '../components/unit-filters';
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
    function deactivate(unit: Unit) {
        if (!window.confirm(`Nonaktifkan unit ${unit.name}?`)) {
            return;
        }

        router.delete(route('master-data.units.destroy', unit.id), {
            preserveScroll: true,
        });
    }

    const columns: DataTableColumn<Unit>[] = [
        {
            key: 'code',
            header: 'Kode',
            render: (unit) => <span className="font-medium">{unit.code}</span>,
        },
        {
            key: 'name',
            header: 'Nama',
            render: (unit) => (
                <Link
                    href={route('master-data.units.edit', unit.id)}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    {unit.name}
                </Link>
            ),
        },
        {
            key: 'type',
            header: 'Tipe',
            render: (unit) => unitTypeLabels[unit.type],
        },
        {
            key: 'description',
            header: 'Deskripsi',
            render: (unit) => unit.description ?? '-',
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (unit) => (
                <Badge variant={unit.is_active ? 'secondary' : 'outline'}>
                    {unit.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (unit) => (
                <div className="flex justify-end gap-2">
                    <Can permission="master-data.unit.manage">
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={route('master-data.units.edit', unit.id)}
                            >
                                Ubah
                            </Link>
                        </Button>
                    </Can>
                    <Can permission="master-data.unit.manage">
                        {unit.is_active && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => deactivate(unit)}
                            >
                                Nonaktifkan
                            </Button>
                        )}
                    </Can>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Unit" />
            <PageHeader
                title="Unit"
                description="Poli, ruang rawat, laboratorium, radiologi, dan farmasi."
                actions={
                    <Can permission="master-data.unit.manage">
                        <Button asChild>
                            <Link href={route('master-data.units.create')}>
                                Tambah unit
                            </Link>
                        </Button>
                    </Can>
                }
            />

            <UnitFilters filters={filters} />

            <DataTable
                columns={columns}
                rows={units.data}
                rowKey={(unit) => unit.id}
            />

            <Pagination
                links={units.links}
                from={units.from}
                to={units.to}
                total={units.total}
            />
        </>
    );
}
