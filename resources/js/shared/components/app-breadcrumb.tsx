import { Link, usePage } from '@inertiajs/react';
import { Home } from 'lucide-react';
import { useMemo } from 'react';

import { navigationSections } from '@/shared/config/navigation';
import { route, useCurrentRoute } from '@/shared/lib/route';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';

type BreadcrumbSegment = {
    title: string;
    routeName?: string;
    url?: string;
};

export function AppBreadcrumb() {
    const currentRoute = useCurrentRoute();
    const { url } = usePage();

    const segments = useMemo<BreadcrumbSegment[]>(() => {
        if (!currentRoute || currentRoute === 'dashboard') {
            return [{ title: 'Dashboard' }];
        }

        const items: BreadcrumbSegment[] = [
            { title: 'Dashboard', routeName: 'dashboard' },
        ];

        // 1. Coba temukan rute di navigationSections
        let matchedSectionLabel: string | null = null;
        let matchedParentTitle: string | null = null;
        let matchedParentRoute: string | null = null;
        let matchedItemTitle: string | null = null;

        for (const section of navigationSections) {
            for (const navItem of section.items) {
                // Check direct match
                if (navItem.routeName === currentRoute) {
                    matchedSectionLabel = section.label;
                    matchedItemTitle = navItem.title;
                    break;
                }

                // Check sub items
                if (navItem.items) {
                    const subMatch = navItem.items.find(
                        (sub) => sub.routeName === currentRoute,
                    );
                    if (subMatch) {
                        matchedSectionLabel = section.label;
                        matchedParentTitle = navItem.title;
                        matchedParentRoute = navItem.routeName;
                        matchedItemTitle = subMatch.title;
                        break;
                    }
                }

                // Check prefix match for detail/edit/show pages (e.g. master-data.patients.create matches master-data.patients.index)
                const baseRoute = navItem.routeName.endsWith('.index')
                    ? navItem.routeName.slice(0, -'.index'.length)
                    : navItem.routeName;

                if (currentRoute.startsWith(`${baseRoute}.`)) {
                    matchedSectionLabel = section.label;
                    matchedParentTitle = navItem.title;
                    matchedParentRoute = navItem.routeName;

                    const actionPart = currentRoute.slice(baseRoute.length + 1);
                    if (actionPart === 'create') {
                        matchedItemTitle = `Tambah ${navItem.title}`;
                    } else if (actionPart === 'edit') {
                        matchedItemTitle = `Ubah ${navItem.title}`;
                    } else if (actionPart === 'show') {
                        matchedItemTitle = `Detail ${navItem.title}`;
                    } else if (actionPart === 'payments.index') {
                        matchedItemTitle = 'Riwayat Pembayaran';
                    } else {
                        matchedItemTitle = navItem.title;
                    }
                    break;
                }
            }
            if (matchedItemTitle) break;
        }

        if (
            matchedParentTitle &&
            matchedItemTitle &&
            matchedParentTitle !== matchedItemTitle
        ) {
            items.push({
                title: matchedParentTitle,
                routeName: matchedParentRoute ?? undefined,
            });
            items.push({
                title: matchedItemTitle,
            });
        } else if (matchedItemTitle) {
            if (
                matchedSectionLabel &&
                matchedSectionLabel !== 'Utama' &&
                matchedSectionLabel !== matchedItemTitle
            ) {
                items.push({ title: matchedSectionLabel });
            }
            items.push({ title: matchedItemTitle });
        } else {
            // Fallback parsing dari URL path
            const pathParts = url.split('?')[0].split('/').filter(Boolean);
            pathParts.forEach((part, index) => {
                const isLast = index === pathParts.length - 1;
                const formatted = part
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                items.push({
                    title: formatted,
                    url: isLast
                        ? undefined
                        : `/${pathParts.slice(0, index + 1).join('/')}`,
                });
            });
        }

        return items;
    }, [currentRoute, url]);

    return (
        <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList className="text-xs">
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1;

                    return (
                        <BreadcrumbItem key={`${segment.title}-${index}`}>
                            {index > 0 && <BreadcrumbSeparator />}
                            {isLast ? (
                                <BreadcrumbPage className="font-semibold text-foreground">
                                    {segment.title}
                                </BreadcrumbPage>
                            ) : segment.routeName ? (
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={route(segment.routeName)}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {index === 0 && (
                                            <Home className="mr-1 inline-block size-3 -translate-y-0.5 text-muted-foreground" />
                                        )}
                                        {segment.title}
                                    </Link>
                                </BreadcrumbLink>
                            ) : segment.url ? (
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={segment.url}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {segment.title}
                                    </Link>
                                </BreadcrumbLink>
                            ) : (
                                <span className="text-muted-foreground">
                                    {segment.title}
                                </span>
                            )}
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
