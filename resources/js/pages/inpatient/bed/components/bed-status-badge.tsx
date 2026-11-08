import { CheckCircle2, Users, Wrench } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';

import type { BedClass, BedStatus } from '../../types/inpatient';

export function BedClassBadge({ bedClass }: { bedClass: BedClass }) {
    switch (bedClass) {
        case 'vip':
            return (
                <Badge variant="default" className="text-xs">
                    VIP
                </Badge>
            );
        case 'icu':
            return (
                <Badge variant="destructive" className="text-xs">
                    ICU
                </Badge>
            );
        case 'class_1':
            return (
                <Badge variant="secondary" className="text-xs">
                    Kelas 1
                </Badge>
            );
        case 'class_2':
            return (
                <Badge variant="outline" className="text-xs">
                    Kelas 2
                </Badge>
            );
        case 'class_3':
            return (
                <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                >
                    Kelas 3
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-xs">
                    {bedClass}
                </Badge>
            );
    }
}

export function BedStatusBadge({ status }: { status: BedStatus }) {
    switch (status) {
        case 'available':
            return (
                <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="mr-1 size-3 text-primary" />
                    Tersedia
                </Badge>
            );
        case 'occupied':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Users className="mr-1 size-3 text-foreground" />
                    Terisi Pasien
                </Badge>
            );
        case 'maintenance':
            return (
                <Badge variant="destructive" className="text-xs">
                    <Wrench className="mr-1 size-3" />
                    Perawatan
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
