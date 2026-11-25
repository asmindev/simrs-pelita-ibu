import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { DoctorFilters } from '../components/doctor-filters';
import type {
    Doctor,
    DoctorFilters as Filters,
    Paginated,
} from '../types/doctor';
import { createDoctorColumns } from './components/doctor-columns';
import { DoctorFormDialog } from './components/doctor-form-dialog';

type Props = {
    doctors: Paginated<Doctor>;
    filters: Filters;
};

export default function DoctorIndex({ doctors, filters }: Props) {
    const { can } = usePermissions();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const canManage = can('master-data.doctor.manage');

    function handleCreate() {
        setSelectedDoctor(null);
        setFormOpen(true);
    }

    const handleEdit = useCallback((doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setFormOpen(true);
    }, []);

    const handleDeactivate = useCallback((doctor: Doctor) => {
        if (!window.confirm(`Nonaktifkan dokter ${doctor.name}?`)) {
            return;
        }

        router.delete(route('master-data.doctors.destroy', doctor.id), {
            preserveScroll: true,
        });
    }, []);

    const columns = useMemo(
        () =>
            createDoctorColumns({
                canManage,
                onEdit: handleEdit,
                onDeactivate: handleDeactivate,
            }),
        [canManage, handleEdit, handleDeactivate],
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
