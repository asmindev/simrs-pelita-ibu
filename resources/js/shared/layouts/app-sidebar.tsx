import { Link, router } from '@inertiajs/react';
import { ChevronsUpDown, HeartPulse, LogOut } from 'lucide-react';
import type { ComponentProps } from 'react';

import { navigationSections } from '@/shared/config/navigation';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { isNavigationItemActive } from '@/shared/lib/nav';
import { route, useCurrentRoute } from '@/shared/lib/route';
import { cn } from '@/shared/lib/utils';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
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
    SidebarRail,
    SidebarSeparator,
} from '@/shared/ui/sidebar';
import type { User } from '@/types/auth';

type Props = ComponentProps<typeof Sidebar> & {
    name: string;
    user?: User | null;
};

const NAV_ACTIVE_CLASS =
    'data-active:bg-primary! data-active:text-primary-foreground! data-active:border-primary!';

const NAV_BUTTON_CLASS =
    'h-7 text-foreground/50 group-data-[collapsible=icon]:size-6! group-data-[collapsible=icon]:w-full!';

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

export function AppSidebar({ name, user, ...props }: Props) {
    const { can, canAny } = usePermissions();
    const current = useCurrentRoute();
    const sections = navigationSections
        .map((section) => ({
            ...section,
            items: section.items.filter(
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
                                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <HeartPulse className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold">
                                        {name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        SIMRS
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

                                    return (
                                        <SidebarMenuItem key={item.routeName}>
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.title}
                                                isActive={isNavigationItemActive(
                                                    item,
                                                    current,
                                                )}
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
                                    sideOffset={4}
                                    className="w-60"
                                >
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5">
                                            <Avatar className="size-8 rounded-lg">
                                                <AvatarFallback className="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex min-w-0 flex-col gap-0.5">
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
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={logout}
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Keluar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SidebarMenuButton
                                type="button"
                                tooltip="Keluar"
                                className={cn(
                                    NAV_BUTTON_CLASS,
                                    NAV_ACTIVE_CLASS,
                                )}
                                onClick={logout}
                            >
                                <LogOut />
                                <span>Keluar</span>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
