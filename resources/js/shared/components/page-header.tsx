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
                'mb-4 flex flex-wrap items-start justify-between gap-3',
                className,
            )}
        >
            <div className="space-y-1">
                <h1 className="text-lg font-semibold">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">{actions}</div>
            )}
        </div>
    );
}
