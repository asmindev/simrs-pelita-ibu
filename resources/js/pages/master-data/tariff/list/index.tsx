import { Head, Link, router } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';

import { usePermissions } from '@/shared/hooks/use-permissions';
import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { TariffFilters } from '../components/tariff-filters';
import {
    type Paginated,
    type Tariff,
    tariffCategoryLabels,
    type TariffFilters as Filters,
    type UnitOption,
} from '../types/tariff';

type Props = {
    tariffs: Paginated<Tariff>;
    units: UnitOption[];
    filters: Filters;
};

export default function TariffIndex({ tariffs, units, filters }: Props) {
    const { can } = usePermissions();

    function deactivate(tariff: Tariff) {
        if (!window.confirm(`Hapus tarif ${tariff.name}?`)) {
            return;
        }

        router.delete(route('master-data.tariffs.destroy', tariff.id), {
            preserveScroll: true,
        });
    }

    const columns: DataTableColumn<Tariff>[] = [
        {
            key: 'code',
            header: 'Kode',
            render: (tariff) => (
                <span className="font-mono font-medium">{tariff.code}</span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Layanan / Tindakan',
            render: (tariff) => (
                <Link
                    href={route('master-data.tariffs.edit', tariff.id)}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    {tariff.name}
                </Link>
            ),
        },
        {
            key: 'category',
            header: 'Kategori',
            render: (tariff) => (
                <Badge variant="outline">
                    {tariffCategoryLabels[tariff.category] ?? tariff.category}
                </Badge>
            ),
        },
        {
            key: 'unit',
            header: 'Unit Terkait',
            render: (tariff) => (
                <span className="text-muted-foreground">
                    {tariff.unit?.name ?? 'Semua Unit'}
                </span>
            ),
        },
        {
            key: 'price',
            header: 'Nominal Tarif',
            render: (tariff) => (
                <span className="font-mono font-medium">
                    {formatCurrency(tariff.price)}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (tariff) => (
                <Badge variant={tariff.is_active ? 'default' : 'outline'}>
                    {tariff.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'action',
            header: '',
            className: 'w-12 text-right',
            render: (tariff) => {
                const canManage = can('master-data.tariff.manage');

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
                            <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route(
                                            'master-data.tariffs.edit',
                                            tariff.id,
                                        )}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => deactivate(tariff)}
                                >
                                    <Trash2 className="mr-2 size-3.5" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Master Data Tarif & Layanan" />
            <PageHeader
                title="Tarif & Layanan"
                description="Kelola tarif konsultasi, tindakan medis, laboratorium, dan administrasi."
                actions={
                    <Can permission="master-data.tariff.manage">
                        <Button asChild>
                            <Link href={route('master-data.tariffs.create')}>
                                Tambah Tarif
                            </Link>
                        </Button>
                    </Can>
                }
            />

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
        </>
    );
}
