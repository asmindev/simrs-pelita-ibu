import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { route } from '@/shared/lib/route';

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
            <Head title="Forgot password" />
            <main className="flex min-h-screen items-center justify-center p-6">
                <form onSubmit={submit} className="w-full max-w-sm space-y-4">
                    <h1 className="text-xl font-semibold">Forgot password</h1>

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

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        Email password reset link
                    </button>

                    <Link
                        href={route('login')}
                        className="block text-center text-sm underline"
                    >
                        Back to log in
                    </Link>
                </form>
            </main>
        </>
    );
}
