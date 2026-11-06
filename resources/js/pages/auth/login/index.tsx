import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { route } from '@/shared/lib/route';

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
            <Head title="Log in" />
            <main className="flex min-h-screen items-center justify-center p-6">
                <form onSubmit={submit} className="w-full max-w-sm space-y-4">
                    <h1 className="text-xl font-semibold">Log in</h1>

                    {status && (
                        <p className="text-sm text-green-600">{status}</p>
                    )}

                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            className="w-full rounded-md border px-3 py-2"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            className="w-full rounded-md border px-3 py-2"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(event) =>
                                setData('remember', event.target.checked)
                            }
                        />
                        Remember me
                    </label>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        Log in
                    </button>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="block text-center text-sm underline"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </form>
            </main>
        </>
    );
}
