import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    CheckCircle2,
    Clock,
    FastForward,
    Play,
    Stethoscope,
    Ticket,
    Volume2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

import type { Encounter } from '../../../types/registration';

type QueueActionRoute =
    | 'registration.queues.call'
    | 'registration.queues.serve'
    | 'registration.queues.complete'
    | 'registration.queues.skip';

type Props = {
    encounter: Encounter;
    onOpenCancel: () => void;
};

function renderVisitStatusBadge(status: Encounter['status']) {
    switch (status) {
        case 'arrived':
            return (
                <Badge variant="secondary" className="gap-1 text-xs">
                    <Clock className="size-3" />
                    Menunggu
                </Badge>
            );
        case 'in_consultation':
            return (
                <Badge variant="default" className="gap-1 text-xs">
                    <Stethoscope className="size-3" />
                    Sedang Dilayani
                </Badge>
            );
        case 'finished':
            return (
                <Badge variant="outline" className="gap-1 text-xs">
                    <CheckCircle2 className="size-3" />
                    Selesai
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-destructive text-xs text-destructive"
                >
                    <XCircle className="size-3" />
                    Dibatalkan
                </Badge>
            );
    }
}

export function VisitControlBar({ encounter, onOpenCancel }: Props) {
    const [pendingAction, setPendingAction] = useState<QueueActionRoute | null>(
        null,
    );
    const queue = encounter.queue;

    const canCall = queue?.status === 'waiting';
    const canServe = queue?.status === 'waiting' || queue?.status === 'calling';
    const canComplete =
        queue?.status === 'calling' || queue?.status === 'serving';
    const canSkip = queue?.status === 'waiting' || queue?.status === 'calling';
    const canCancel =
        encounter.status !== 'finished' && encounter.status !== 'cancelled';

    function runQueueAction(action: QueueActionRoute) {
        if (!queue) return;
        setPendingAction(action);
        router.post(
            route(action, queue.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            },
        );
    }

    const step1Done = true;
    const step2Done =
        encounter.status === 'in_consultation' ||
        encounter.status === 'finished';
    const step3Done = encounter.status === 'finished';
    const isCancelled = encounter.status === 'cancelled';

    return (
        <div className="space-y-2.5">
            {/* Control Header Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Link href={route('registration.visits.index')}>
                            <ArrowLeft className="size-3.5" />
                            Daftar Kunjungan
                        </Link>
                    </Button>

                    <span className="text-border">/</span>

                    <span className="font-mono text-xs font-semibold text-foreground">
                        {encounter.encounter_number}
                    </span>

                    {queue?.queue_code && (
                        <Badge
                            variant="outline"
                            className="gap-1 font-mono text-xs font-bold text-primary"
                        >
                            <Ticket className="size-3" />
                            {queue.queue_code}
                        </Badge>
                    )}

                    {renderVisitStatusBadge(encounter.status)}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {queue && (
                        <Can permission="registration.queue.call">
                            {canCall && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={pendingAction !== null}
                                    onClick={() =>
                                        runQueueAction(
                                            'registration.queues.call',
                                        )
                                    }
                                    className="h-8 cursor-pointer gap-1.5 text-xs"
                                >
                                    <Volume2 className="size-3.5" />
                                    Panggil
                                </Button>
                            )}

                            {canServe && (
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={pendingAction !== null}
                                    onClick={() =>
                                        runQueueAction(
                                            'registration.queues.serve',
                                        )
                                    }
                                    className="h-8 cursor-pointer gap-1.5 text-xs"
                                >
                                    <Play className="size-3.5" />
                                    Mulai Layani
                                </Button>
                            )}

                            {canComplete && (
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={pendingAction !== null}
                                    onClick={() =>
                                        runQueueAction(
                                            'registration.queues.complete',
                                        )
                                    }
                                    className="h-8 cursor-pointer gap-1.5 text-xs"
                                >
                                    <CheckCircle2 className="size-3.5" />
                                    Selesai Layani
                                </Button>
                            )}

                            {canSkip && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={pendingAction !== null}
                                    onClick={() =>
                                        runQueueAction(
                                            'registration.queues.skip',
                                        )
                                    }
                                    className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground"
                                >
                                    <FastForward className="size-3.5" />
                                    Lewati
                                </Button>
                            )}
                        </Can>
                    )}

                    {!isCancelled && (
                        <Can permission="medical-record.encounter.view">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Link
                                    href={route(
                                        'medical-record.encounters.show',
                                        encounter.id,
                                    )}
                                >
                                    <Stethoscope className="size-3.5 text-primary" />
                                    Buka EMR
                                </Link>
                            </Button>
                        </Can>
                    )}

                    {canCancel && (
                        <Can permission="registration.visit.cancel">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onOpenCancel}
                                className="h-8 cursor-pointer gap-1.5 border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
                            >
                                <Ban className="size-3.5" />
                                Batalkan
                            </Button>
                        </Can>
                    )}
                </div>
            </div>

            {/* Horizontal Journey Pipeline */}
            {isCancelled ? (
                <div className="flex flex-col gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2 text-xs text-destructive sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>Kunjungan Dibatalkan</span>
                    </div>
                    <div className="text-destructive/90">
                        Alasan:{' '}
                        {encounter.cancellation_reason ||
                            'Tidak ada keterangan'}
                        {encounter.cancelled_by &&
                            ` · Oleh ${encounter.cancelled_by.name}`}
                        {encounter.cancelled_at &&
                            ` · ${formatDateTime(encounter.cancelled_at)}`}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="flex items-center gap-2.5 px-3 py-1.5">
                        <div
                            className={cn(
                                'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                step1Done
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            1
                        </div>
                        <div className="flex min-w-0 items-baseline gap-1.5 truncate">
                            <span className="text-xs font-semibold text-foreground">
                                Terdaftar
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground">
                                {formatDateTime(encounter.arrived_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-3 py-1.5">
                        <div
                            className={cn(
                                'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                step2Done
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            2
                        </div>
                        <div className="flex min-w-0 items-baseline gap-1.5 truncate">
                            <span
                                className={cn(
                                    'text-xs font-semibold',
                                    step2Done
                                        ? 'text-foreground'
                                        : 'text-muted-foreground',
                                )}
                            >
                                Pelayanan
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground">
                                {encounter.consultation_started_at
                                    ? formatDateTime(
                                          encounter.consultation_started_at,
                                      )
                                    : queue?.status === 'calling'
                                      ? 'Dipanggil'
                                      : 'Menunggu'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-3 py-1.5">
                        <div
                            className={cn(
                                'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                step3Done
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            3
                        </div>
                        <div className="flex min-w-0 items-baseline gap-1.5 truncate">
                            <span
                                className={cn(
                                    'text-xs font-semibold',
                                    step3Done
                                        ? 'text-foreground'
                                        : 'text-muted-foreground',
                                )}
                            >
                                Selesai
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground">
                                {encounter.consultation_ended_at
                                    ? formatDateTime(
                                          encounter.consultation_ended_at,
                                      )
                                    : 'Belum selesai'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
