import { Link } from '@inertiajs/react';

import { Button } from '@/shared/ui/button';

type LinkItem = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    links: LinkItem[];
    from: number | null;
    to: number | null;
    total: number;
};

export function Pagination({ links, from, to, total }: Props) {
    if (total === 0) {
        return null;
    }

    const previous = links[0];
    const next = links[links.length - 1];

    return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
                {from ?? 0}–{to ?? 0} dari {total}
            </span>
            <div className="flex gap-2">
                {previous && previous.url ? (
                    <Button asChild variant="outline" size="sm">
                        <Link href={previous.url} preserveScroll>
                            Sebelumnya
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Sebelumnya
                    </Button>
                )}
                {next && next.url ? (
                    <Button asChild variant="outline" size="sm">
                        <Link href={next.url} preserveScroll>
                            Berikutnya
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Berikutnya
                    </Button>
                )}
            </div>
        </div>
    );
}
