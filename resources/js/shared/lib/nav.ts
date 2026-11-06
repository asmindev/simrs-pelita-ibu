import { navigation } from '@/shared/config/navigation';
import type { NavItem } from '@/shared/types/navigation';

type NavigationRoute = Pick<NavItem, 'routeName'>;

export function isNavigationItemActive(
    item: NavigationRoute,
    current: string | undefined,
): boolean {
    if (!current) {
        return false;
    }

    if (current === item.routeName) {
        return true;
    }

    const prefix = item.routeName.endsWith('.index')
        ? item.routeName.slice(0, -'.index'.length)
        : item.routeName;

    return current.startsWith(`${prefix}.`);
}

export function findActiveNavigationItem(
    current: string | undefined,
): NavItem | undefined {
    return navigation.find((item) => isNavigationItemActive(item, current));
}
