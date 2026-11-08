import { Head, Link, router } from '@inertiajs/react';
import { Edit2, MoreHorizontal, UserX } from 'lucide-react';

import { usePermissions } from '@/shared/hooks/use-permissions';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { DoctorFilters } from '../components/doctor-filters';
import type {
    Doctor,
    DoctorFilters as Filters,
    Paginated,
} from '../types/doctor';

type Props = {
    doctors: Paginated<Doctor>;
    filters: Filters;
};

export default function DoctorIndex({ doctors, filters }: Props) {
    const { can } = usePermissions();

    function deactivate(doctor: Doctor) {
        if (!window.confirm(`Nonaktifkan dokter ${doctor.name}?`)) {
            return;
        }

        router.delete(route('master-data.doctors.destroy', doctor.id), {
            preserveScroll: true,
        });
    }

    const columns: DataTableColumn<Doctor>[] = [
        {
            key: 'code',
            header: 'Kode',
            render: (doctor) => (
                <span className="font-medium">{doctor.code}</span>
            ),
        },
        {
            key: 'name',
            header: 'Nama',
            render: (doctor) => (
                <Link
                    href={route('master-data.doctors.edit', doctor.id)}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    {doctor.name}
                </Link>
            ),
        },
        {
            key: 'specialization',
            header: 'Spesialisasi',
            render: (doctor) => doctor.specialization ?? '-',
        },
        {
            key: 'license_number',
            header: 'SIP',
            render: (doctor) => doctor.license_number ?? '-',
        },
        {
            key: 'phone',
            header: 'Telepon',
            render: (doctor) => doctor.phone ?? '-',
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (doctor) => (
                <Badge variant={doctor.is_active ? 'default' : 'outline'}>
                    {doctor.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (doctor) => {
                const canManage = can('master-data.doctor.manage');

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
                                            'master-data.doctors.edit',
                                            doctor.id,
                                        )}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah Profil
                                    </Link>
                                </DropdownMenuItem>
                                {doctor.is_active && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => deactivate(doctor)}
                                    >
                                        <UserX className="mr-2 size-3.5" />
                                        Nonaktifkan
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Dokter" />
            <PageHeader
                title="Dokter"
                description="Profil dokter dan nomor izin praktik."
                actions={
                    <Can permission="master-data.doctor.manage">
                        <Button asChild>
                            <Link href={route('master-data.doctors.create')}>
                                Tambah dokter
                            </Link>
                        </Button>
                    </Can>
                }
            />

            <DataTable
                columns={columns}
                rows={doctors.data}
                rowKey={(doctor) => doctor.id}
                empty="Tidak ada dokter yang ditemukan."
                toolbar={
                    <DoctorFilters
                        filters={filters}
                        current={doctors.data.length}
                        total={doctors.total}
                    />
                }
                footer={
                    <Pagination
                        links={doctors.links}
                        from={doctors.from}
                        to={doctors.to}
                        total={doctors.total}
                    />
                }
            />
        </>
    );
}
