import { AlertTriangle, BedDouble, Calendar } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { FacilitySnapshot } from '../types/dashboard';

interface Props {
    snapshot: FacilitySnapshot;
}

export function DashboardFacilitySnapshot({ snapshot }: Props) {
    const { beds, active_doctors, alerts } = snapshot;

    return (
        <div className="space-y-4">
            {/* 1. Critical Alerts (if any) */}
            {alerts && alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
                                alert.type === 'critical'
                                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                    : 'border-border bg-muted/60 text-foreground'
                            }`}
                        >
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <span>{alert.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Ketersediaan Tempat Tidur (Bed Occupancy) */}
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="border-b border-border/60 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <BedDouble className="size-4 text-primary" />
                            Kapasitas Bed Rawat Inap
                        </CardTitle>
                        <Badge variant="outline" className="text-[11px]">
                            {beds.available} Kosong
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                    {beds.classes.map((cls) => (
                        <div key={cls.class} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-foreground">
                                    {cls.class_label}
                                </span>
                                <span className="text-muted-foreground">
                                    {cls.occupied} / {cls.total} Bed (
                                    {cls.percentage}%)
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        cls.percentage >= 90
                                            ? 'bg-destructive'
                                            : 'bg-primary'
                                    }`}
                                    style={{ width: `${cls.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* 3. Jadwal Dokter Praktik Hari Ini */}
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="border-b border-border/60 pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <Calendar className="size-4 text-primary" />
                        Dokter Jaga & Poli Hari Ini
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {active_doctors.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            Tidak ada jadwal dokter untuk hari ini.
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {active_doctors.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <div className="font-semibold text-foreground">
                                            {doc.doctor_name}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {doc.unit_name} •{' '}
                                            {doc.specialization}
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-[10px]"
                                    >
                                        {doc.time_range}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
