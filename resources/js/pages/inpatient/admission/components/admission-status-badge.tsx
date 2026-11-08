import { LogOut, UserCheck } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';

import type { AdmissionStatus } from '../../types/inpatient';

export function AdmissionStatusBadge({ status }: { status: AdmissionStatus }) {
    switch (status) {
        case 'active':
            return (
                <Badge variant="outline" className="text-xs">
                    <UserCheck className="mr-1 size-3 text-primary" />
                    Sedang Dirawat
                </Badge>
            );
        case 'discharged':
            return (
                <Badge variant="secondary" className="text-xs">
                    <LogOut className="mr-1 size-3 text-muted-foreground" />
                    Sudah Pulang
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    {status}
                </Badge>
            );
    }
}
