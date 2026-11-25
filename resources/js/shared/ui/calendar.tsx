import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { Button, buttonVariants } from '@/shared/ui/button';

const WEEKDAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;

const MONTHS_ID = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
] as const;

export interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    defaultMonth?: Date;
    fromYear?: number;
    toYear?: number;
    disabled?: (date: Date) => boolean;
    className?: string;
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

interface CalendarDayCell {
    date: Date;
    isOutside: boolean;
}

function buildMonthGrid(year: number, month: number): CalendarDayCell[] {
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const cells: CalendarDayCell[] = [];
    for (let i = 0; i < totalCells; i++) {
        const dayOffset = i - startWeekday + 1;
        const cellDate = new Date(year, month, dayOffset);
        cells.push({
            date: cellDate,
            isOutside: cellDate.getMonth() !== month,
        });
    }

    return cells;
}

export function Calendar({
    selected,
    onSelect,
    defaultMonth,
    fromYear,
    toYear,
    disabled,
    className,
}: CalendarProps) {
    const today = React.useMemo(() => startOfDay(new Date()), []);
    const initialAnchor = selected ?? defaultMonth ?? today;

    const minYear = fromYear ?? today.getFullYear() - 50;
    const maxYear = toYear ?? today.getFullYear() + 15;

    const [viewYear, setViewYear] = React.useState(initialAnchor.getFullYear());
    const [viewMonth, setViewMonth] = React.useState(initialAnchor.getMonth());

    React.useEffect(() => {
        if (selected) {
            setViewYear(selected.getFullYear());
            setViewMonth(selected.getMonth());
        }
    }, [selected]);

    const years = React.useMemo(() => {
        const list: number[] = [];
        for (let y = minYear; y <= maxYear; y++) {
            list.push(y);
        }
        return list;
    }, [minYear, maxYear]);

    const cells = React.useMemo(
        () => buildMonthGrid(viewYear, viewMonth),
        [viewYear, viewMonth],
    );

    const canGoPrev = viewYear > minYear || viewMonth > 0;
    const canGoNext = viewYear < maxYear || viewMonth < 11;

    function handlePrevMonth() {
        if (!canGoPrev) return;
        if (viewMonth === 0) {
            setViewYear((y) => y - 1);
            setViewMonth(11);
        } else {
            setViewMonth((m) => m - 1);
        }
    }

    function handleNextMonth() {
        if (!canGoNext) return;
        if (viewMonth === 11) {
            setViewYear((y) => y + 1);
            setViewMonth(0);
        } else {
            setViewMonth((m) => m + 1);
        }
    }

    function handleDayClick(cell: CalendarDayCell) {
        if (disabled?.(cell.date)) return;
        if (cell.isOutside) {
            setViewYear(cell.date.getFullYear());
            setViewMonth(cell.date.getMonth());
        }
        onSelect?.(cell.date);
    }

    return (
        <div
            data-slot="calendar"
            className={cn('w-fit bg-popover p-3 select-none', className)}
        >
            <div className="mb-3 flex items-center justify-between gap-1.5">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={handlePrevMonth}
                    disabled={!canGoPrev}
                    aria-label="Bulan sebelumnya"
                    className="size-7 shrink-0"
                >
                    <ChevronLeft className="size-3.5" />
                </Button>

                <div className="flex items-center gap-1">
                    <div className="relative flex items-center">
                        <select
                            aria-label="Pilih bulan"
                            value={viewMonth}
                            onChange={(e) =>
                                setViewMonth(Number(e.target.value))
                            }
                            className="h-7 cursor-pointer appearance-none rounded-md border border-input bg-background pr-6 pl-2 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                            {MONTHS_ID.map((monthName, idx) => (
                                <option key={monthName} value={idx}>
                                    {monthName}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1.5 size-3 text-muted-foreground" />
                    </div>

                    <div className="relative flex items-center">
                        <select
                            aria-label="Pilih tahun"
                            value={viewYear}
                            onChange={(e) =>
                                setViewYear(Number(e.target.value))
                            }
                            className="h-7 cursor-pointer appearance-none rounded-md border border-input bg-background pr-6 pl-2 text-xs font-medium text-foreground tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1.5 size-3 text-muted-foreground" />
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={handleNextMonth}
                    disabled={!canGoNext}
                    aria-label="Bulan berikutnya"
                    className="size-7 shrink-0"
                >
                    <ChevronRight className="size-3.5" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center">
                {WEEKDAYS_ID.map((day) => (
                    <div
                        key={day}
                        className="flex size-8 items-center justify-center text-[11px] font-medium text-muted-foreground"
                    >
                        {day}
                    </div>
                ))}

                {cells.map((cell) => {
                    const isSelected = Boolean(
                        selected && isSameDay(cell.date, selected),
                    );
                    const isToday = isSameDay(cell.date, today);
                    const isDisabled = Boolean(disabled?.(cell.date));

                    return (
                        <button
                            key={cell.date.toISOString()}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleDayClick(cell)}
                            aria-selected={isSelected}
                            className={cn(
                                buttonVariants({
                                    variant: isSelected ? 'default' : 'ghost',
                                    size: 'icon',
                                }),
                                'size-8 text-xs font-normal tabular-nums',
                                isSelected &&
                                    'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                                !isSelected &&
                                    isToday &&
                                    'bg-accent font-medium text-accent-foreground',
                                !isSelected &&
                                    cell.isOutside &&
                                    'text-muted-foreground/50',
                                isDisabled && 'pointer-events-none opacity-40',
                            )}
                        >
                            {cell.date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
