import {
    ArrowLeftRight,
    MoreHorizontal,
    SlidersHorizontal,
} from 'lucide-react';

import { Can } from '@/shared/components/can';
import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import type { DrugBatch } from '../../types/pharmacy';

export function getExpiryBadge(expiryDate: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
        (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
        return (
            <Badge variant="destructive" className="text-xs">
                Kadaluwarsa ({formatDate(expiryDate)})
            </Badge>
        );
    }

    if (diffDays <= 30) {
        return (
            <Badge
                variant="outline"
                className="border-destructive/50 text-xs text-destructive"
            >
                Mendekati ED: {diffDays} hr ({formatDate(expiryDate)})
            </Badge>
        );
    }

    return (
        <span className="font-mono text-xs text-muted-foreground">
            {formatDate(expiryDate)}
        </span>
    );
}

export function createStockBatchColumns(options: {
    onAdjust: (batch: DrugBatch) => void;
    onTransfer: (batch: DrugBatch) => void;
}): DataTableColumn<DrugBatch>[] {
    return [
        {
            key: 'batch_drug',
            header: 'No. Batch & Obat',
            render: (batch) => (
                <div className="space-y-0.5">
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {batch.batch_number}
                    </span>
                    <div className="text-xs font-medium text-foreground">
                        {batch.drug?.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {batch.drug?.code} &bull; {batch.drug?.form}
                    </div>
                </div>
            ),
        },
        {
            key: 'expiry_date',
            header: 'Kedaluwarsa (FEFO)',
            render: (batch) => getExpiryBadge(batch.expiry_date),
        },
        {
            key: 'current_quantity',
            header: 'Sisa Stok',
            render: (batch) => {
                const activeQuants = (batch.stock_quants ?? []).filter(
                    (q) => q.quantity > 0,
                );

                return (
                    <div className="space-y-1">
                        <div className="text-xs font-bold text-foreground tabular-nums">
                            {batch.current_quantity}{' '}
                            <span className="font-normal text-muted-foreground">
                                {batch.drug?.unit_of_measure}
                            </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            Awal: {batch.initial_quantity}
                        </div>
                        {activeQuants.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {activeQuants.map((quant) => (
                                    <Badge
                                        key={quant.id}
                                        variant="outline"
                                        className="px-1.5 py-0 font-mono text-[10px] font-normal"
                                    >
                                        {quant.location?.code ?? 'LOC'}:{' '}
                                        {quant.quantity}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'buy_price',
            header: 'Harga Beli',
            render: (batch) => (
                <div className="space-y-0.5">
                    <span className="font-mono text-xs text-foreground tabular-nums">
                        {formatCurrency(batch.buy_price)}
                    </span>
                    <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                        Nilai:{' '}
                        {formatCurrency(
                            batch.current_quantity * batch.buy_price,
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (batch) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const exp = new Date(batch.expiry_date);
                exp.setHours(0, 0, 0, 0);
                const isExpired = exp < today;

                if (isExpired) {
                    return (
                        <Badge variant="destructive" className="text-xs">
                            Expired
                        </Badge>
                    );
                }
                if (batch.current_quantity <= 0) {
                    return (
                        <Badge variant="secondary" className="text-xs">
                            Habis
                        </Badge>
                    );
                }
                return (
                    <Badge variant="default" className="text-xs">
                        Aktif / FEFO
                    </Badge>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (batch) => (
                <Can permission="pharmacy.stock.adjust">
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="size-8 p-0"
                                >
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">
                                        Buka menu aksi
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    onClick={() => options.onTransfer(batch)}
                                    disabled={batch.current_quantity <= 0}
                                >
                                    <ArrowLeftRight className="mr-2 size-3.5" />
                                    Transfer / Stock Move
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => options.onAdjust(batch)}
                                >
                                    <SlidersHorizontal className="mr-2 size-3.5" />
                                    Penyesuaian Stok (Opname)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </Can>
            ),
        },
    ];
}
