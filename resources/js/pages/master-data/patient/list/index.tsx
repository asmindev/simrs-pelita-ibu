import { Head, Link, router } from '@inertiajs/react';

import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

import { PatientFilters } from '../components/patient-filters';
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
    function deactivate(patient: Patient) {
        if (!window.confirm(`Nonaktifkan pasien ${patient.name}?`)) {
            return;
        }

        router.delete(route('master-data.patients.destroy', patient.id), {
            preserveScroll: true,
        });
    }

    const columns: DataTableColumn<Patient>[] = [
        {
            key: 'medical_record_number',
            header: 'No. RM',
            render: (patient) => (
                <span className="font-medium">
                    {patient.medical_record_number}
                </span>
            ),
        },
        {
            key: 'nik',
            header: 'NIK',
            render: (patient) => patient.nik ?? '-',
        },
        {
            key: 'name',
            header: 'Nama',
            render: (patient) => (
                <Link
                    href={route('master-data.patients.edit', patient.id)}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    {patient.name}
                </Link>
            ),
        },
        {
            key: 'gender',
            header: 'Jenis kelamin',
            render: (patient) =>
                patient.gender === 'male' ? 'Laki-laki' : 'Perempuan',
        },
        {
            key: 'birth_date',
            header: 'Tanggal lahir',
            render: (patient) => formatDate(patient.birth_date),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (patient) => (
                <Badge variant={patient.is_active ? 'default' : 'outline'}>
                    {patient.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (patient) => (
                <div className="flex justify-end gap-2">
                    <Can permission="master-data.patient.update">
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={route(
                                    'master-data.patients.edit',
                                    patient.id,
                                )}
                            >
                                Ubah
                            </Link>
                        </Button>
                    </Can>
                    <Can permission="master-data.patient.delete">
                        {patient.is_active && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => deactivate(patient)}
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
            <Head title="Pasien" />
            <PageHeader
                title="Pasien"
                description="Data identitas dan nomor rekam medis."
                actions={
                    <Can permission="master-data.patient.create">
                        <Button asChild>
                            <Link href={route('master-data.patients.create')}>
                                Tambah pasien
                            </Link>
                        </Button>
                    </Can>
                }
            />

            <DataTable
                columns={columns}
                rows={patients.data}
                rowKey={(patient) => patient.id}
                empty="Tidak ada pasien yang ditemukan."
                toolbar={
                    <PatientFilters
                        filters={filters}
                        current={patients.data.length}
                        total={patients.total}
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
        </>
    );
}
