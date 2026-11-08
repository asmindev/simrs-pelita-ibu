import { Head } from '@inertiajs/react';

import { PageHeader } from '@/shared/components/page-header';

import { CashierDashboardView } from './components/cashier-dashboard-view';
import { DiagnosticsDashboardView } from './components/diagnostics-dashboard-view';
import { DoctorDashboardView } from './components/doctor-dashboard-view';
import { ExecutiveDashboardView } from './components/executive-dashboard-view';
import { NurseDashboardView } from './components/nurse-dashboard-view';
import { PharmacyDashboardView } from './components/pharmacy-dashboard-view';
import { RegistrationDashboardView } from './components/registration-dashboard-view';
import { RoleSwitcher } from './components/role-switcher';
import { type RoleOption } from './types/dashboard';

interface DashboardPageProps {
    activeRole: string;
    availableRoles: RoleOption[];
    metrics: Record<string, any>;
    widgets: Record<string, any>;
}

export default function Dashboard({
    activeRole,
    availableRoles,
    metrics,
    widgets,
}: DashboardPageProps) {
    return (
        <div className="space-y-6">
            <Head title="Dashboard Operasional" />
            <PageHeader
                title="Dashboard Operasional"
                description="Pusat monitoring dan aktivitas rumah sakit harian."
                actions={
                    <RoleSwitcher
                        activeRole={activeRole}
                        availableRoles={availableRoles}
                    />
                }
            />

            {activeRole === 'doctor' && (
                <DoctorDashboardView
                    metrics={metrics as any}
                    widgets={widgets as any}
                />
            )}
            {activeRole === 'registration' && (
                <RegistrationDashboardView
                    metrics={metrics as any}
                    widgets={widgets as any}
                />
            )}
            {activeRole === 'pharmacist' && (
                <PharmacyDashboardView
                    metrics={metrics as any}
                    widgets={widgets as any}
                />
            )}
            {activeRole === 'cashier' && (
                <CashierDashboardView
                    metrics={metrics as any}
                    widgets={widgets as any}
                />
            )}
            {activeRole === 'nurse' && (
                <NurseDashboardView
                    metrics={metrics as any}
                    widgets={widgets as any}
                />
            )}
            {activeRole === 'diagnostics' && (
                <DiagnosticsDashboardView
                    metrics={metrics as any}
                    widgets={widgets as any}
                />
            )}
            {activeRole === 'executive' && (
                <ExecutiveDashboardView
                    metrics={metrics as any}
                    widgets={widgets as any}
                />
            )}
        </div>
    );
}
