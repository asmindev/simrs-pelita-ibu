import type { ReactNode } from 'react';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

export type FilterPopoverProps = {
    title?: string;
    description?: string;
    activeCount?: number;
    children: ReactNode;
    onApply?: () => void;
    onReset?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerLabel?: string;
    className?: string;
    contentClassName?: string;
};

export function FilterPopover({
    title = 'Filter',
    description,
    activeCount = 0,
    children,
    onApply,
    onReset,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    triggerLabel = 'Filter',
    className,
    contentClassName,
}: FilterPopoverProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled ? setControlledOpen! : setUncontrolledOpen;

    const handleApply = () => {
        setOpen(false);
        onApply?.();
    };

    const handleReset = () => {
        onReset?.();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={activeCount > 0 ? 'secondary' : 'outline'}
                    size="sm"
                    className={cn('h-8 gap-1.5 text-xs', className)}
                >
                    <SlidersHorizontal className="size-3.5" />
                    <span>{triggerLabel}</span>
                    {activeCount > 0 && (
                        <Badge
                            variant="default"
                            className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none"
                        >
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className={cn(
                    'w-80 space-y-3.5 border-border bg-popover p-4',
                    contentClassName,
                )}
            >
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">
                            {title}
                        </h4>
                        {description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {activeCount > 0 && onReset && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Reset
                        </Button>
                    )}
                </div>

                <div className="space-y-3 text-xs">{children}</div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setOpen(false)}
                    >
                        Batal
                    </Button>
                    {onApply && (
                        <Button
                            type="button"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={handleApply}
                        >
                            Terapkan Filter
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
