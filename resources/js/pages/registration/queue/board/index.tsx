import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    Clock,
    FastForward,
    Play,
    Tv,
    UserCheck,
} from 'lucide-react';

import { Can } from '@/shared/components/can';
import { EmptyState } from '@/shared/components/empty-state';
import { PageHeader } from '@/shared/components/page-header';
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
    const currentActive = callingQueue ?? servingQueue ?? null;

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

    function callQueue(queue: Queue) {
        router.post(
            route('registration.queues.call', queue.id),
            {},
            { preserveScroll: true },
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
                return (
                    <Badge variant="default" className="animate-pulse text-xs">
                        Dipanggil
                    </Badge>
                );
            case 'serving':
                return (
                    <Badge variant="default" className="text-xs">
                        Dilayani
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
        <div className="space-y-6">
            <Head title={`Papan Antrean ${activeUnit?.name ?? ''}`} />

            <PageHeader
                title="Papan Antrean Unit"
                description="Monitor dan pemanggilan antrean pasien secara langsung per unit pelayanan."
                actions={
                    <div className="flex items-center gap-2">
                        <Select
                            value={String(selectedUnitId)}
                            onValueChange={switchUnit}
                        >
                            <SelectTrigger className="h-9 w-56 text-xs">
                                <SelectValue placeholder="Pilih Unit Antrean" />
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

                        <Button asChild variant="outline">
                            <Link href={route('registration.visits.index')}>
                                Daftar Kunjungan
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* Calling / Active Banner Display */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tv className="size-5 text-primary" />
                            <CardTitle className="text-base font-semibold text-foreground">
                                Antrean Sedang Berlangsung — {activeUnit?.name}
                            </CardTitle>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-block size-2 animate-ping rounded-full bg-primary" />
                            Live Sync
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {currentActive ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
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
                                    {
                                        currentActive.encounter?.patient
                                            ?.medical_record_number
                                    }{' '}
                                    · Dokter:{' '}
                                    {currentActive.encounter?.doctor?.name ??
                                        'Dokter Jaga'}
                                </div>
                            </div>

                            <Can permission="registration.queue.call">
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => callQueue(currentActive)}
                                    >
                                        <Bell className="mr-1.5 size-4" />
                                        Panggil Ulang
                                    </Button>

                                    {currentActive.status === 'calling' && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                serveQueue(currentActive)
                                            }
                                        >
                                            <Play className="mr-1.5 size-4" />
                                            Mulai Layani
                                        </Button>
                                    )}

                                    {currentActive.status === 'serving' && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                completeQueue(currentActive)
                                            }
                                        >
                                            <CheckCircle2 className="mr-1.5 size-4" />
                                            Selesai Pelayanan
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => skipQueue(currentActive)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <FastForward className="mr-1.5 size-4" />
                                        Lewati
                                    </Button>
                                </div>
                            </Can>
                        </div>
                    ) : (
                        <div className="space-y-2 py-8 text-center text-muted-foreground">
                            <Clock className="mx-auto size-8 text-muted-foreground/60" />
                            <p className="text-sm font-medium">
                                Belum ada antrean yang sedang dipanggil atau
                                dilayani.
                            </p>
                            {waitingQueues.length > 0 && (
                                <Can permission="registration.queue.call">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            callQueue(waitingQueues[0])
                                        }
                                    >
                                        <Bell className="mr-1.5 size-4" />
                                        Panggil Antrean Pertama (
                                        {waitingQueues[0].queue_code})
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
                                <Clock className="size-4 text-primary" />
                                Antrean Menunggu ({waitingQueues.length})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3">
                        {waitingQueues.length === 0 ? (
                            <EmptyState
                                title="Tidak ada antrean menunggu"
                                description="Semua pasien di unit ini telah dipanggil atau dilayani."
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
                                                {
                                                    queue.encounter?.patient
                                                        ?.medical_record_number
                                                }
                                            </div>
                                        </div>

                                        <Can permission="registration.queue.call">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => callQueue(queue)}
                                            >
                                                <Bell className="mr-1 size-3.5" />
                                                Panggil
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
