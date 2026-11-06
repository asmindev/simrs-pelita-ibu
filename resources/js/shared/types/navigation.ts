import type { PermissionName } from '@/types/permissions';

export type NavItem = {
    title: string;
    routeName: string;
    permission?: PermissionName;
};
