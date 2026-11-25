import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { PatientFilters } from '../components/patient-filters';
import type {
    Paginated,
    Patient,
    PatientFilters as Filters,
} from '../types/patient';
import { createPatientColumns } from './components/patient-columns';
import { PatientFormDialog } from './components/patient-form-dialog';

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

    const canUpdate = can('master-data.patient.update');
    const canDelete = can('master-data.patient.delete');

    function handleCreate() {
        setSelectedPatient(null);
        setFormOpen(true);
    }

    const handleEdit = useCallback((patient: Patient) => {
        setSelectedPatient(patient);
        setFormOpen(true);
    }, []);

    const handleDeactivate = useCallback((patient: Patient) => {
        if (!window.confirm(`Nonaktifkan pasien ${patient.name}?`)) {
            return;
        }

        router.delete(route('master-data.patients.destroy', patient.id), {
            preserveScroll: true,
        });
    }, []);

    const columns = useMemo(
        () =>
            createPatientColumns({
                canUpdate,
                canDelete,
                onEdit: handleEdit,
                onDeactivate: handleDeactivate,
            }),
        [canUpdate, canDelete, handleEdit, handleDeactivate],
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
