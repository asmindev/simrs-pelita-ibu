import { Link, router } from '@inertiajs/react';
import { ChevronRight, ChevronsUpDown, HeartPulse, LogOut } from 'lucide-react';
import type { ComponentProps } from 'react';

import { navigationSections } from '@/shared/config/navigation';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { isNavigationItemActive } from '@/shared/lib/nav';
import { route, useCurrentRoute } from '@/shared/lib/route';
import { cn } from '@/shared/lib/utils';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from '@/shared/ui/sidebar';
import type { User } from '@/types/auth';

type Props = ComponentProps<typeof Sidebar> & {
    name: string;
    logoUrl?: string | null;
    tagline?: string | null;
    user?: User | null;
};

const NAV_ACTIVE_CLASS =
    'data-active:bg-primary! data-active:text-primary-foreground! data-active:border-primary!';

const NAV_BUTTON_CLASS =
    'h-8 text-foreground/75 font-medium group-data-[collapsible=icon]:size-6! group-data-[collapsible=icon]:w-full! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export function AppSidebar({ name, logoUrl, tagline, user, ...props }: Props) {
    const { can, canAny } = usePermissions();
    const current = useCurrentRoute();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const sections = navigationSections
        .map((section) => ({
            ...section,
            items: section.items
                .map((item) => ({
                    ...item,
                    items: item.items?.filter(
                        (sub) =>
                            route().has(sub.routeName) &&
                            (!sub.permission ||
                                (typeof sub.permission === 'string'
                                    ? can(sub.permission)
                                    : canAny(sub.permission))),
                    ),
                }))
                .filter(
                    (item) =>
                        route().has(item.routeName) &&
                        (!item.permission ||
                            (typeof item.permission === 'string'
                                ? can(item.permission)
                                : canAny(item.permission))),
                ),
        }))
        .filter((section) => section.items.length > 0);

    function logout() {
        router.post(route('logout'));
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            tooltip={name}
                            className="border bg-muted"
                        >
                            <Link href={route('dashboard')}>
                                <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    {logoUrl ? (
                                        <img
                                            src={logoUrl}
                                            alt={name}
                                            className="size-full object-contain p-0.5"
                                        />
                                    ) : (
                                        <HeartPulse className="size-4" />
                                    )}
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold">
                                        {name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {tagline || 'SIMRS'}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {sections.map((section, index) => (
                    <div key={section.label}>
                        <SidebarGroup>
                            <SidebarGroupLabel>
                                {section.label}
                            </SidebarGroupLabel>
                            <SidebarMenu className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const hasSubItems = Boolean(
                                        item.items && item.items.length > 0,
                                    );
                                    const isSubItemActive = Boolean(
                                        item.items?.some((sub) =>
                                            isNavigationItemActive(
                                                sub,
                                                current,
                                            ),
                                        ),
                                    );
                                    const isActive =
                                        isNavigationItemActive(item, current) ||
                                        isSubItemActive;

                                    // 1. Collapsible Item with Submenu (When Sidebar Expanded)
                                    if (hasSubItems && !isCollapsed) {
                                        return (
                                            <Collapsible
                                                key={item.routeName}
                                                asChild
                                                defaultOpen={isActive}
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            tooltip={item.title}
                                                            isActive={isActive}
                                                            className={cn(
                                                                NAV_BUTTON_CLASS,
                                                                NAV_ACTIVE_CLASS,
                                                            )}
                                                        >
                                                            {Icon && <Icon />}
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.items?.map(
                                                                (sub) => {
                                                                    const isChildActive =
                                                                        isNavigationItemActive(
                                                                            sub,
                                                                            current,
                                                                            true,
                                                                        );
                                                                    return (
                                                                        <SidebarMenuSubItem
                                                                            key={
                                                                                sub.routeName
                                                                            }
                                                                        >
                                                                            <SidebarMenuSubButton
                                                                                asChild
                                                                                isActive={
                                                                                    isChildActive
                                                                                }
                                                                                className={cn(
                                                                                    NAV_BUTTON_CLASS,
                                                                                    isChildActive &&
                                                                                        'bg-primary/10 font-semibold text-primary',
                                                                                )}
                                                                            >
                                                                                <Link
                                                                                    href={route(
                                                                                        sub.routeName,
                                                                                    )}
                                                                                >
                                                                                    <span>
                                                                                        {
                                                                                            sub.title
                                                                                        }
                                                                                    </span>
                                                                                </Link>
                                                                            </SidebarMenuSubButton>
                                                                        </SidebarMenuSubItem>
                                                                    );
                                                                },
                                                            )}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        );
                                    }

                                    // 2. Collapsed Sidebar Popover with Submenu
                                    if (hasSubItems && isCollapsed) {
                                        return (
                                            <SidebarMenuItem
                                                key={item.routeName}
                                            >
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <SidebarMenuButton
                                                            tooltip={item.title}
                                                            isActive={isActive}
                                                            className={cn(
                                                                NAV_BUTTON_CLASS,
                                                                NAV_ACTIVE_CLASS,
                                                            )}
                                                        >
                                                            {Icon && <Icon />}
                                                        </SidebarMenuButton>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        side="right"
                                                        align="start"
                                                        className="w-48 p-1.5"
                                                    >
                                                        <p className="px-2 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                            {item.title}
                                                        </p>
                                                        <div className="mt-0.5 flex flex-col gap-0.5">
                                                            {item.items?.map(
                                                                (sub) => {
                                                                    const isChildActive =
                                                                        isNavigationItemActive(
                                                                            sub,
                                                                            current,
                                                                            true,
                                                                        );
                                                                    return (
                                                                        <Link
                                                                            key={
                                                                                sub.routeName
                                                                            }
                                                                            href={route(
                                                                                sub.routeName,
                                                                            )}
                                                                            className={cn(
                                                                                'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                                                                                isChildActive
                                                                                    ? 'bg-primary/10 font-semibold text-primary'
                                                                                    : 'text-foreground hover:bg-muted',
                                                                            )}
                                                                        >
                                                                            {
                                                                                sub.title
                                                                            }
                                                                        </Link>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </SidebarMenuItem>
                                        );
                                    }

                                    // 3. Plain Nav Item
                                    return (
                                        <SidebarMenuItem key={item.routeName}>
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.title}
                                                isActive={isActive}
                                                className={cn(
                                                    NAV_BUTTON_CLASS,
                                                    NAV_ACTIVE_CLASS,
                                                )}
                                            >
                                                <Link
                                                    href={route(item.routeName)}
                                                >
                                                    {Icon && <Icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                        {index < sections.length - 1 && (
                            <SidebarSeparator className="mx-0 group-data-[collapsible=icon]:hidden" />
                        )}
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        tooltip={user.name}
                                        className="border bg-muted data-[state=open]:bg-sidebar-accent"
                                    >
                                        <Avatar className="size-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            <span className="truncate font-semibold">
                                                {user.name}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {user.email}
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    align="end"
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="size-8 rounded-lg">
                                                <AvatarFallback className="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">
                                                    {user.name}
                                                </span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 size-4" />
                                        Keluar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
