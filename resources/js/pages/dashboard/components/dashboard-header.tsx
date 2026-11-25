import {
    CalendarDays,
    LayoutDashboard,
    ShieldCheck,
    Wallet,
} from 'lucide-react';

import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';

const ROLE_LABELS: Record<string, string> = {
    'super-admin': 'Super Admin',
    admin: 'Admin',
    registration: 'Pendaftaran',
    doctor: 'Dokter',
    nurse: 'Perawat',
    pharmacist: 'Farmasi',
    cashier: 'Kasir',
    'lab-analyst': 'Analis Laboratorium',
    radiographer: 'Radiografer',
    management: 'Manajemen',
    auditor: 'Auditor',
};

interface Props {
    assignedRoles: string[];
    isSuperAdmin: boolean;
    todayRevenue: number;
}

export function DashboardHeader({
    assignedRoles,
    isSuperAdmin,
    todayRevenue,
}: Props) {
    const roleLabels = assignedRoles.map((role) => ROLE_LABELS[role] ?? role);

    return (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
                <div className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs sm:flex">
                    <LayoutDashboard className="size-4" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                        Dashboard Operasional
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Pantau alur pelayanan pasien, beban kerja unit, dan
                        aktivitas billing hari ini.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                    variant="outline"
                    className="gap-1.5 bg-card font-medium text-muted-foreground"
                >
                    <CalendarDays className="size-3.5" />
                    {formatDate(new Date())}
                </Badge>

                <div className="flex h-5 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-xs font-medium">
                    <Wallet className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Pendapatan</span>
                    <span className="font-mono font-semibold text-foreground tabular-nums">
                        {formatCurrency(todayRevenue)}
                    </span>
                </div>

                {isSuperAdmin ? (
                    <Badge variant="default" className="gap-1.5">
                        <ShieldCheck className="size-3.5" />
                        Akses Penuh
                    </Badge>
                ) : (
                    roleLabels.map((label) => (
                        <Badge key={label} variant="secondary">
                            {label}
                        </Badge>
                    ))
                )}
            </div>
        </div>
    );
}
