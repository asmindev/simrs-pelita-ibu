import { Link } from '@inertiajs/react';
import { Eye, MoreHorizontal } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatDate } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type { DiagnosticOrder } from '../../../types/diagnostics';
import {
    DiagnosticStatusBadge,
    DiagnosticTypeBadge,
} from '../../components/order-status-badge';

export function getDiagnosticOrderColumns(): DataTableColumn<DiagnosticOrder>[] {
    return [
        {
            key: 'order_patient',
            header: 'No. Order & Pasien',
            render: (order) => (
                <div className="space-y-0.5">
                    <Link
                        href={route('diagnostics.orders.show', order.id)}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                        {order.order_number}
                    </Link>
                    <div className="text-xs font-medium text-foreground">
                        {order.patient?.name}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                        RM: {order.patient?.medical_record_number} &bull;{' '}
                        {formatDate(order.created_at)}
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Jenis Layanan',
            render: (order) => <DiagnosticTypeBadge type={order.type} />,
        },
        {
            key: 'items',
            header: 'Item Pemeriksaan',
            render: (order) => (
                <div className="space-y-0.5">
                    <div className="line-clamp-2 text-xs text-foreground">
                        {order.items?.map((i) => i.test_name).join(', ') || '-'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {order.items?.length ?? 0} parameter uji
                    </div>
                </div>
            ),
        },
        {
            key: 'doctor_unit',
            header: 'Dokter Pengirim & Unit',
            render: (order) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {order.doctor?.name ?? 'Dokter Pengirim'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {order.unit?.name ?? 'Poliklinik'}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (order) => <DiagnosticStatusBadge status={order.status} />,
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (order) => (
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
                                        'diagnostics.orders.show',
                                        order.id,
                                    )}
                                >
                                    <Eye className="mr-2 size-3.5" />
                                    Detail & Input Hasil
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];
}
