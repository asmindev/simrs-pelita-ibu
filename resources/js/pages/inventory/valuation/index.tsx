import { Head } from '@inertiajs/react';
import { Boxes, Coins, Layers, Wallet } from 'lucide-react';

import { formatCurrency } from '@/shared/lib/format';
import { Card, CardContent } from '@/shared/ui/card';

import type { PaginatedData, StockValuationLayer } from '../types/inventory';
import { StockValuationTable } from './components/stock-valuation-table';

type Props = {
    valuationLayers: PaginatedData<StockValuationLayer>;
    filters: {
        search: string;
        direction: string;
    };
    statistics: {
        total_layers: number;
        total_valuation: number;
        remaining_qty: number;
        remaining_value: number;
    };
};

export default function InventoryValuationIndex({
    valuationLayers,
    filters,
    statistics,
}: Props) {
    return (
        <div className="space-y-3">
            <Head title="Valuasi Stok — Inventaris SIMRS" />

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Total Layer
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Layers className="size-3.5" />
                            </div>
                        </div>
                        <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                            {statistics.total_layers.toLocaleString('id-ID')}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Catatan lapisan nilai
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Total Nilai Valuasi
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Wallet className="size-3.5" />
                            </div>
                        </div>
                        <p
                            className="truncate text-lg leading-tight font-semibold text-primary tabular-nums"
                            title={formatCurrency(statistics.total_valuation)}
                        >
                            {formatCurrency(statistics.total_valuation)}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Akumulasi nilai persediaan
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Sisa Qty Layer
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                                <Boxes className="size-3.5" />
                            </div>
                        </div>
                        <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                            {statistics.remaining_qty.toLocaleString('id-ID')}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Unit belum terkonsumsi
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Sisa Nilai Layer
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <Coins className="size-3.5" />
                            </div>
                        </div>
                        <p
                            className="truncate text-lg leading-tight font-semibold text-foreground tabular-nums"
                            title={formatCurrency(statistics.remaining_value)}
                        >
                            {formatCurrency(statistics.remaining_value)}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Nilai layer tersisa
                        </p>
                    </CardContent>
                </Card>
            </div>

            <StockValuationTable layers={valuationLayers} filters={filters} />
        </div>
    );
}
