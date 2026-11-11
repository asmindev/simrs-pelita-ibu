import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    FastForward,
    Play,
    Ticket,
    Tv,
    UserCheck,
    Users,
} from 'lucide-react';

import { Can } from '@/shared/components/can';
import { EmptyState } from '@/shared/components/empty-state';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import type { Queue, QueueStatus } from '../../types/registration';

type UnitOption = {
    id: number;
    name: string;
    code: string;
    type?: string;
};

type Props = {
    units: UnitOption[];
    selectedUnitId: number;
    queues: Queue[];
};

export default function QueueBoard({ units, selectedUnitId, queues }: Props) {
    // Auto poll queue updates every 5 seconds
    usePoll(5000);

    const activeUnit = units.find((u) => u.id === selectedUnitId);

    const callingQueue = queues.find((q) => q.status === 'calling');
    const servingQueue = queues.find((q) => q.status === 'serving');
    const currentActive = servingQueue ?? callingQueue ?? null;

    const waitingQueues = queues.filter((q) => q.status === 'waiting');
    const completedQueues = queues.filter(
        (q) => q.status === 'completed' || q.status === 'skipped',
    );

    function switchUnit(unitId: string) {
        router.get(
            route('registration.queues.board'),
            { unit_id: unitId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function serveQueue(queue: Queue) {
        router.post(
            route('registration.queues.serve', queue.id),
            {},
            { preserveScroll: true },
        );
    }

    function completeQueue(queue: Queue) {
        router.post(
            route('registration.queues.complete', queue.id),
            {},
            { preserveScroll: true },
        );
    }

    function skipQueue(queue: Queue) {
        router.post(
            route('registration.queues.skip', queue.id),
            {},
            { preserveScroll: true },
        );
    }

    function getQueueBadge(status: QueueStatus) {
        switch (status) {
            case 'waiting':
                return (
                    <Badge variant="secondary" className="text-xs">
                        Menunggu
                    </Badge>
                );
            case 'calling':
            case 'serving':
                return (
                    <Badge variant="default" className="text-xs">
                        Sedang Dilayani
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="text-xs">
                        Selesai
                    </Badge>
                );
            case 'skipped':
                return (
                    <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                    >
                        Dilewati
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge
                        variant="outline"
                        className="border-destructive text-xs text-destructive"
                    >
                        Batal
                    </Badge>
                );
        }
    }

    return (
        <div className="space-y-4">
            <Head
                title={`Papan Antrean Internal — ${activeUnit?.name ?? ''}`}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                    Monitoring antrean klinik & poliklinik secara langsung (
                    {activeUnit?.name}).
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={String(selectedUnitId)}
                        onValueChange={switchUnit}
                    >
                        <SelectTrigger className="h-8 w-60 bg-background text-xs">
                            <SelectValue placeholder="Pilih Poliklinik / Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((unit) => (
                                <SelectItem
                                    key={unit.id}
                                    value={String(unit.id)}
                                >
                                    {unit.name} ({unit.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium"
                    >
                        <Link href={route('registration.visits.index')}>
                            <ArrowLeft className="mr-1.5 size-3.5" />
                            Daftar Kunjungan
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Kartu Ringkasan Status Antrean Internal */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Ticket className="size-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">
                                Sedang Berlangsung
                            </div>
                            <div className="font-mono text-xl font-bold text-foreground">
                                {currentActive?.queue_code ?? '-'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Clock className="size-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">
                                Antrean Menunggu
                            </div>
                            <div className="font-mono text-xl font-bold text-foreground">
                                {waitingQueues.length} Pasien
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">
                                Selesai Hari Ini
                            </div>
                            <div className="font-mono text-xl font-bold text-foreground">
                                {completedQueues.length} Pasien
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Focus Banner: Antrean Aktif yang Sedang Dilayani */}
            <Card className="border-border bg-card shadow-xs">
                <CardHeader className="border-b border-border pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tv className="size-4 text-primary" />
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Pasien di Ruang Pelayanan — {activeUnit?.name}
                            </CardTitle>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-block size-2 animate-ping rounded-full bg-primary" />
                            Live Monitor
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {currentActive ? (
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Status Pelayanan:
                                </span>
                                {getQueueBadge(currentActive.status)}
                            </div>

                            <div className="font-mono text-6xl font-black tracking-tight text-primary tabular-nums">
                                {currentActive.queue_code}
                            </div>

                            <div className="space-y-1">
                                <div className="text-xl font-bold text-foreground">
                                    {currentActive.encounter?.patient?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    No. RM:{' '}
                                    <span className="font-mono font-medium">
                                        {
                                            currentActive.encounter?.patient
                                                ?.medical_record_number
                                        }
                                    </span>{' '}
                                    &bull; Dokter:{' '}
                                    <span className="font-medium text-foreground">
                                        {currentActive.encounter?.doctor
                                            ?.name ?? 'Dokter Jaga'}
                                    </span>
                                </div>
                            </div>

                            <Can permission="registration.queue.call">
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            completeQueue(currentActive)
                                        }
                                        className="h-8 gap-1.5 text-xs font-medium"
                                    >
                                        <CheckCircle2 className="size-3.5" />
                                        Selesaikan Pelayanan
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => skipQueue(currentActive)}
                                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <FastForward className="size-3.5" />
                                        Lewati Antrean
                                    </Button>
                                </div>
                            </Can>
                        </div>
                    ) : (
                        <div className="space-y-3 py-6 text-center text-muted-foreground">
                            <Clock className="mx-auto size-8 text-muted-foreground/50" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-foreground">
                                    Ruang Pemeriksaan Sedang Kosong
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Belum ada pasien yang sedang dilayani di
                                    poli ini.
                                </p>
                            </div>
                            {waitingQueues.length > 0 && (
                                <Can permission="registration.queue.call">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            serveQueue(waitingQueues[0])
                                        }
                                        className="h-8 gap-1.5 text-xs font-medium"
                                    >
                                        <Play className="size-3.5" />
                                        Mulai Layani (
                                        {waitingQueues[0].queue_code} -{' '}
                                        {
                                            waitingQueues[0].encounter?.patient
                                                ?.name
                                        }
                                        )
                                    </Button>
                                </Can>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Waiting and History Columns */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Antrean Menunggu */}
                <Card className="border-border bg-card">
                    <CardHeader className="border-b border-border pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Users className="size-4 text-primary" />
                                Antrean Menunggu ({waitingQueues.length})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3">
                        {waitingQueues.length === 0 ? (
                            <EmptyState
                                title="Tidak ada antrean menunggu"
                                description="Semua pasien di unit ini telah selesai atau sedang dilayani."
                            />
                        ) : (
                            <ul className="space-y-2">
                                {waitingQueues.map((queue) => (
                                    <li
                                        key={queue.id}
                                        className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-bold text-primary tabular-nums">
                                                    {queue.queue_code}
                                                </span>
                                                <span className="text-sm font-medium text-foreground">
                                                    {
                                                        queue.encounter?.patient
                                                            ?.name
                                                    }
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                No. RM:{' '}
                                                <span className="font-mono">
                                                    {
                                                        queue.encounter?.patient
                                                            ?.medical_record_number
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <Can permission="registration.queue.call">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    serveQueue(queue)
                                                }
                                                className="h-8 gap-1 text-xs font-medium"
                                            >
                                                <Play className="size-3" />
                                                Layani
                                            </Button>
                                        </Can>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Riwayat Selesai / Dilewati */}
                <Card className="border-border bg-card">
                    <CardHeader className="border-b border-border pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <UserCheck className="size-4 text-primary" />
                                Riwayat Hari Ini ({completedQueues.length})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3">
                        {completedQueues.length === 0 ? (
                            <EmptyState
                                title="Belum ada riwayat selesai"
                                description="Antrean yang selesai atau dilewati akan muncul di sini."
                            />
                        ) : (
                            <ul className="space-y-2">
                                {completedQueues.map((queue) => (
                                    <li
                                        key={queue.id}
                                        className="flex items-center justify-between rounded-lg border border-border bg-muted/10 p-2.5 text-xs"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-medium text-muted-foreground tabular-nums">
                                                    {queue.queue_code}
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {
                                                        queue.encounter?.patient
                                                            ?.name
                                                    }
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {queue.completed_at &&
                                                    `Selesai: ${queue.completed_at.slice(11, 16)}`}
                                            </div>
                                        </div>

                                        <div>{getQueueBadge(queue.status)}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
