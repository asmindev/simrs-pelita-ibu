import { router } from '@inertiajs/react';
import { Layers } from 'lucide-react';

import { route } from '@/shared/lib/route';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import { type RoleOption } from '../types/dashboard';

interface RoleSwitcherProps {
    activeRole: string;
    availableRoles: RoleOption[];
}

export function RoleSwitcher({
    activeRole,
    availableRoles,
}: RoleSwitcherProps) {
    if (availableRoles.length <= 1) {
        return null;
    }

    const handleChange = (newRole: string) => {
        router.visit(route('dashboard', { role: newRole }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers className="size-3.5" />
                <span className="hidden sm:inline">Peran Dashboard:</span>
            </span>
            <Select value={activeRole} onValueChange={handleChange}>
                <SelectTrigger className="w-[180px] sm:w-[220px]">
                    <SelectValue placeholder="Pilih Peran" />
                </SelectTrigger>
                <SelectContent>
                    {availableRoles.map((role) => (
                        <SelectItem key={role.key} value={role.key}>
                            {role.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
