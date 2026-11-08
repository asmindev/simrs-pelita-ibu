import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock,
    Eye,
    FileSpreadsheet,
    Microscope,
    Radiation,
} from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type {
    DiagnosticOrder,
    DiagnosticOrderStatus,
    DiagnosticOrderType,
    PaginatedData,
} from '../../types/diagnostics';
import { OrderFilters } from '../components/order-filters';

type Props = {
    orders: PaginatedData<DiagnosticOrder>;
    filters: {
        search: string;
        type: string;
        status: string;
        date: string;
    };
    statistics: {
        total_today: number;
        lab_orders: number;
        radiology_orders: number;
        completed_today: number;
    };
};

function getTypeBadge(type: DiagnosticOrderType) {
    switch (type) {
        case 'laboratory':
            return (
                <Badge variant="outline" className="text-xs">
                    <Microscope className="mr-1 size-3 text-primary" />
                    Laboratorium
                </Badge>
            );
        case 'radiology':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Radiation className="mr-1 size-3" />
                    Radiologi
                </Badge>
            );
    }
}

function getStatusBadge(status: DiagnosticOrderStatus) {
    switch (status) {
        case 'ordered':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 size-3 text-muted-foreground" />
                    Menunggu Diproses
                </Badge>
            );
        case 'in_progress':
            return (
                <Badge
                    variant="outline"
                    className="border-primary/50 text-xs text-primary"
                >
                    <Activity className="mr-1 size-3" />
                    Sedang Diperiksa
                </Badge>
            );
        case 'completed':
            return (
                <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="mr-1 size-3" />
                    Hasil Rilis
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge variant="destructive" className="text-xs">
                    Dibatalkan
                </Badge>
            );
    }
}

export default function DiagnosticOrderListIndex({
    orders,
    filters,
    statistics,
}: Props) {
    const columns: DataTableColumn<DiagnosticOrder>[] = [
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
            render: (order) => getTypeBadge(order.type),
        },
        {
            key: 'tests',
            header: 'Item Pemeriksaan',
            render: (order) => (
                <div className="text-xs text-foreground">
                    {order.items && order.items.length > 0 ? (
                        <span className="font-medium">
                            {order.items.map((i) => i.test_name).join(', ')}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
        },
        {
            key: 'doctor_unit',
            header: 'Dokter Pengirim & Unit',
            render: (order) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {order.doctor?.name ?? 'Dokter'}
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
            render: (order) => getStatusBadge(order.status),
        },
        {
            key: 'actions',
            header: 'Aksi',
            className: 'text-right',
            render: (order) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    asChild
                >
                    <Link href={route('diagnostics.orders.show', order.id)}>
                        <Eye className="mr-1 size-3" />
                        Detail & Hasil
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Head title="Pemeriksaan Penunjang — SIMRS" />

            <PageHeader
                title="Layanan Penunjang Medis"
                description="Pengelolaan permintaan dan hasil pemeriksaan laboratorium serta radiologi."
            />

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Total Order Hari Ini
                        </CardTitle>
                        <FileSpreadsheet className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.total_today}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Permintaan penunjang
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Pemeriksaan Laboratorium
                        </CardTitle>
                        <Microscope className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {statistics.lab_orders}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Tes darah, urine, dll.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Pemeriksaan Radiologi
                        </CardTitle>
                        <Radiation className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.radiology_orders}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Rontgen, USG, CT-Scan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Hasil Selesai & Rilis
                        </CardTitle>
                        <CheckCircle2 className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {statistics.completed_today}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Telah diverifikasi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabel Order */}
            <DataTable<DiagnosticOrder>
                columns={columns}
                rows={orders.data}
                rowKey={(o) => o.id}
                empty="Tidak ada order pemeriksaan penunjang yang sesuai."
                toolbar={
                    <OrderFilters
                        filters={filters}
                        current={orders.data.length}
                        total={orders.total}
                    />
                }
                footer={
                    <Pagination
                        links={orders.links}
                        from={orders.from}
                        to={orders.to}
                        total={orders.total}
                    />
                }
            />
        </div>
    );
}
