import { BedDouble, DollarSign, Pill, Stethoscope, Users } from 'lucide-react';

import type { DashboardPipeline } from '../types/dashboard';

interface Props {
    pipeline: DashboardPipeline;
}

export function DashboardPipelineBar({ pipeline }: Props) {
    const steps = [
        {
            label: '1. Pendaftaran',
            value: pipeline.registration_count,
            unit: 'kunjungan',
            icon: Users,
            highlight: false,
        },
        {
            label: '2. Antrean Dokter',
            value: pipeline.waiting_consultations,
            unit: 'menunggu',
            icon: Stethoscope,
            highlight: pipeline.waiting_consultations > 0,
        },
        {
            label: '3. Farmasi & Resep',
            value: pipeline.pending_prescriptions,
            unit: 'menunggu racik',
            icon: Pill,
            highlight: pipeline.pending_prescriptions > 0,
        },
        {
            label: '4. Kasir & Billing',
            value: pipeline.pending_invoices,
            unit: 'tagihan belum bayar',
            icon: DollarSign,
            highlight: pipeline.pending_invoices > 0,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {steps.map((step) => {
                const Icon = step.icon;
                return (
                    <div
                        key={step.label}
                        className={`relative flex flex-col justify-between rounded-lg border p-3.5 transition-colors ${
                            step.highlight
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border/80 bg-card'
                        }`}
                    >
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{step.label}</span>
                            <Icon className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                                {step.value}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                {step.unit}
                            </span>
                        </div>
                    </div>
                );
            })}

            {/* Bed Occupancy (BOR) */}
            <div className="col-span-2 rounded-lg border border-border/80 bg-card p-3.5 sm:col-span-4 lg:col-span-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>5. Rawat Inap (BOR)</span>
                    <BedDouble className="size-3.5 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                        {pipeline.bor_percentage}%
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                        ({pipeline.occupied_beds}/{pipeline.total_beds} bed
                        terisi)
                    </span>
                </div>
            </div>
        </div>
    );
}
