import { Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { route } from 'ziggy-js';

import { navigation } from '@/shared/config/navigation';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { cn } from '@/shared/lib/utils';
import type { Auth } from '@/types/auth';
import type { Flash } from '@/types/flash';

type Props = {
    children: ReactNode;
};

export default function AppLayout({ children }: Props) {
    const { auth, name, flash } = usePage<{
        auth: Auth;
        name: string;
        flash: Flash;
    }>().props;
    const { can } = usePermissions();
    const current = route().current();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b">
                <div className="flex h-12 items-center gap-6 px-4">
                    <Link href={route('home')} className="font-semibold">
                        {name}
                    </Link>

                    <nav className="flex items-center gap-1 text-sm">
                        {navigation
                            .filter((item) => route().has(item.routeName))
                            .filter(
                                (item) =>
                                    !item.permission || can(item.permission),
                            )
                            .map((item) => (
                                <Link
                                    key={item.routeName}
                                    href={route(item.routeName)}
                                    className={cn(
                                        'rounded px-2 py-1',
                                        current === item.routeName
                                            ? 'bg-muted'
                                            : 'hover:bg-muted/60',
                                    )}
                                >
                                    {item.title}
                                </Link>
                            ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-3 text-sm">
                        <span>{auth.user?.name}</span>
                        <button
                            type="button"
                            onClick={() => router.post(route('logout'))}
                            className="underline underline-offset-4"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4">
                {flash?.success && (
                    <div
                        role="status"
                        className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                    >
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div
                        role="alert"
                        className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {flash.error}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
