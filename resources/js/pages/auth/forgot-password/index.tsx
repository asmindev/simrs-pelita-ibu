import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';
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
    status?: string;
};

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('password.email'));
    }

    return (
        <>
            <Head title="Lupa Password" />
            <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
                <Card className="w-full max-w-md border-border/80 shadow-xs">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <KeyRound className="size-6" />
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight">
                            Lupa Password
                        </CardTitle>
                        <CardDescription>
                            Masukkan email akun Anda. Kami akan mengirimkan
                            tautan untuk mengatur ulang password.
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

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full shadow-xs"
                            >
                                {processing
                                    ? 'Mengirim...'
                                    : 'Kirim Tautan Reset'}
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
