import { Head, Link, router } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

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

import { GuarantorFilters } from '../components/guarantor-filters';
import {
    type Guarantor,
    type GuarantorFilters as Filters,
    guarantorTypeLabels,
    type Paginated,
} from '../types/guarantor';

type Props = {
    guarantors: Paginated<Guarantor>;
    filters: Filters;
};

export default function GuarantorIndex({ guarantors, filters }: Props) {
    const { can } = usePermissions();

    function deactivate(guarantor: Guarantor) {
        if (!window.confirm(`Hapus penjamin ${guarantor.name}?`)) {
            return;
        }

        router.delete(route('master-data.guarantors.destroy', guarantor.id), {
            preserveScroll: true,
        });
    }

    const columns: DataTableColumn<Guarantor>[] = [
        {
            key: 'code',
            header: 'Kode',
            render: (guarantor) => (
                <span className="font-mono font-medium">{guarantor.code}</span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Penjamin',
            render: (guarantor) => (
                <Link
                    href={route('master-data.guarantors.edit', guarantor.id)}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    {guarantor.name}
                </Link>
            ),
        },
        {
            key: 'type',
            header: 'Tipe',
            render: (guarantor) => (
                <Badge variant="outline">
                    {guarantorTypeLabels[guarantor.type] ?? guarantor.type}
                </Badge>
            ),
        },
        {
            key: 'description',
            header: 'Keterangan',
            render: (guarantor) => (
                <span className="line-clamp-1 text-muted-foreground">
                    {guarantor.description || '-'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (guarantor) => (
                <Badge variant={guarantor.is_active ? 'default' : 'outline'}>
                    {guarantor.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'action',
            header: '',
            className: 'w-12 text-right',
            render: (guarantor) => {
                const canManage = can('master-data.guarantor.manage');

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
                                            'master-data.guarantors.edit',
                                            guarantor.id,
                                        )}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => deactivate(guarantor)}
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
