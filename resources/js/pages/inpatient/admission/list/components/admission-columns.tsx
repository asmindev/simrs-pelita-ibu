import { Link } from '@inertiajs/react';
import { BedDouble, Eye } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { Admission } from '../../../types/inpatient';
import { AdmissionStatusBadge } from './admission-status-badge';

export function getAdmissionColumns(): DataTableColumn<Admission>[] {
    return [
        {
            key: 'admission_info',
            header: 'No. Admisi & Tanggal',
            render: (adm: Admission) => (
                <div>
                    <div className="font-semibold text-foreground">
                        {adm.admission_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {formatDateTime(adm.admitted_at)}
                    </div>
                </div>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (adm: Admission) => (
                <div>
                    <div className="font-medium text-foreground">
                        {adm.patient?.name ?? '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        RM: {adm.patient?.medical_record_number ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'current_bed',
            header: 'Kamar & Bed',
            render: (adm: Admission) => {
                const bed = adm.current_assignment?.bed;
                if (!bed) {
                    return (
                        <span className="text-xs text-muted-foreground">
                            Belum dialokasikan
                        </span>
                    );
                }
                return (
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <BedDouble className="size-3.5 text-muted-foreground" />
                            {bed.room_name} ({bed.bed_number})
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                            Kelas {bed.class.replace('_', ' ')}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'doctor',
            header: 'DPJP',
            render: (adm: Admission) => (
                <div className="text-xs">
                    {adm.doctor?.name ??
                        adm.doctor?.user?.name ??
                        'Dokter Jaga'}
                </div>
            ),
        },
        {
            key: 'initial_diagnosis',
            header: 'Diagnosa Awal',
            render: (adm: Admission) => (
                <div className="max-w-xs truncate text-xs text-muted-foreground">
                    {adm.initial_diagnosis || '-'}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (adm: Admission) => (
                <AdmissionStatusBadge status={adm.status} />
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (adm: Admission) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    asChild
                >
                    <Link href={route('inpatient.admissions.show', adm.id)}>
                        <Eye className="mr-1 size-3.5" />
                        Detail
                    </Link>
                </Button>
            ),
        },
    ];
}
