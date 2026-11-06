import type { ReactNode } from 'react';

import { usePermissions } from '@/shared/hooks/use-permissions';
import type { PermissionName, RoleName } from '@/types/permissions';

type Props = {
    permission?: PermissionName | PermissionName[];
    role?: RoleName | RoleName[];
    mode?: 'any' | 'all';
    children: ReactNode;
    fallback?: ReactNode;
};

export function Can({
    permission,
    role,
    mode = 'any',
    children,
    fallback = null,
}: Props) {
    const { can, canAny, canAll, hasRole } = usePermissions();

    const permissionAllowed = (() => {
        if (!permission) {
            return true;
        }

        if (Array.isArray(permission)) {
            return mode === 'all' ? canAll(permission) : canAny(permission);
        }

        return can(permission);
    })();

    const roleAllowed = (() => {
        if (!role) {
            return true;
        }

        if (Array.isArray(role)) {
            return mode === 'all' ? role.every(hasRole) : role.some(hasRole);
        }

        return hasRole(role);
    })();

    return <>{permissionAllowed && roleAllowed ? children : fallback}</>;
}
