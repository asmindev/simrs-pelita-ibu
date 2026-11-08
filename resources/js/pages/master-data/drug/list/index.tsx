import { Head, Link, router } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

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

import { DrugFilters } from '../components/drug-filters';
import type {
    Drug,
    DrugCategory,
    DrugFilters as Filters,
    Paginated,
} from '../types/drug';

type Props = {
    drugs: Paginated<Drug>;
    categories: DrugCategory[];
    filters: Filters;
};

export default function DrugIndex({ drugs, categories, filters }: Props) {
    const { can } = usePermissions();

    function handleDelete(drug: Drug) {
        if (!window.confirm(`Hapus obat ${drug.name}?`)) {
            return;
        }

        router.delete(route('master-data.drugs.destroy', drug.id), {
            preserveScroll: true,
        });
    }

    const columns: DataTableColumn<Drug>[] = [
        {
            key: 'code',
            header: 'Kode',
            render: (drug) => (
                <span className="font-mono text-xs font-medium tabular-nums">
                    {drug.code}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Obat',
            render: (drug) => (
                <Can
                    permission="master-data.drug.manage"
                    fallback={<span className="font-medium">{drug.name}</span>}
                >
                    <Link
                        href={route('master-data.drugs.edit', drug.id)}
                        className="font-medium underline-offset-4 hover:underline"
                    >
                        {drug.name}
                    </Link>
                </Can>
            ),
        },
        {
            key: 'category',
            header: 'Kategori',
            render: (drug) => (
                <Badge variant="outline">{drug.category?.name ?? '-'}</Badge>
            ),
        },
        {
            key: 'form_strength',
            header: 'Bentuk & Kekuatan',
            render: (drug) => (
                <span className="text-sm text-muted-foreground">
                    {drug.form} · {drug.strength}
                </span>
            ),
        },
        {
            key: 'price',
            header: 'Harga Satuan',
            className: 'text-right',
            render: (drug) => (
                <span className="font-medium tabular-nums">
                    {formatCurrency(drug.price)}
                </span>
            ),
        },
        {
            key: 'manufacturer',
            header: 'Pabrik',
            render: (drug) => (
                <span className="text-sm text-muted-foreground">
                    {drug.manufacturer}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (drug) => (
                <Badge variant={drug.is_active ? 'default' : 'outline'}>
                    {drug.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (drug) => {
                const canManage = can('master-data.drug.manage');

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
                                            'master-data.drugs.edit',
                                            drug.id,
                                        )}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleDelete(drug)}
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
            <Head title="Master Obat & Farmasi" />
            <PageHeader
                title="Master Obat & Farmasi"
                description="Katalog obat, kekuatan dosis, bentuk sediaan, produsen, dan harga satuan."
                actions={
                    <Can permission="master-data.drug.manage">
                        <Button asChild>
                            <Link href={route('master-data.drugs.create')}>
                                <Plus className="size-4" />
                                Tambah Obat
                            </Link>
                        </Button>
                    </Can>
                }
            />

            <DataTable
                columns={columns}
                rows={drugs.data}
                rowKey={(drug) => drug.id}
                empty="Belum ada data obat yang sesuai dengan kriteria pencarian."
                toolbar={
                    <DrugFilters
                        filters={filters}
                        categories={categories}
                        current={drugs.data.length}
                        total={drugs.total}
                    />
                }
                footer={
                    <Pagination
                        links={drugs.links}
                        from={drugs.from}
                        to={drugs.to}
                        total={drugs.total}
                    />
                }
            />
        </>
    );
}
