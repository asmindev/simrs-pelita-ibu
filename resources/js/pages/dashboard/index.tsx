import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/shared/components/page-header';
import { Badge } from '@/shared/ui/badge';

import { DashboardActionFeed } from './components/dashboard-action-feed';
import { DashboardFacilitySnapshot } from './components/dashboard-facility-snapshot';
import { DashboardPipelineBar } from './components/dashboard-pipeline-bar';
import type { DashboardPageProps } from './types/dashboard';

export default function Dashboard({
    assignedRoles,
    isSuperAdmin,
    pipeline,
    actionFeed,
    facilitySnapshot,
}: DashboardPageProps) {
    return (
        <div className="space-y-6">
            <Head title="Dashboard Operasional Terpadu — SIMRS" />

            <PageHeader
                title="Pusat Operasional Rumah Sakit"
                description="Monitoring alur pasien, feed tugas aktif, dan kapasitas fasilitas hari ini."
                actions={
                    <div className="flex flex-wrap items-center gap-1.5">
                        {isSuperAdmin ? (
                            <Badge
                                variant="default"
                                className="gap-1 text-xs font-semibold"
                            >
                                <ShieldCheck className="size-3.5" />
                                Super Admin (Bypass Global)
                            </Badge>
                        ) : (
                            assignedRoles.map((role) => (
                                <Badge
                                    key={role}
                                    variant="secondary"
                                    className="font-mono text-[11px]"
                                >
                                    {role}
                                </Badge>
                            ))
                        )}
                    </div>
                }
            />

            {/* 1. Baris Alur Pasien Utama (Pipeline) */}
            <DashboardPipelineBar pipeline={pipeline} />

            {/* 2. Grid Utama (Feed Tugas 65% + Fasilitas 35%) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <DashboardActionFeed items={actionFeed} />
                </div>
                <div className="lg:col-span-1">
                    <DashboardFacilitySnapshot snapshot={facilitySnapshot} />
                </div>
            </div>
        </div>
    );
}
