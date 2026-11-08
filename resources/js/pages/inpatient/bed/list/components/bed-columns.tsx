import { Link } from '@inertiajs/react';
import { BedDouble } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';

import type { Bed } from '../../../types/inpatient';
import { BedClassBadge, BedStatusBadge } from './bed-status-badge';

export function getBedColumns(): DataTableColumn<Bed>[] {
    return [
        {
            key: 'bed_info',
            header: 'Bed & Ruangan',
            render: (bed: Bed) => (
                <div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <BedDouble className="size-3.5 text-muted-foreground" />
                        {bed.bed_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {bed.room_name}
                    </div>
                </div>
            ),
        },
        {
            key: 'class',
            header: 'Kelas',
            render: (bed: Bed) => <BedClassBadge bedClass={bed.class} />,
        },
        {
            key: 'daily_rate',
            header: 'Tarif / Hari',
            render: (bed: Bed) => (
                <div className="text-xs font-medium">
                    {formatCurrency(bed.daily_rate)}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (bed: Bed) => <BedStatusBadge status={bed.status} />,
        },
        {
            key: 'current_patient',
            header: 'Pasien Terdaftar',
            render: (bed: Bed) => {
                const admission = bed.current_assignment?.admission;
                if (!admission || !admission.patient) {
                    return (
                        <span className="text-xs text-muted-foreground">-</span>
                    );
                }
                return (
                    <div>
                        <Link
                            href={route(
                                'inpatient.admissions.show',
                                admission.id,
                            )}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            {admission.patient.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                            RM: {admission.patient.medical_record_number}
                        </div>
                    </div>
                );
            },
        },
    ];
}
