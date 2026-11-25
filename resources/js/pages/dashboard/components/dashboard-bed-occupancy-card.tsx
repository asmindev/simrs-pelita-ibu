import { BedDouble } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { FacilitySnapshot } from '../types/dashboard';

interface Props {
    beds: FacilitySnapshot['beds'];
}

const RING_SIZE = 60;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function BorRing({
    percentage,
    critical,
}: {
    percentage: number;
    critical: boolean;
}) {
    const clamped = Math.min(Math.max(percentage, 0), 100);
    const dashOffset =
        RING_CIRCUMFERENCE - (clamped / 100) * RING_CIRCUMFERENCE;

    return (
        <div className="relative size-[60px] shrink-0">
            <svg
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                className="size-full -rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth={RING_STROKE}
                    className="stroke-muted"
                />
                <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth={RING_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    className={cn(
                        'transition-all duration-500',
                        critical ? 'stroke-destructive' : 'stroke-primary',
                    )}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm leading-none font-semibold text-foreground tabular-nums">
                    {percentage}%
                </span>
                <span className="mt-0.5 text-[8px] font-medium tracking-wide text-muted-foreground uppercase">
                    BOR
                </span>
            </div>
        </div>
    );
}

function BedStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg bg-muted/60 px-1.5 py-1.5 text-center">
            <p className="text-sm leading-tight font-semibold text-foreground tabular-nums">
                {value}
            </p>
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
        </div>
    );
}

export function DashboardBedOccupancyCard({ beds }: Props) {
    const isCritical = beds.bor_percentage >= 90;

    return (
        <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
            <CardHeader className="border-b border-border/60 px-3.5">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <BedDouble className="size-4 text-primary" />
                        Okupansi Rawat Inap
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="font-mono text-[11px] text-muted-foreground"
                    >
                        {beds.available} kosong
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-2.5 px-3.5">
                <div className="flex items-center gap-2.5">
                    <BorRing
                        percentage={beds.bor_percentage}
                        critical={isCritical}
                    />

                    <div className="grid flex-1 grid-cols-3 gap-1.5">
                        <BedStat label="Total" value={beds.total} />
                        <BedStat label="Terisi" value={beds.occupied} />
                        <BedStat label="Kosong" value={beds.available} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    {beds.classes.map((cls) => (
                        <div key={cls.class} className="space-y-0.5">
                            <div className="flex items-baseline justify-between gap-2 text-xs">
                                <span className="font-medium text-foreground">
                                    {cls.class_label}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                                    {cls.occupied}/{cls.total} ·{' '}
                                    {cls.percentage}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-500',
                                        cls.percentage >= 90
                                            ? 'bg-destructive'
                                            : 'bg-primary',
                                    )}
                                    style={{ width: `${cls.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
