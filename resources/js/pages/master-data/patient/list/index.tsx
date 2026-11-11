import { Head, router } from '@inertiajs/react';
import { Edit2, MoreHorizontal, Plus, UserX } from 'lucide-react';
import { useMemo, useState } from 'react';

import { usePermissions } from '@/shared/hooks/use-permissions';
import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { PatientFilters } from '../components/patient-filters';
import { PatientFormDialog } from './components/patient-form-dialog';
import type {
    Paginated,
    Patient,
    PatientFilters as Filters,
} from '../types/patient';

type Props = {
    patients: Paginated<Patient>;
    filters: Filters;
};

export default function PatientIndex({ patients, filters }: Props) {
    const { can } = usePermissions();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
        null,
    );

    function handleCreate() {
        setSelectedPatient(null);
        setFormOpen(true);
    }

    function handleEdit(patient: Patient) {
        setSelectedPatient(patient);
        setFormOpen(true);
    }

    function deactivate(patient: Patient) {
        if (!window.confirm(`Nonaktifkan pasien ${patient.name}?`)) {
            return;
        }

        router.delete(route('master-data.patients.destroy', patient.id), {
            preserveScroll: true,
        });
    }

    const columns = useMemo<DataTableColumn<Patient>[]>(
        () => [
            {
                key: 'medical_record_number',
                header: 'No. RM',
                render: (patient) => (
                    <span className="font-mono text-xs font-bold text-primary tabular-nums">
                        {patient.medical_record_number}
                    </span>
                ),
            },
            {
                key: 'nik',
                header: 'NIK',
                render: (patient) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {patient.nik ?? '-'}
                    </span>
                ),
            },
            {
                key: 'name',
                header: 'Nama Pasien',
                render: (patient) => (
                    <button
                        type="button"
                        onClick={() => handleEdit(patient)}
                        className="text-left text-xs font-semibold text-foreground transition-colors hover:text-primary"
                    >
                        {patient.name}
                    </button>
                ),
            },
            {
                key: 'gender',
                header: 'Jenis Kelamin',
                render: (patient) =>
                    patient.gender === 'male' ? 'Laki-laki' : 'Perempuan',
            },
            {
                key: 'birth_date',
                header: 'Tanggal Lahir',
                render: (patient) => formatDate(patient.birth_date),
            },
            {
                key: 'is_active',
                header: 'Status',
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
                className: 'w-12 text-right',
                render: (patient) => {
                    const canUpdate = can('master-data.patient.update');
                    const canDelete = can('master-data.patient.delete');

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
                                    {canUpdate && (
                                        <DropdownMenuItem
                                            onClick={() => handleEdit(patient)}
                                        >
                                            <Edit2 className="mr-2 size-3.5" />
                                            Ubah Data
                                        </DropdownMenuItem>
                                    )}
                                    {canDelete && patient.is_active && (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => deactivate(patient)}
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
            <Head title="Master Data Pasien — SIMRS" />

            <DataTable<Patient>
                columns={columns}
                rows={patients.data}
                rowKey={(patient) => patient.id}
                empty="Tidak ada pasien yang ditemukan."
                toolbar={
                    <PatientFilters
                        filters={filters}
                        current={patients.data.length}
                        total={patients.total}
                        actions={
                            <Can permission="master-data.patient.create">
                                <Button
                                    size="sm"
                                    onClick={handleCreate}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Pasien
                                </Button>
                            </Can>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={patients.links}
                        from={patients.from}
                        to={patients.to}
                        total={patients.total}
                    />
                }
            />

            <PatientFormDialog
                patient={selectedPatient}
                open={formOpen}
                onOpenChange={setFormOpen}
            />
        </div>
    );
}
