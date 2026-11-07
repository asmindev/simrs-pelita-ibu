import { Head, Link, usePage } from '@inertiajs/react';
import { HeartPulse } from 'lucide-react';

import { ThemeSwitcher } from '@/shared/components/theme-switcher';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

export default function Welcome() {
    const { name } = usePage<{ name: string }>().props;

    return (
        <>
            <Head title="Selamat Datang" />
            <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-foreground">
                <div className="absolute top-4 right-4">
                    <ThemeSwitcher />
                </div>
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20">
                        <HeartPulse className="size-7" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {name ?? 'SIMRS'}
                        </h1>
                        <p className="max-w-md text-sm text-muted-foreground">
                            Sistem Informasi Manajemen Rumah Sakit terpadu untuk
                            pelayanan klinis, rekam medis, dan administrasi.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <Button
                        asChild
                        size="lg"
                        className="px-6 font-medium shadow-xs"
                    >
                        <Link href={route('login')}>Masuk ke Sistem</Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Akses khusus staf medis dan administrasi rumah sakit
                    </span>
                </div>
            </main>
        </>
    );
}
