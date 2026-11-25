import { Head } from '@inertiajs/react';

import { DashboardActionFeed } from './components/dashboard-action-feed';
import { DashboardFacilitySnapshot } from './components/dashboard-facility-snapshot';
import { DashboardFinancialSummaryTable } from './components/dashboard-financial-summary-table';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardPipelineBar } from './components/dashboard-pipeline-bar';
import { DashboardUnitQueueTable } from './components/dashboard-unit-queue-table';
import type { DashboardPageProps } from './types/dashboard';

export default function Dashboard({
    assignedRoles,
    isSuperAdmin,
    pipeline,
    actionFeed,
    facilitySnapshot,
    unitQueueSummaries,
    financialSummaries,
}: DashboardPageProps) {
    return (
        <div className="space-y-3">
            <Head title="Dashboard Operasional — SIMRS" />

            <DashboardHeader
                assignedRoles={assignedRoles}
                isSuperAdmin={isSuperAdmin}
                todayRevenue={pipeline.today_revenue}
            />

            <DashboardPipelineBar pipeline={pipeline} />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <DashboardActionFeed items={actionFeed} />
                </div>
                <div className="lg:col-span-1">
                    <DashboardFacilitySnapshot snapshot={facilitySnapshot} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <DashboardUnitQueueTable items={unitQueueSummaries} />
                <DashboardFinancialSummaryTable items={financialSummaries} />
            </div>
        </div>
    );
}
