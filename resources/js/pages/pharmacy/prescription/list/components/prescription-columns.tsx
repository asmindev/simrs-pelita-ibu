import { Link } from '@inertiajs/react';
import { Eye, MoreHorizontal } from 'lucide-react';

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

import type { Prescription } from '../../../types/pharmacy';
import { PrescriptionStatusBadge } from '../../components/prescription-status-badge';

export function getPrescriptionColumns(): DataTableColumn<Prescription>[] {
    return [
        {
            key: 'prescription_number',
            header: 'No. Resep',
            className: 'w-36',
            render: (rx) => (
                <div className="space-y-0.5">
                    <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                        {rx.prescription_number}
                    </span>
                    {rx.encounter?.queue?.queue_code && (
                        <div className="text-[11px] text-muted-foreground">
                            Antrean: {rx.encounter.queue.queue_code}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (rx) => (
                <div>
                    <div className="font-medium text-foreground">
                        {rx.patient?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        RM: {rx.patient?.medical_record_number} •{' '}
                        {rx.patient?.gender === 'male' ? 'L' : 'P'}
                    </div>
                </div>
            ),
        },
        {
            key: 'doctor_unit',
            header: 'Dokter & Unit',
            render: (rx) => (
                <div>
                    <div className="text-sm font-medium text-foreground">
                        {rx.unit?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {rx.doctor?.name || '-'}
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Daftar Obat',
            render: (rx) => {
                const items = rx.items || [];
                return (
                    <div className="flex max-w-md flex-wrap gap-1">
                        {items.slice(0, 3).map((item) => (
                            <Badge
                                key={item.id}
                                variant="outline"
                                className="text-[11px] font-normal"
                            >
                                {item.drug?.name} ({item.quantity})
                            </Badge>
                        ))}
                        {items.length > 3 && (
                            <Badge
                                variant="secondary"
                                className="text-[11px] font-normal"
                            >
                                +{items.length - 3} obat lainnya
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            render: (rx) => <PrescriptionStatusBadge status={rx.status} />,
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (rx) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Buka menu aksi</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(
                                        'pharmacy.prescriptions.show',
                                        rx.id,
                                    )}
                                >
                                    <Eye className="mr-2 size-3.5" />
                                    Buka Resep & Telaah
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];
}
