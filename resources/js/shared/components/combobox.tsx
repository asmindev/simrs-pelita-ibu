import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

export interface ComboboxOption {
    value: string;
    label: string;
    description?: string;
    badge?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    clearable?: boolean;
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = 'Pilih opsi...',
    searchPlaceholder = 'Cari...',
    emptyText = 'Tidak ditemukan hasil yang cocok.',
    disabled = false,
    className,
    clearable = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const selectedOption = React.useMemo(
        () => options.find((opt) => opt.value === value),
        [options, value],
    );

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                (opt.description &&
                    opt.description.toLowerCase().includes(q)) ||
                (opt.badge && opt.badge.toLowerCase().includes(q)),
        );
    }, [options, searchQuery]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'h-9 w-full justify-between bg-background text-xs font-normal',
                        !selectedOption && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-2"
                align="start"
            >
                <div className="relative mb-2 flex items-center">
                    <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 bg-background pr-7 pl-8 text-xs"
                        autoFocus
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </div>

                <div className="max-h-60 space-y-1 overflow-y-auto">
                    {clearable && value && (
                        <button
                            type="button"
                            onClick={() => {
                                onValueChange('');
                                setOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted"
                        >
                            <span>-- Kosongkan Pilihan --</span>
                        </button>
                    )}

                    {filteredOptions.length === 0 ? (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            {emptyText}
                        </div>
                    ) : (
                        filteredOptions.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onValueChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                                        isSelected
                                            ? 'bg-primary/10 font-medium text-primary'
                                            : 'text-foreground hover:bg-muted',
                                    )}
                                >
                                    <div className="min-w-0 flex-1 pr-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate">
                                                {option.label}
                                            </span>
                                            {option.badge && (
                                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                                    {option.badge}
                                                </span>
                                            )}
                                        </div>
                                        {option.description && (
                                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                                {option.description}
                                            </p>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <Check className="size-3.5 shrink-0 text-primary" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
