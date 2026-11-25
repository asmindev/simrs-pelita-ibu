import { AlertTriangle } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import type { DashboardAlertItem } from '../types/dashboard';

interface Props {
    alerts: DashboardAlertItem[];
}

export function DashboardAlerts({ alerts }: Props) {
    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-1.5">
            {alerts.map((alert) => {
                const isCritical = alert.type === 'critical';

                return (
                    <div
                        key={alert.id}
                        className={cn(
                            'flex items-start gap-2 rounded-lg border px-3 py-2 text-xs',
                            isCritical
                                ? 'border-destructive/25 bg-destructive/10 text-destructive'
                                : 'border-border bg-muted/60 text-foreground',
                        )}
                    >
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                        <span className="leading-snug">{alert.message}</span>
                    </div>
                );
            })}
        </div>
    );
}
