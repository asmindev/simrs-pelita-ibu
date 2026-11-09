import type { LucideIcon } from 'lucide-react';

import type { PermissionName } from '@/types/permissions';

export type NavSubItem = {
    title: string;
    routeName: string;
    permission?: PermissionName | readonly PermissionName[];
};

export type NavItem = {
    title: string;
    routeName: string;
    icon?: LucideIcon;
    permission?: PermissionName | readonly PermissionName[];
    items?: NavSubItem[];
};

export type NavSection = {
    label: string;
    items: NavItem[];
};
