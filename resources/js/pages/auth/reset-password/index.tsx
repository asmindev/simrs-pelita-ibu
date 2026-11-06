import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { route } from '@/shared/lib/route';

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
            <Head title="Reset password" />
            <main className="flex min-h-screen items-center justify-center p-6">
                <form onSubmit={submit} className="w-full max-w-sm space-y-4">
                    <h1 className="text-xl font-semibold">Reset password</h1>

                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            autoComplete="username"
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
                            autoComplete="new-password"
                            passwordrules={passwordRules}
                            autoFocus
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

                    <div className="space-y-1">
                        <label
                            htmlFor="password_confirmation"
                            className="text-sm"
                        >
                            Confirm password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(event) =>
                                setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-md border px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        Reset password
                    </button>
                </form>
            </main>
        </>
    );
}
