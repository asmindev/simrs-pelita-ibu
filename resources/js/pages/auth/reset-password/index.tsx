import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import type { FormEvent } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type Props = {
    email: string;
    token: string;
    passwordRules: string;
};

export default function ResetPassword({ email, token, passwordRules }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('password.update'));
    }

    return (
        <>
            <Head title="Atur Ulang Password" />
            <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
                <Card className="w-full max-w-md border-border/80 shadow-xs">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <LockKeyhole className="size-6" />
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight">
                            Atur Ulang Password
                        </CardTitle>
                        <CardDescription>
                            Tentukan password baru untuk akun rumah sakit Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    autoComplete="username"
                                    readOnly
                                    className="bg-muted text-muted-foreground"
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password Baru</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    autoComplete="new-password"
                                    autoFocus
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
                                {passwordRules && (
                                    <p className="text-xs text-muted-foreground">
                                        {passwordRules}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi Password Baru
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(event) =>
                                        setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.password_confirmation && (
                                    <p className="text-xs text-destructive">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full shadow-xs"
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Password Baru'}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary hover:underline"
                                >
                                    <ArrowLeft className="size-3.5" />
                                    Kembali ke halaman masuk
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
