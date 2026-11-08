import { CheckCircle2, Clock, CreditCard, XCircle } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';

import type { InvoiceStatus } from '../../types/cashier';

type Props = {
    status: InvoiceStatus;
};

export function InvoiceStatusBadge({ status }: Props) {
    switch (status) {
        case 'draft':
        case 'finalized':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 size-3 text-muted-foreground" />
                    Menunggu Pembayaran
                </Badge>
            );
        case 'partially_paid':
            return (
                <Badge
                    variant="outline"
                    className="border-primary/50 text-xs text-primary"
                >
                    <CreditCard className="mr-1 size-3" />
                    Sebagian Terbayar
                </Badge>
            );
        case 'paid':
            return (
                <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="mr-1 size-3" />
                    Lunas
                </Badge>
            );
        case 'voided':
            return (
                <Badge variant="destructive" className="text-xs">
                    <XCircle className="mr-1 size-3" />
                    Dibatalkan (Void)
                </Badge>
            );
    }
}
