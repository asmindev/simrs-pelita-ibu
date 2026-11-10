import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    Ban,
    CheckCircle2,
    Clock,
    ExternalLink,
    Receipt,
    Ticket,
    Tv,
    Wallet,
} from 'lucide-react';

import { Can } from '@/shared/components/can';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { Encounter } from '../../../types/registration';

interface QueueWidgetProps {
    encounter: Encounter;
    canCancel: boolean;
    onOpenCancel: () => void;
}

export function QueueWidget({
    encounter,
    canCancel,
    onOpenCancel,
}: QueueWidgetProps) {
    const queue = encounter.queue;
    const activeInvoice = encounter.invoices?.[0];

    function getQueueStatusBadge(status?: string) {
        switch (status) {
            case 'waiting':
                return (
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Clock className="size-3" />
                        Menunggu
                    </Badge>
                );
            case 'calling':
            case 'serving':
                return (
                    <Badge variant="default" className="gap-1 text-xs">
                        <CheckCircle2 className="size-3" />
                        Sedang Dilayani
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 text-xs text-muted-foreground"
                    >
                        Selesai
                    </Badge>
                );
            case 'skipped':
            case 'cancelled':
                return (
                    <Badge variant="destructive" className="gap-1 text-xs">
                        <AlertCircle className="size-3" />
                        Dibatalkan
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-xs">
                        {status || 'Belum Ada'}
                    </Badge>
                );
        }
    }

    return (
        <div className="space-y-4">
            {/* Kartu Nomor Antrean Pro Max */}
            <Card className="border-border bg-card shadow-xs">
                <CardHeader className="border-b border-border pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <Ticket className="size-4 text-primary" />
                            Antrean Pelayanan
                        </CardTitle>
                        {getQueueStatusBadge(queue?.status)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5 text-center">
                    <div className="rounded-xl border border-border/80 bg-muted/30 py-5">
                        <div className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                            Nomor Antrean
                        </div>
                        <div className="mt-1 font-mono text-5xl font-black tracking-tight text-primary tabular-nums">
                            {queue?.queue_code ?? '-'}
                        </div>
                        <div className="mt-1.5 text-xs font-semibold text-foreground">
                            {encounter.unit?.name ?? 'Unit Poliklinik'}
                        </div>
                    </div>

                    <div className="space-y-2 rounded-lg border border-border bg-card p-3 text-left text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Nomor Urut:
                            </span>
                            <span className="font-mono font-bold text-foreground">
                                {queue?.queue_number
                                    ? `#${queue.queue_number}`
                                    : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Dokter / Petugas:
                            </span>
                            <span className="font-medium text-foreground">
                                {encounter.doctor?.name ?? 'Dokter Jaga'}
                            </span>
                        </div>
                        {queue?.called_by && (
                            <div className="flex justify-between border-t border-border pt-2">
                                <span className="text-muted-foreground">
                                    Dipanggil Oleh:
                                </span>
                                <span className="font-medium text-foreground">
                                    {queue.called_by.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pt-1">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-9 w-full text-xs font-medium"
                        >
                            <Link
                                href={route('registration.queues.board', {
                                    unit_id: encounter.unit_id,
                                })}
                            >
                                <Tv className="mr-1.5 size-3.5" />
                                Papan Antrean Unit
                                <ExternalLink className="ml-auto size-3 text-muted-foreground" />
                            </Link>
                        </Button>

                        {canCancel && (
                            <Can permission="registration.visit.cancel">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onOpenCancel}
                                    className="h-8 w-full text-xs text-destructive hover:bg-destructive/10"
                                >
                                    <Ban className="mr-1.5 size-3.5" />
                                    Batalkan Kunjungan Ini
                                </Button>
                            </Can>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Kartu Status Billing & Kasir */}
            <Card className="border-border bg-card shadow-xs">
                <CardHeader className="border-b border-border pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <Receipt className="size-4 text-primary" />
                            Tagihan & Kasir
                        </CardTitle>
                        {activeInvoice ? (
                            <Badge
                                variant={
                                    activeInvoice.status === 'paid'
                                        ? 'default'
                                        : 'secondary'
                                }
                                className="text-[10px] uppercase"
                            >
                                {activeInvoice.status === 'paid'
                                    ? 'Lunas'
                                    : activeInvoice.status === 'partially_paid'
                                      ? 'Sebagian'
                                      : 'Draft / Belum Bayar'}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px]">
                                Belum Ada
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4 text-xs">
                    {activeInvoice ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    No. Faktur:
                                </span>
                                <span className="font-mono font-bold text-foreground">
                                    {activeInvoice.invoice_number}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2">
                                <span className="text-muted-foreground">
                                    Total Tagihan:
                                </span>
                                <span className="font-mono font-bold text-foreground">
                                    {formatCurrency(activeInvoice.total_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Sudah Dibayar:
                                </span>
                                <span className="font-mono text-muted-foreground">
                                    {formatCurrency(activeInvoice.paid_amount)}
                                </span>
                            </div>

                            <Button
                                asChild
                                size="sm"
                                className="h-8.5 w-full gap-1.5 text-xs font-medium"
                            >
                                <Link
                                    href={route(
                                        'cashier.invoices.show',
                                        activeInvoice.id,
                                    )}
                                >
                                    <Wallet className="size-3.5" />
                                    Buka Detail Tagihan di Kasir
                                    <ExternalLink className="ml-auto size-3" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="py-2 text-center text-muted-foreground">
                            <p className="text-xs">
                                Tagihan kasir otomatis diproses saat kunjungan.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
