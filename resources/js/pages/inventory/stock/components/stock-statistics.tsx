import {
    AlertTriangle,
    ArrowLeftRight,
    Boxes,
    Clock,
    Layers,
    PackageCheck,
} from 'lucide-react';

import { formatCurrency } from '@/shared/lib/format';
import { Card, CardContent } from '@/shared/ui/card';

type Props = {
    statistics: {
        total_items: number;
        active_stock: number;
        expiring_soon: number;
        expired: number;
        total_valuation: number;
        today_moves: number;
    };
};

export function StockStatistics({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                <CardContent className="space-y-1 px-3">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Item di Gudang
                        </p>
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Boxes className="size-3.5" />
                        </div>
                    </div>
                    <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                        {statistics.total_items.toLocaleString('id-ID')}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        Produk aktif tersimpan
                    </p>
                </CardContent>
            </Card>

            <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                <CardContent className="space-y-1 px-3">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Total Stok Fisik
                        </p>
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <PackageCheck className="size-3.5" />
                        </div>
                    </div>
                    <p className="text-xl leading-tight font-semibold text-primary tabular-nums">
                        {statistics.active_stock.toLocaleString('id-ID')}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        Akumulasi seluruh gudang
                    </p>
                </CardContent>
            </Card>

            <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                <CardContent className="space-y-1 px-3">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Nilai Inventory
                        </p>
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Layers className="size-3.5" />
                        </div>
                    </div>
                    <p
                        className="truncate text-lg leading-tight font-semibold text-foreground tabular-nums"
                        title={formatCurrency(statistics.total_valuation)}
                    >
                        {formatCurrency(statistics.total_valuation)}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        Valuasi persediaan
                    </p>
                </CardContent>
            </Card>

            <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                <CardContent className="space-y-1 px-3">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Pergerakan Hari Ini
                        </p>
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                            <ArrowLeftRight className="size-3.5" />
                        </div>
                    </div>
                    <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                        {statistics.today_moves.toLocaleString('id-ID')}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        Mutasi tercatat hari ini
                    </p>
                </CardContent>
            </Card>

            <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                <CardContent className="space-y-1 px-3">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Mendekati ED
                        </p>
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Clock className="size-3.5" />
                        </div>
                    </div>
                    <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                        {statistics.expiring_soon.toLocaleString('id-ID')}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        &le; 30 hari (FEFO)
                    </p>
                </CardContent>
            </Card>

            <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                <CardContent className="space-y-1 px-3">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Sudah Kadaluwarsa
                        </p>
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                            <AlertTriangle className="size-3.5" />
                        </div>
                    </div>
                    <p className="text-xl leading-tight font-semibold text-destructive tabular-nums">
                        {statistics.expired.toLocaleString('id-ID')}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        Perlu karantina / opname
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
