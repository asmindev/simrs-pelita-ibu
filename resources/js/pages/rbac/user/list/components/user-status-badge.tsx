import { Badge } from '@/shared/ui/badge';

export function UserRoleBadge({ role }: { role: string }) {
    if (role === 'super-admin') {
        return (
            <Badge variant="default" className="text-[11px] font-semibold">
                super-admin
            </Badge>
        );
    }

    if (role === 'doctor' || role === 'nurse') {
        return (
            <Badge variant="secondary" className="text-[11px]">
                {role}
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="text-[11px]">
            {role}
        </Badge>
    );
}
