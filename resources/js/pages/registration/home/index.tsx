import { Head, Link } from '@inertiajs/react';
import { Activity, CheckCircle2, Clock, Plus, Users } from 'lucide-react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { RegistrationMetrics, UnitSummary } from '../types/registration';

type Props = {
    metrics: RegistrationMetrics;
    units: UnitSummary[];
};

export default function RegistrationIndex({ metrics, units }: Props) {
    return (
        <div className="space-y-4">
            <Head title="Pendaftaran Pasien & Antrean — SIMRS" />

            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Kunjungan Hari Ini
                        </CardTitle>
                        <Users className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {metrics.total_encounters_today}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Kunjungan terdaftar hari ini
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Kunjungan Aktif
                        </CardTitle>
                        <Activity className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {metrics.active_encounters_today}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sedang menunggu atau dalam pelayanan
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Kunjungan Selesai
                        </CardTitle>
                        <CheckCircle2 className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {metrics.completed_today}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pelayanan telah selesai hari ini
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Status Antrean per Unit */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Status Antrean Unit Pelayanan
                    </h2>
                    <Button asChild variant="link" className="text-xs">
                        <Link href={route('registration.visits.index')}>
                            Lihat Semua Riwayat Kunjungan →
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {units.map((unit) => (
                        <Card key={unit.id} className="border-border bg-card">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold text-foreground">
                                            {unit.name}
                                        </CardTitle>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {unit.code}
                                        </span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="text-xs uppercase"
                                    >
                                        {unit.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="rounded border border-border bg-muted/30 p-2">
                                        <div className="font-bold text-foreground">
                                            {unit.waiting_count}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Menunggu
                                        </div>
                                    </div>
                                    <div className="rounded border border-primary/20 bg-primary/10 p-2">
                                        <div className="font-bold text-primary">
                                            {unit.calling_count}
                                        </div>
                                        <div className="text-[10px] text-primary">
                                            Dipanggil
                                        </div>
                                    </div>
                                    <div className="rounded border border-border bg-muted/60 p-2">
                                        <div className="font-bold text-foreground">
                                            {unit.serving_count}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Dilayani
                                        </div>
                                    </div>
                                    <div className="rounded border border-border bg-muted/30 p-2">
                                        <div className="font-bold text-foreground">
                                            {unit.completed_count}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Selesai
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="w-full shrink-0"
                                    >
                                        <Link
                                            href={route(
                                                'registration.queues.board',
                                                {
                                                    unit_id: unit.id,
                                                },
                                            )}
                                        >
                                            <Clock className="mr-1 size-3.5" />
                                            Antrean
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="w-full shrink-0"
                                    >
                                        <Link
                                            href={route(
                                                'registration.visits.create',
                                                {
                                                    unit_id: unit.id,
                                                },
                                            )}
                                        >
                                            <Plus className="mr-1 size-3.5" />
                                            Daftar
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
