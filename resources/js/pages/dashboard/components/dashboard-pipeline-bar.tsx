import { BedDouble, DollarSign, Pill, Stethoscope, Users } from 'lucide-react';

import { Card, CardContent } from '@/shared/ui/card';

import type { DashboardPipeline } from '../types/dashboard';

interface Props {
    pipeline: DashboardPipeline;
}

export function DashboardPipelineBar({ pipeline }: Props) {
    const stats = [
        {
            label: '1. Pendaftaran',
            value: pipeline.registration_count,
            sub: `${pipeline.registration_count} kunjungan hari ini`,
            icon: Users,
            highlight: false,
        },
        {
            label: '2. Antrean Dokter',
            value: pipeline.waiting_consultations,
            sub: `${pipeline.waiting_consultations} pasien menunggu periksa`,
            icon: Stethoscope,
            highlight: pipeline.waiting_consultations > 0,
        },
        {
            label: '3. Farmasi & Resep',
            value: pipeline.pending_prescriptions,
            sub: `${pipeline.pending_prescriptions} resep menunggu racik`,
            icon: Pill,
            highlight: pipeline.pending_prescriptions > 0,
        },
        {
            label: '4. Kasir & Billing',
            value: pipeline.pending_invoices,
            sub: `${pipeline.pending_invoices} tagihan belum lunas`,
            icon: DollarSign,
            highlight: pipeline.pending_invoices > 0,
        },
        {
            label: '5. Rawat Inap (BOR)',
            value: `${pipeline.bor_percentage}%`,
            sub: `${pipeline.occupied_beds}/${pipeline.total_beds} bed terisi`,
            icon: BedDouble,
            highlight: pipeline.bor_percentage >= 80,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Card
                        key={stat.label}
                        className={`overflow-hidden border-none bg-muted p-0 shadow-none ${
                            stat.highlight ? 'ring-1 ring-primary/20' : ''
                        }`}
                    >
                        <CardContent className="flex w-full flex-col items-center p-0">
                            <div className="w-full p-0.5 sm:p-1">
                                <div
                                    className={`rounded-lg border p-2.5 shadow-xs transition-colors sm:p-4 ${
                                        stat.highlight
                                            ? 'border-primary/20 bg-primary/10 dark:bg-primary/20'
                                            : 'border-border bg-card shadow-xs'
                                    }`}
                                >
                                    <div className="mb-1.5 flex items-center justify-between gap-1.5 sm:mb-2 sm:gap-2">
                                        <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground/80 sm:gap-2">
                                            <Icon className="size-3.5 shrink-0 text-primary sm:size-4" />
                                            <p className="truncate font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase sm:text-xs">
                                                {stat.label}
                                            </p>
                                        </div>
                                    </div>

                                    <h3
                                        className={`font-mono text-xl font-bold tracking-tight sm:text-2xl md:text-3xl ${
                                            stat.highlight
                                                ? 'font-black text-primary'
                                                : 'text-foreground'
                                        }`}
                                    >
                                        {stat.value}
                                    </h3>
                                </div>
                            </div>

                            <div className="hidden w-full justify-between px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase sm:flex">
                                <p className="truncate">{stat.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
