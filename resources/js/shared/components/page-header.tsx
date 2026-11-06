import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type Props = {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
};

export function PageHeader({ title, description, actions, className }: Props) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}
