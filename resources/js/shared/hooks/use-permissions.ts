import { usePage } from '@inertiajs/react';

import type { Auth } from '@/types/auth';
import type { PermissionName, RoleName } from '@/types/permissions';

export function usePermissions() {
    const auth = usePage<{ auth?: Auth }>().props.auth;
    const permissions = auth?.permissions ?? [];
    const roles = auth?.roles ?? [];

    const can = (permission: PermissionName): boolean =>
        permissions.includes(permission);
    const canAny = (required: readonly PermissionName[]): boolean =>
        required.some(can);
    const canAll = (required: readonly PermissionName[]): boolean =>
        required.every(can);
    const hasRole = (role: RoleName): boolean => roles.includes(role);

    return {
        permissions,
        roles,
        can,
        canAny,
        canAll,
        hasRole,
    };
}
