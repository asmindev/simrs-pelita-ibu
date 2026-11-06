import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    const pages = links.slice(1, -1);

    return (
        <div className="flex flex-col items-center justify-between gap-2 bg-muted/20 px-3 py-2 sm:flex-row">
            <p className="order-2 text-xs text-muted-foreground sm:order-1">
                Menampilkan{' '}
                <span className="font-medium">
                    {from ?? 0}–{to ?? 0}
                </span>{' '}
                dari <span className="font-medium">{total}</span> data
            </p>

            <div className="order-1 flex items-center gap-1 sm:order-2">
                {previous && previous.url ? (
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                    >
                        <Link href={previous.url} preserveScroll>
                            <ChevronLeft className="size-3.5" />
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled
                    >
                        <ChevronLeft className="size-3.5" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                    </Button>
                )}

                {pages.map((page, index) => {
                    if (page.label === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-1 text-xs text-muted-foreground"
                            >
                                …
                            </span>
                        );
                    }

                    if (!/^\d+$/.test(page.label)) {
                        return null;
                    }

                    if (page.active) {
                        return (
                            <span
                                key={page.label}
                                className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary px-1.5 text-xs font-medium text-primary-foreground"
                            >
                                {page.label}
                            </span>
                        );
                    }

                    if (!page.url) {
                        return null;
                    }

                    return (
                        <Button
                            key={page.label}
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 min-w-7 px-1.5 text-xs"
                        >
                            <Link href={page.url} preserveScroll>
                                {page.label}
                            </Link>
                        </Button>
                    );
                })}

                {next && next.url ? (
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                    >
                        <Link href={next.url} preserveScroll>
                            <span className="hidden sm:inline">Berikutnya</span>
                            <ChevronRight className="size-3.5" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled
                    >
                        <span className="hidden sm:inline">Berikutnya</span>
                        <ChevronRight className="size-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
}
