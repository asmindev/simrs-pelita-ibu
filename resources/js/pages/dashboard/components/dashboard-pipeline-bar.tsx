import {
    BedDouble,
    DollarSign,
    Microscope,
    Pill,
    Stethoscope,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';

import type { DashboardPipeline } from '../types/dashboard';

interface Props {
    pipeline: DashboardPipeline;
}

interface PipelineStat {
    label: string;
    value: string;
    sub: string;
    icon: LucideIcon;
    critical?: boolean;
}

export function DashboardPipelineBar({ pipeline }: Props) {
    const stats: PipelineStat[] = [
        {
            label: 'Pendaftaran',
            value: String(pipeline.registration_count),
            sub: 'kunjungan hari ini',
            icon: Users,
        },
        {
            label: 'Antrean Dokter',
            value: String(pipeline.waiting_consultations),
            sub: `${pipeline.in_consultations} sedang diperiksa`,
            icon: Stethoscope,
        },
        {
            label: 'Penunjang Medis',
            value: String(pipeline.pending_diagnostics),
            sub: 'order menunggu hasil',
            icon: Microscope,
        },
        {
            label: 'Farmasi & Resep',
            value: String(pipeline.pending_prescriptions),
            sub: 'resep perlu ditelaah',
            icon: Pill,
        },
        {
            label: 'Kasir & Billing',
            value: String(pipeline.pending_invoices),
            sub: 'tagihan belum lunas',
            icon: DollarSign,
        },
        {
            label: 'Rawat Inap (BOR)',
            value: `${pipeline.bor_percentage}%`,
            sub: `${pipeline.occupied_beds}/${pipeline.total_beds} bed terisi`,
            icon: BedDouble,
            critical: pipeline.bor_percentage >= 85,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Card
                        key={stat.label}
                        size="sm"
                        className={cn(
                            'transition-colors [--card-spacing:--spacing(2.5)]',
                            stat.critical && 'ring-destructive/25',
                        )}
                    >
                        <CardContent className="space-y-1.5 px-3">
                            <div className="flex items-center justify-between gap-1.5">
                                <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    {stat.label}
                                </p>

                                <div className="flex shrink-0 items-center gap-1.5">
                                    {stat.critical && (
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
                                            <span className="size-1.5 rounded-full bg-destructive" />
                                            Kritis
                                        </span>
                                    )}
                                    <div
                                        className={cn(
                                            'flex size-6 items-center justify-center rounded-md',
                                            stat.critical
                                                ? 'bg-destructive/10 text-destructive'
                                                : 'bg-primary/10 text-primary',
                                        )}
                                    >
                                        <Icon className="size-3.5" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p
                                    className="truncate text-xl leading-tight font-semibold tracking-tight text-foreground tabular-nums"
                                    title={stat.value}
                                >
                                    {stat.value}
                                </p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                    {stat.sub}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
