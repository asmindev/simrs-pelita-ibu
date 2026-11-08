import {
    Activity,
    CheckCircle2,
    Clock,
    Microscope,
    Radiation,
} from 'lucide-react';

import { Badge } from '@/shared/ui/badge';

import type {
    DiagnosticOrderStatus,
    DiagnosticOrderType,
} from '../../types/diagnostics';

export function DiagnosticTypeBadge({ type }: { type: DiagnosticOrderType }) {
    switch (type) {
        case 'laboratory':
            return (
                <Badge variant="outline" className="text-xs">
                    <Microscope className="mr-1 size-3 text-primary" />
                    Laboratorium
                </Badge>
            );
        case 'radiology':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Radiation className="mr-1 size-3" />
                    Radiologi
                </Badge>
            );
    }
}

export function DiagnosticStatusBadge({
    status,
}: {
    status: DiagnosticOrderStatus;
}) {
    switch (status) {
        case 'ordered':
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 size-3 text-muted-foreground" />
                    Menunggu Diproses
                </Badge>
            );
        case 'in_progress':
            return (
                <Badge
                    variant="outline"
                    className="border-primary/50 text-xs text-primary"
                >
                    <Activity className="mr-1 size-3" />
                    Sedang Diperiksa
                </Badge>
            );
        case 'completed':
            return (
                <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="mr-1 size-3" />
                    Hasil Rilis
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge variant="destructive" className="text-xs">
                    Dibatalkan
                </Badge>
            );
    }
}
