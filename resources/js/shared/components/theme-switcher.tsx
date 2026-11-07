import { Check, Monitor, Moon, Sun } from 'lucide-react';

import { useAppearance, type Appearance } from '@/shared/hooks/use-appearance';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const options: Array<{
    value: Appearance;
    label: string;
    icon: typeof Sun;
}> = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Monitor },
];

type Props = {
    className?: string;
    align?: 'start' | 'center' | 'end';
};

export function ThemeSwitcher({ className, align = 'end' }: Props) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={className}
                    aria-label="Pilih tema tampilan"
                >
                    <Sun className="size-4 scale-100 rotate-0 transition-transform duration-200 dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-200 dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Ganti tema</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="min-w-36">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isActive = appearance === option.value;

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onSelect={() => updateAppearance(option.value)}
                            className="flex cursor-pointer items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <Icon className="size-4 text-muted-foreground" />
                                <span>{option.label}</span>
                            </span>
                            {isActive && (
                                <Check className="size-3.5 text-primary" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
