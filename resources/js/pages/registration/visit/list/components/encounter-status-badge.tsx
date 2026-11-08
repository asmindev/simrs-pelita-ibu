import { Badge } from '@/shared/ui/badge';

import type { EncounterStatus } from '../../../types/registration';

export function EncounterStatusBadge({ status }: { status: EncounterStatus }) {
    switch (status) {
        case 'arrived':
            return (
                <Badge variant="secondary" className="text-xs">
                    Menunggu
                </Badge>
            );
        case 'in_consultation':
            return (
                <Badge variant="default" className="text-xs">
                    Sedang Dilayani
                </Badge>
            );
        case 'finished':
            return (
                <Badge variant="outline" className="text-xs">
                    Selesai
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
    }
}
