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
            header: 'Aksi',
            className: 'text-right',
            render: (guarantor) => (
                <div className="flex items-center justify-end gap-2">
                    <Can permission="master-data.guarantor.manage">
                        <Button variant="ghost" size="sm" asChild>
                            <Link
                                href={route(
                                    'master-data.guarantors.edit',
                                    guarantor.id,
                                )}
                            >
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivate(guarantor)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            Hapus
                        </Button>
                    </Can>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Master Data Penjamin" />
            <PageHeader
                title="Penjamin"
                description="Kelola data penjamin pembayaran pasien (BPJS, Umum, Asuransi, Perusahaan)."
                actions={
                    <Can permission="master-data.guarantor.manage">
                        <Button asChild>
                            <Link href={route('master-data.guarantors.create')}>
                                Tambah Penjamin
                            </Link>
                        </Button>
                    </Can>
                }
            />

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
        </>
    );
}
