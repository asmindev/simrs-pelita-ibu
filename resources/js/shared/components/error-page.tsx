import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { Button } from '@/shared/ui/button';

type Props = {
    status: number;
    title: string;
    description: string;
};

export function ErrorPage({ status, title, description }: Props) {
    return (
        <>
            <Head title={title} />

            <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    {status}
                </p>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
                <Button asChild>
                    <Link href={route('home')}>Kembali ke beranda</Link>
                </Button>
            </div>
        </>
    );
}
