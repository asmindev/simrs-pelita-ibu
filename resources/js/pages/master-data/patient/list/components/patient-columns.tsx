import { Edit2, MoreHorizontal, UserX } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type { Patient } from '../../types/patient';

type CreatePatientColumnsOptions = {
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: (patient: Patient) => void;
    onDeactivate: (patient: Patient) => void;
};

export function createPatientColumns({
    canUpdate,
    canDelete,
    onEdit,
    onDeactivate,
}: CreatePatientColumnsOptions): DataTableColumn<Patient>[] {
    return [
        {
            key: 'medical_record_number',
            header: 'No. RM',
            className: 'py-1',
            render: (patient) => (
                <span className="font-mono text-xs font-bold text-primary tabular-nums">
                    {patient.medical_record_number}
                </span>
            ),
        },
        {
            key: 'nik',
            header: 'NIK',
            className: 'py-1',
            render: (patient) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {patient.nik ?? '-'}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Pasien',
            className: 'py-1',
            render: (patient) => (
                <button
                    type="button"
                    onClick={() => onEdit(patient)}
                    className="cursor-pointer text-left text-xs font-semibold text-foreground transition-colors hover:text-primary"
                >
                    {patient.name}
                </button>
            ),
        },
        {
            key: 'gender',
            header: 'Jenis Kelamin',
            className: 'py-1 text-xs',
            render: (patient) =>
                patient.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        },
        {
            key: 'birth_date',
            header: 'Tanggal Lahir',
            className: 'py-1 text-xs',
            render: (patient) => formatDate(patient.birth_date),
        },
        {
            key: 'is_active',
            header: 'Status',
            className: 'py-1',
            render: (patient) => (
                <Badge
                    variant={patient.is_active ? 'default' : 'outline'}
                    className="text-[10px]"
                >
                    {patient.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 py-1 text-right',
            render: (patient) => {
                if (!canUpdate && (!canDelete || !patient.is_active)) {
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
                                {canUpdate && (
                                    <DropdownMenuItem
                                        onClick={() => onEdit(patient)}
                                    >
                                        <Edit2 className="mr-2 size-3.5" />
                                        Ubah Data
                                    </DropdownMenuItem>
                                )}
                                {canDelete && patient.is_active && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => onDeactivate(patient)}
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
