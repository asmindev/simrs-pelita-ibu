import { Head } from '@inertiajs/react';
import { ArrowDownRight, ArrowLeftRight, Clock, History } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/shared/ui/card';

import { StockMoveDialog } from '../components/stock-move-dialog';
import type {
    PaginatedData,
    ProductInfo,
    StockLocation,
    StockMovement,
} from '../types/inventory';
import { StockMoveTable } from './components/stock-move-table';

type Props = {
    movements: PaginatedData<StockMovement>;
    products: ProductInfo[];
    locations: StockLocation[];
    filters: {
        search: string;
        type: string;
        location_id: string;
    };
    statistics: {
        total_moves: number;
        today_moves: number;
        inbound_count: number;
        transfer_count: number;
    };
};

export default function InventoryMovesIndex({
    movements,
    products,
    locations,
    filters,
    statistics,
}: Props) {
    const [isMoveOpen, setIsMoveOpen] = useState(false);

    return (
        <div className="space-y-3">
            <Head title="Pergerakan Stok — Inventaris SIMRS" />

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Total Pergerakan
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <History className="size-3.5" />
                            </div>
                        </div>
                        <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                            {statistics.total_moves.toLocaleString('id-ID')}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Seluruh mutasi tercatat
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Hari Ini
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Clock className="size-3.5" />
                            </div>
                        </div>
                        <p className="text-xl leading-tight font-semibold text-primary tabular-nums">
                            {statistics.today_moves.toLocaleString('id-ID')}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Transaksi stok hari ini
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Penerimaan (In)
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                                <ArrowDownRight className="size-3.5" />
                            </div>
                        </div>
                        <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                            {statistics.inbound_count.toLocaleString('id-ID')}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Barang masuk gudang
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm" className="[--card-spacing:--spacing(2.5)]">
                    <CardContent className="space-y-1 px-3">
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                Transfer Gudang
                            </p>
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <ArrowLeftRight className="size-3.5" />
                            </div>
                        </div>
                        <p className="text-xl leading-tight font-semibold text-foreground tabular-nums">
                            {statistics.transfer_count.toLocaleString('id-ID')}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            Distribusi antar lokasi
                        </p>
                    </CardContent>
                </Card>
            </div>

            <StockMoveTable
                movements={movements}
                locations={locations}
                filters={filters}
                onCreateMoveClick={() => setIsMoveOpen(true)}
            />

            <StockMoveDialog
                open={isMoveOpen}
                onOpenChange={setIsMoveOpen}
                products={products}
                locations={locations}
            />
        </div>
    );
}
