import { router } from '@inertiajs/react';
import { Eye, MoreHorizontal, XCircle } from 'lucide-react';

import type { DataTableColumn } from '@/shared/components/data-table';
import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type { BreakGlassGrant } from '../../../types/rbac';
import { BreakGlassStatusBadge } from './break-glass-status-badge';

type ColumnOptions = {
    onReview: (grant: BreakGlassGrant) => void;
};

export function getBreakGlassColumns({
    onReview,
}: ColumnOptions): DataTableColumn<BreakGlassGrant>[] {
    return [
        {
            key: 'patient',
            header: 'Pasien & Alasan',
            render: (grant) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-foreground">
                        {grant.patient?.name}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                        RM: {grant.patient?.medical_record_number}
                    </div>
                    <div className="line-clamp-1 text-[11px] text-muted-foreground italic">
                        "{grant.reason}"
                    </div>
                </div>
            ),
        },
        {
            key: 'user',
            header: 'Pemohon Akses',
            render: (grant) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground">
                        {grant.user?.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {grant.user?.email}
                    </div>
                </div>
            ),
        },
        {
            key: 'time',
            header: 'Waktu Akses',
            render: (grant) => (
                <div className="space-y-0.5 text-xs">
                    <div className="text-foreground">
                        Mulai: {formatDateTime(grant.granted_at)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Kedaluwarsa: {formatDateTime(grant.expires_at)}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (grant) => <BreakGlassStatusBadge grant={grant} />,
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (grant) => {
                const isRevoked = Boolean(grant.revoked_at);
                const isExpired = new Date(grant.expires_at) < new Date();

                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="size-8 p-0"
                                >
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">Buka menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                    onClick={() => onReview(grant)}
                                >
                                    <Eye className="mr-2 size-3.5" />
                                    Tinjau Akses
                                </DropdownMenuItem>
                                {!isRevoked && !isExpired && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    'Cabut akses break-glass darurat ini sekarang?',
                                                )
                                            ) {
                                                router.post(
                                                    route(
                                                        'rbac.break-glass.revoke',
                                                        grant.id,
                                                    ),
                                                );
                                            }
                                        }}
                                    >
                                        <XCircle className="mr-2 size-3.5" />
                                        Cabut Akses
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}
