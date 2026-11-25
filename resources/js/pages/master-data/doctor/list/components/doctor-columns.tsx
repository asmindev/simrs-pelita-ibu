import { Link } from '@inertiajs/react';
import { Calendar, Edit2, MoreHorizontal, UserX } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type { Doctor } from '../../types/doctor';

type CreateDoctorColumnsOptions = {
    canManage: boolean;
    onEdit: (doctor: Doctor) => void;
    onDeactivate: (doctor: Doctor) => void;
};

export function createDoctorColumns({
    canManage,
    onEdit,
    onDeactivate,
}: CreateDoctorColumnsOptions): DataTableColumn<Doctor>[] {
    return [
        {
            key: 'code',
            header: 'Kode',
            className: 'py-1',
            render: (doctor) => (
                <span className="font-mono text-xs font-semibold text-foreground">
                    {doctor.code}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Dokter',
            className: 'py-1',
            render: (doctor) => (
                <button
                    type="button"
                    onClick={() => onEdit(doctor)}
                    className="cursor-pointer text-left text-xs font-semibold text-foreground transition-colors hover:text-primary"
                >
                    {doctor.name}
                </button>
            ),
        },
        {
            key: 'specialization',
            header: 'Spesialisasi',
            className: 'py-1',
            render: (doctor) => (
                <Badge variant="secondary" className="text-[10px]">
                    {doctor.specialization ?? 'Dokter Umum'}
                </Badge>
            ),
        },
        {
            key: 'license_number',
            header: 'SIP / Izin Praktik',
            className: 'py-1',
            render: (doctor) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {doctor.license_number ?? '-'}
                </span>
            ),
        },
        {
            key: 'phone',
            header: 'Telepon',
            className: 'py-1',
            render: (doctor) => (
                <span className="text-xs text-muted-foreground">
                    {doctor.phone ?? '-'}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            className: 'py-1',
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
            className: 'w-12 py-1 text-right',
            render: (doctor) => {
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
                                    className="size-7 p-0"
                                >
                                    <MoreHorizontal className="size-3.5" />
                                    <span className="sr-only">
                                        Buka menu aksi
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={() => onEdit(doctor)}
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
                                        onClick={() => onDeactivate(doctor)}
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
}
