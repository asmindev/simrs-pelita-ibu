import { Calendar as CalendarIcon, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

export interface DatePickerProps {
    id?: string;
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    modal?: boolean;
    fromYear?: number;
    toYear?: number;
    disabledDate?: (date: Date) => boolean;
    className?: string;
}

const DISPLAY_FORMATTER = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function parseIsoDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return undefined;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const parsed = new Date(year, month, day);
    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month ||
        parsed.getDate() !== day
    ) {
        return undefined;
    }
    return parsed;
}

function formatIsoDate(date: Date): string {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function DatePicker({
    id,
    value,
    onValueChange,
    placeholder = 'Pilih tanggal...',
    disabled = false,
    clearable = false,
    modal = false,
    fromYear,
    toYear,
    disabledDate,
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    const selectedDate = React.useMemo(() => parseIsoDate(value), [value]);

    function handleSelect(date: Date | undefined) {
        if (!date) return;
        onValueChange(formatIsoDate(date));
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'h-9 w-full justify-start bg-background text-left text-xs font-normal',
                        !selectedDate && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-1.5 size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">
                        {selectedDate
                            ? DISPLAY_FORMATTER.format(selectedDate)
                            : placeholder}
                    </span>
                    {clearable && selectedDate && (
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label="Hapus tanggal"
                            onClick={(e) => {
                                e.stopPropagation();
                                onValueChange('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onValueChange('');
                                }
                            }}
                            className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <X className="size-3" />
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="pointer-events-auto w-auto p-0"
                align="start"
            >
                <Calendar
                    selected={selectedDate}
                    onSelect={handleSelect}
                    fromYear={fromYear}
                    toYear={toYear}
                    disabled={disabledDate}
                />
            </PopoverContent>
        </Popover>
    );
}
