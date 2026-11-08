import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';

import type { PrescriptionStatus } from '../../types/pharmacy';

export function PrescriptionStatusBadge({
    status,
}: {
    status: PrescriptionStatus;
}) {
    switch (status) {
        case 'submitted':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 size-3" />
                    Menunggu Verifikasi
                </Badge>
            );
        case 'verified':
            return (
                <Badge variant="default" className="text-xs">
                    <ShieldCheck className="mr-1 size-3" />
                    Siap Dispensing
                </Badge>
            );
        case 'dispensed':
            return (
                <Badge variant="outline" className="border-border text-xs">
                    <CheckCircle2 className="mr-1 size-3" />
                    Selesai Dispensing
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="border-destructive text-xs text-destructive"
                >
                    Dibatalkan
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
