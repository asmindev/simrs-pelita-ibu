import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Microscope,
    Plus,
    Printer,
    Radiation,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type {
    DiagnosticOrder,
    DiagnosticOrderItem,
    DiagnosticOrderStatus,
    DiagnosticOrderType,
} from '../../types/diagnostics';
import { InputResultDialog } from '../components/input-result-dialog';

type Props = {
    order: DiagnosticOrder;
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

export default function DiagnosticOrderShowIndex({ order }: Props) {
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [selectedItem, setSelectedItem] =
        useState<DiagnosticOrderItem | null>(null);

    function handleOpenItemInput(item: DiagnosticOrderItem) {
        setSelectedItem(item);
        setIsInputOpen(true);
    }

    function handleComplete() {
        if (confirm('Verifikasi dan selesaikan order pemeriksaan ini?')) {
            router.post(route('diagnostics.orders.complete', order.id));
        }
    }

    const hasCriticalResults = order.results?.some((r) => r.is_critical);

    return (
        <div className="space-y-6">
            <Head title={`Order Penunjang #${order.order_number} — SIMRS`} />

            {/* Back Button & Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-xs text-muted-foreground hover:text-foreground"
                    asChild
                >
                    <Link href={route('diagnostics.orders.index')}>
                        <ArrowLeft className="mr-1.5 size-3.5" />
                        Kembali ke Daftar Penunjang
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={() => window.print()}
                    >
                        <Printer className="mr-1.5 size-3.5" />
                        Cetak Lembar Hasil
                    </Button>

                    {order.status !== 'completed' &&
                        order.status !== 'cancelled' && (
                            <>
                                <Button
                                    size="sm"
                                    className="h-8 text-xs font-medium"
                                    onClick={() => {
                                        setSelectedItem(null);
                                        setIsInputOpen(true);
                                    }}
                                >
                                    <Plus className="mr-1.5 size-3.5" />
                                    Input Hasil
                                </Button>

                                {order.results && order.results.length > 0 && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-8 text-xs font-medium"
                                        onClick={handleComplete}
                                    >
                                        <ShieldCheck className="mr-1.5 size-3.5" />
                                        Verifikasi & Rilis
                                    </Button>
                                )}
                            </>
                        )}
                </div>
            </div>

            {/* Critical Value Alert Banner */}
            {hasCriticalResults && (
                <div className="space-y-1 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-xs">
                    <div className="flex items-center gap-2 text-sm font-bold text-destructive">
                        <AlertTriangle className="size-4.5" />
                        Peringatan: Terdapat Hasil Nilai Kritis (Critical Value
                        Alert)
                    </div>
                    <p className="text-muted-foreground">
                        Hasil pemeriksaan ini memiliki nilai yang melampaui
                        batas bahaya klinis. Harap segera komunikasikan hasil
                        kepada dokter penanggung jawab pasien.
                    </p>
                </div>
            )}

            {/* Order Info Card */}
            <Card>
                <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="font-mono text-lg font-bold">
                                {order.order_number}
                            </CardTitle>
                            {getTypeBadge(order.type)}
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Kunjungan:{' '}
                            <span className="font-mono font-medium">
                                {order.encounter?.encounter_number}
                            </span>{' '}
                            &bull; Dibuat: {formatDateTime(order.created_at)}
                        </p>
                    </div>

                    {order.completed_at && (
                        <div className="text-right text-xs">
                            <div className="text-muted-foreground">
                                Diverifikasi pada:
                            </div>
                            <div className="font-medium text-foreground">
                                {formatDateTime(order.completed_at)}
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-4 border-t border-border pt-4 text-xs sm:grid-cols-3">
                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            Data Pasien
                        </span>
                        <div className="font-semibold text-foreground">
                            {order.patient?.name}
                        </div>
                        <div className="font-mono text-muted-foreground">
                            RM: {order.patient?.medical_record_number} &bull;{' '}
                            {order.patient?.gender === 'M'
                                ? 'Laki-laki'
                                : 'Perempuan'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            Dokter & Unit Pengirim
                        </span>
                        <div className="font-semibold text-foreground">
                            {order.doctor?.name ?? 'Dokter'}
                        </div>
                        <div className="text-muted-foreground">
                            {order.unit?.name ?? 'Poliklinik'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            Catatan Klinis / Indikasi
                        </span>
                        <div className="text-foreground">
                            {order.clinical_notes ||
                                'Tidak ada catatan klinis khusus.'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Daftar Item Permintaan Pemeriksaan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="size-4 text-muted-foreground" />
                        Item Pemeriksaan yang Diminta
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">No.</TableHead>
                                <TableHead className="text-xs">
                                    Tindakan / Parameter
                                </TableHead>
                                <TableHead className="text-xs">
                                    Status Item
                                </TableHead>
                                <TableHead className="text-xs">
                                    Keterangan
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!order.items || order.items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-16 text-center text-xs text-muted-foreground"
                                    >
                                        Tidak ada item pemeriksaan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                order.items.map((item, idx) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-foreground">
                                            {item.test_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    item.status === 'completed'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="text-[11px]"
                                            >
                                                {item.status === 'completed'
                                                    ? 'Selesai'
                                                    : 'Menunggu'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.notes || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {order.status !== 'completed' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() =>
                                                        handleOpenItemInput(
                                                            item,
                                                        )
                                                    }
                                                >
                                                    Input Hasil
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Rincian Hasil Pemeriksaan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="size-4 text-primary" />
                        Hasil Pemeriksaan & Ekspertise
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">
                                    Parameter
                                </TableHead>
                                <TableHead className="text-xs">
                                    Hasil Temuan
                                </TableHead>
                                <TableHead className="text-xs">
                                    Satuan
                                </TableHead>
                                <TableHead className="text-xs">
                                    Nilai Rujukan
                                </TableHead>
                                <TableHead className="text-xs">
                                    Interpretasi / Ekspertise
                                </TableHead>
                                <TableHead className="text-xs">
                                    Pemeriksa
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Lampiran
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!order.results || order.results.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-xs text-muted-foreground"
                                    >
                                        Belum ada hasil pemeriksaan yang
                                        dicatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                order.results.map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell className="text-xs font-semibold text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                {res.parameter_name}
                                                {res.is_critical && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="px-1 py-0 text-[10px]"
                                                    >
                                                        Kritis
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold text-foreground">
                                            {res.result_value}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {res.unit || '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {res.reference_range || '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-foreground">
                                            {res.interpretation || '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {res.performed_by?.name ??
                                                'Analis/Radiografer'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {res.attachment_path ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs text-primary"
                                                    asChild
                                                >
                                                    <a
                                                        href={`/storage/${res.attachment_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Download className="mr-1 size-3" />
                                                        Lihat Berkas
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Input Result Modal */}
            <InputResultDialog
                order={order}
                item={selectedItem}
                open={isInputOpen}
                onOpenChange={setIsInputOpen}
            />
        </div>
    );
}
