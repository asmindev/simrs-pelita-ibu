import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type Props = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    current?: number;
    total?: number;
    children?: ReactNode;
    actions?: ReactNode;
    className?: string;
};

export function TableToolbar({
    title,
    description,
    icon: Icon,
    current,
    total,
    children,
    actions,
    className,
}: Props) {
    return (
        <div
            className={cn(
                'mb-1 flex flex-col gap-2.5 px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0 shrink-0">
                <h2 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase sm:text-sm">
                    {Icon && <Icon className="size-3.5 sm:size-4" />}
                    {title}
                    {(current !== undefined || total !== undefined) && (
                        <span className="font-mono text-xs font-normal text-muted-foreground">
                            ({current ?? 0} / {total ?? 0})
                        </span>
                    )}
                </h2>
                {description && (
                    <p className="text-[11px] text-muted-foreground sm:text-xs">
                        {description}
                    </p>
                )}
            </div>

            {(children || actions) && (
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    {children}
                    {actions}
                </div>
            )}
        </div>
    );
}
