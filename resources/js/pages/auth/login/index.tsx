import { Head, Link, useForm } from '@inertiajs/react';
import { HeartPulse } from 'lucide-react';
import type { FormEvent } from 'react';

import { ThemeSwitcher } from '@/shared/components/theme-switcher';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type Props = {
    canResetPassword: boolean;
    status?: string;
};

export default function Login({ canResetPassword, status }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    }

    return (
        <>
            <Head title="Masuk" />
            <main className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
                <div className="absolute top-4 right-4">
                    <ThemeSwitcher />
                </div>
                <Card className="w-full max-w-md border-border/80 shadow-xs">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <HeartPulse className="size-6" />
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight">
                            Masuk ke SIMRS
                        </CardTitle>
                        <CardDescription>
                            Gunakan kredensial akun rumah sakit Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {status && (
                                <div
                                    role="status"
                                    className="rounded-lg border border-border bg-secondary p-3 text-xs text-secondary-foreground"
                                >
                                    {status}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    placeholder="nama@rumahsakit.id"
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-muted-foreground hover:text-primary hover:underline"
                                        >
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(event) =>
                                        setData('password', event.target.value)
                                    }
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) =>
                                        setData('remember', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-normal text-muted-foreground"
                                >
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full shadow-xs"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
