import { Head } from '@inertiajs/react';

import { DashboardActionFeed } from './components/dashboard-action-feed';
import { DashboardFacilitySnapshot } from './components/dashboard-facility-snapshot';
import { DashboardFinancialSummaryTable } from './components/dashboard-financial-summary-table';
import { DashboardPipelineBar } from './components/dashboard-pipeline-bar';
import { DashboardUnitQueueTable } from './components/dashboard-unit-queue-table';
import type { DashboardPageProps } from './types/dashboard';

export default function Dashboard({
    assignedRoles: _assignedRoles,
    isSuperAdmin: _isSuperAdmin,
    pipeline,
    actionFeed,
    facilitySnapshot,
    unitQueueSummaries,
    financialSummaries,
}: DashboardPageProps) {
    return (
        <div className="space-y-4">
            <Head title="Dashboard Operasional Terpadu — SIMRS" />

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

            {/* 3. Grid Tabel Operasional Tambahan (Antrean Poli & Billing Penjamin) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DashboardUnitQueueTable items={unitQueueSummaries} />
                <DashboardFinancialSummaryTable items={financialSummaries} />
            </div>
        </div>
    );
}
