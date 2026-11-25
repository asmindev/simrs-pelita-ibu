import { Link } from '@inertiajs/react';
import { ExternalLink, Receipt, Wallet } from 'lucide-react';

import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { Encounter } from '../../../types/registration';

type Props = {
    encounter: Encounter;
};

function renderInvoiceBadge(status: string) {
    switch (status) {
        case 'paid':
            return (
                <Badge variant="default" className="text-xs">
                    Lunas
                </Badge>
            );
        case 'partially_paid':
            return (
                <Badge variant="secondary" className="text-xs">
                    Dibayar Sebagian
                </Badge>
            );
        case 'finalized':
            return (
                <Badge variant="secondary" className="text-xs">
                    Siap Bayar
                </Badge>
            );
        case 'void':
            return (
                <Badge
                    variant="outline"
                    className="border-destructive text-xs text-destructive"
                >
                    Dibatalkan
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    Draft
                </Badge>
            );
    }
}

export function VisitBillingTab({ encounter }: Props) {
    const invoices = encounter.invoices ?? [];

    if (invoices.length === 0) {
        return (
            <Card className="gap-0 border-border bg-card py-0 shadow-xs">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Receipt className="size-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        Belum Ada Tagihan Kasir
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Tagihan kunjungan akan muncul di sini saat invoice
                        dibuat.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {invoices.map((invoice) => {
                const total = Number(invoice.total_amount ?? 0);
                const paid = Number(invoice.paid_amount ?? 0);
                const balance = Math.max(0, total - paid);

                return (
                    <Card
                        key={invoice.id}
                        className="gap-0 border-border bg-card py-0 shadow-xs"
                    >
                        <CardHeader className="border-b border-border px-3.5 py-2 [.border-b]:pb-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="font-mono text-xs font-bold text-foreground">
                                        {invoice.invoice_number}
                                    </CardTitle>
                                    {renderInvoiceBadge(invoice.status)}
                                    {invoice.created_at && (
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatDateTime(invoice.created_at)}
                                        </span>
                                    )}
                                </div>

                                <Button
                                    asChild
                                    size="sm"
                                    className="h-7 gap-1.5 text-xs"
                                >
                                    <Link
                                        href={route(
                                            'cashier.invoices.show',
                                            invoice.id,
                                        )}
                                    >
                                        <Wallet className="size-3.5" />
                                        Buka Detail di Kasir
                                        <ExternalLink className="size-3" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-3.5">
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                                    <div className="text-[11px] text-muted-foreground">
                                        Total Tagihan
                                    </div>
                                    <div className="mt-0.5 font-mono text-sm font-bold text-foreground tabular-nums">
                                        {formatCurrency(total)}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                                    <div className="text-[11px] text-muted-foreground">
                                        Sudah Dibayar
                                    </div>
                                    <div className="mt-0.5 font-mono text-sm font-bold text-foreground tabular-nums">
                                        {formatCurrency(paid)}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                                    <div className="text-[11px] text-muted-foreground">
                                        Sisa Tagihan
                                    </div>
                                    <div className="mt-0.5 font-mono text-sm font-bold text-primary tabular-nums">
                                        {formatCurrency(balance)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
