import { Calendar, Stethoscope } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { ActiveDoctorItem } from '../types/dashboard';

interface Props {
    doctors: ActiveDoctorItem[];
}

export function DashboardDoctorScheduleCard({ doctors }: Props) {
    return (
        <Card size="sm" className="gap-0 py-0 [--card-spacing:--spacing(2.5)]">
            <CardHeader className="border-b border-border/60 px-3.5 pt-2.5">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <Calendar className="size-4 text-primary" />
                        Dokter Praktik Hari Ini
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="font-mono text-[11px] text-muted-foreground"
                    >
                        {doctors.length} jadwal
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {doctors.length === 0 ? (
                    <div className="px-3.5 py-5 text-center text-xs text-muted-foreground">
                        Tidak ada jadwal dokter untuk hari ini.
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {doctors.map((doctor) => (
                            <div
                                key={doctor.id}
                                className="flex items-center gap-2.5 px-3.5 py-2"
                            >
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Stethoscope className="size-3.5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-foreground">
                                        {doctor.doctor_name}
                                    </p>
                                    <p className="truncate text-[11px] text-muted-foreground">
                                        {doctor.unit_name} ·{' '}
                                        {doctor.specialization}
                                    </p>
                                </div>

                                <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                                    {doctor.time_range}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
