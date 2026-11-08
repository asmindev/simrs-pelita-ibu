import { Badge } from '@/shared/ui/badge';

export function UserRoleBadge({ role }: { role: string }) {
    if (role === 'super-admin') {
        return (
            <Badge variant="default" className="text-[11px] font-semibold">
                Super Admin
            </Badge>
        );
    }

    if (role === 'doctor') {
        return (
            <Badge variant="secondary" className="text-[11px]">
                Dokter
            </Badge>
        );
    }

    if (role === 'nurse') {
        return (
            <Badge variant="secondary" className="text-[11px]">
                Perawat
            </Badge>
        );
    }

    if (role === 'pharmacist') {
        return (
            <Badge variant="outline" className="border-border text-[11px]">
                Apoteker / Farmasi
            </Badge>
        );
    }

    if (role === 'cashier') {
        return (
            <Badge variant="outline" className="border-border text-[11px]">
                Kasir
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="text-[11px]">
            {role}
        </Badge>
    );
}
