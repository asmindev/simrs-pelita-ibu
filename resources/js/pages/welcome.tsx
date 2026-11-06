import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { name } = usePage<{ name: string }>().props;

    return (
        <>
            <Head title="Welcome" />
            <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
                <h1 className="text-3xl font-semibold">{name}</h1>
                <Link
                    href="/login"
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                >
                    Log in
                </Link>
            </main>
        </>
    );
}
