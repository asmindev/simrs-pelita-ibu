import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';

import type { BreakGlassGrant } from '../../../types/rbac';

export function BreakGlassStatusBadge({ grant }: { grant: BreakGlassGrant }) {
    const isRevoked = Boolean(grant.revoked_at);
    const isReviewed = Boolean(grant.reviewed_at);
    const isExpired = new Date(grant.expires_at) < new Date();

    if (isRevoked) {
        return (
            <Badge variant="destructive" className="text-[11px]">
                <XCircle className="mr-1 size-3" />
                Dicabut (Revoked)
            </Badge>
        );
    }

    if (!isExpired) {
        return (
            <Badge
                variant="outline"
                className="border-primary/50 text-[11px] text-primary"
            >
                <Clock className="mr-1 size-3" />
                Aktif Digunakan
            </Badge>
        );
    }

    if (isReviewed) {
        return (
            <Badge variant="default" className="text-[11px]">
                <CheckCircle2 className="mr-1 size-3" />
                Sudah Ditinjau
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className="text-[11px]">
            <AlertTriangle className="mr-1 size-3 text-muted-foreground" />
            Menunggu Review
        </Badge>
    );
}
