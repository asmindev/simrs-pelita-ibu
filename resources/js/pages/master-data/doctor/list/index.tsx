import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit2, MoreHorizontal, Plus, UserX } from 'lucide-react';
import { useMemo, useState } from 'react';

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

import { DoctorFilters } from '../components/doctor-filters';
import { DoctorFormDialog } from './components/doctor-form-dialog';
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
    const [formOpen, setFormOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    function handleCreate() {
        setSelectedDoctor(null);
        setFormOpen(true);
    }

    function handleEdit(doctor: Doctor) {
        setSelectedDoctor(doctor);
        setFormOpen(true);
    }

    function deactivate(doctor: Doctor) {
        if (!window.confirm(`Nonaktifkan dokter ${doctor.name}?`)) {
            return;
        }

        router.delete(route('master-data.doctors.destroy', doctor.id), {
            preserveScroll: true,
        });
    }

    const columns = useMemo<DataTableColumn<Doctor>[]>(
        () => [
            {
                key: 'code',
                header: 'Kode',
                render: (doctor) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {doctor.code}
                    </span>
                ),
            },
            {
                key: 'name',
                header: 'Nama Dokter',
                render: (doctor) => (
                    <button
                        type="button"
                        onClick={() => handleEdit(doctor)}
                        className="text-left text-xs font-semibold text-foreground transition-colors hover:text-primary"
                    >
                        {doctor.name}
                    </button>
                ),
            },
            {
                key: 'specialization',
                header: 'Spesialisasi',
                render: (doctor) => (
                    <Badge variant="secondary" className="text-[10px]">
                        {doctor.specialization ?? 'Dokter Umum'}
                    </Badge>
                ),
            },
            {
                key: 'license_number',
                header: 'SIP / Izin Praktik',
                render: (doctor) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {doctor.license_number ?? '-'}
                    </span>
                ),
            },
            {
                key: 'phone',
                header: 'Telepon',
                render: (doctor) => (
                    <span className="text-xs text-muted-foreground">
                        {doctor.phone ?? '-'}
                    </span>
                ),
            },
            {
                key: 'is_active',
                header: 'Status',
                render: (doctor) => (
                    <Badge
                        variant={doctor.is_active ? 'default' : 'outline'}
                        className="text-[10px]"
                    >
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
                                <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                >
                                    <DropdownMenuItem
                                        onClick={() => handleEdit(doctor)}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah Profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route(
                                                'master-data.doctors.edit',
                                                doctor.id,
                                            )}
                                        >
                                            <Calendar className="mr-2 size-3.5" />
                                            Jadwal Praktik
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
        ],
        [can],
    );

    return (
        <div className="space-y-4">
            <Head title="Master Data Dokter — SIMRS" />

            <DataTable<Doctor>
                columns={columns}
                rows={doctors.data}
                rowKey={(doctor) => doctor.id}
                empty="Tidak ada dokter yang ditemukan."
                toolbar={
                    <DoctorFilters
                        filters={filters}
                        current={doctors.data.length}
                        total={doctors.total}
                        actions={
                            <Can permission="master-data.doctor.manage">
                                <Button
                                    size="sm"
                                    onClick={handleCreate}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Dokter
                                </Button>
                            </Can>
                        }
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

            <DoctorFormDialog
                doctor={selectedDoctor}
                open={formOpen}
                onOpenChange={setFormOpen}
            />
        </div>
    );
}
