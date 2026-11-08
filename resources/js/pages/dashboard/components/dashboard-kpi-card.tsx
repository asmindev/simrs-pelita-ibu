import { type LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/shared/ui/card';

interface DashboardKpiCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    badge?: string;
}

export function DashboardKpiCard({
    title,
    value,
    description,
    icon: Icon,
    badge,
}: DashboardKpiCardProps) {
    return (
        <Card className="border-border/80 bg-card shadow-xs">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {title}
                    </span>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4.5" />
                    </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                        {value}
                    </span>
                    {badge && (
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {badge}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
