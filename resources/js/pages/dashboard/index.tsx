import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { navigation } from '@/shared/config/navigation';
import { PageHeader } from '@/shared/components/page-header';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';

export default function Dashboard() {
    const { can, canAny } = usePermissions();

    const modules = navigation.filter(
        (item) =>
            item.routeName !== 'dashboard' &&
            route().has(item.routeName) &&
            (!item.permission ||
                (typeof item.permission === 'string'
                    ? can(item.permission)
                    : canAny(item.permission))),
    );

    return (
        <>
            <Head title="Dashboard" />
            <PageHeader
                title="Dashboard"
                description="Ringkasan modul yang dapat Anda akses."
            />

            {modules.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {modules.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.routeName}
                                href={route(item.routeName)}
                                className="group"
                            >
                                <Card className="h-full border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:bg-accent/30 hover:shadow-xs">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2.5">
                                            {Icon && (
                                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                                    <Icon className="size-4.5" />
                                                </span>
                                            )}
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription>
                                            Buka modul {item.title}.
                                        </CardDescription>
                                        <CardAction>
                                            <ArrowUpRight className="size-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Kelola data dan aktivitas{' '}
                                            {item.title.toLowerCase()}.
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        Belum ada modul yang dapat diakses.
                    </CardContent>
                </Card>
            )}
        </>
    );
}
