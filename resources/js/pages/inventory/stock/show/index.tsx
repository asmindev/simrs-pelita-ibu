import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowLeftRight,
    Boxes,
    CalendarClock,
    DollarSign,
    Layers,
    Package,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import {
    StockMoveDialog,
    type StockMovePreset,
} from '../../components/stock-move-dialog';
import type {
    ProductBatch,
    ProductInfo,
    StockLocation,
    StockMovement,
    StockQuant,
} from '../../types/inventory';
import { StockAdjustDialog } from '../components/stock-adjust-dialog';
import { getExpiryBadge } from '../components/stock-item-columns';
import { StockExpiryTable } from './components/stock-expiry-table';
import { StockItemMovementTable } from './components/stock-item-movement-table';

type Props = {
    warehouse: StockLocation;
    product: ProductInfo;
    quants: StockQuant[];
    movements: StockMovement[];
    summary: {
        total_quantity: number;
        total_value: number;
        avg_buy_price: number;
        nearest_expiry: string | null;
    };
    products: ProductInfo[];
    locations: StockLocation[];
};

export default function InventoryStockShow({
    warehouse,
    product,
    quants,
    movements,
    summary,
    products,
    locations,
}: Props) {
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [movePreset, setMovePreset] = useState<StockMovePreset | null>(null);
    const [adjustingBatch, setAdjustingBatch] = useState<ProductBatch | null>(
        null,
    );

    const firstBatch = quants[0]?.product_batch ?? null;

    function openTransferDialog(batchId?: number) {
        setMovePreset({
            type: 'transfer',
            productId: product.id,
            batchId,
            sourceLocationId: warehouse.id,
        });
        setIsMoveOpen(true);
    }

    return (
        <div className="space-y-3">
            <Head
                title={`${product.name} (${warehouse.name}) — Inventaris SIMRS`}
            />

            {/* Control Panel */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit px-2 text-xs text-muted-foreground hover:text-foreground"
                    asChild
                >
                    <Link href={route('inventory.stock.index')}>
                        <ArrowLeft className="mr-1.5 size-3.5" />
                        Kembali ke Stok Produk
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <Can permission="pharmacy.stock.adjust">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={summary.total_quantity <= 0}
                            onClick={() => openTransferDialog()}
                            className="h-8 gap-1.5 bg-card text-xs font-medium"
                        >
                            <ArrowLeftRight className="size-3.5" />
                            Transfer Stok
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            disabled={!firstBatch}
                            onClick={() =>
                                firstBatch && setAdjustingBatch(firstBatch)
                            }
                            className="h-8 gap-1.5 text-xs font-medium"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            Penyesuaian Stok (Opname)
                        </Button>
                    </Can>
                </div>
            </div>

            {/* Stock Sheet Card */}
            <Card className="gap-0 overflow-hidden py-0">
                <div className="space-y-4 border-b border-border/70 p-4 sm:p-5">
                    {/* Smart Stats Strip */}
                    <div className="flex flex-wrap justify-end gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <DollarSign className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-foreground tabular-nums">
                                    {formatCurrency(summary.avg_buy_price)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Harga Beli
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <Boxes className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-foreground tabular-nums">
                                    {summary.total_quantity.toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    {product.unit_of_measure}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Sisa Stok di Gudang
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <Layers className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-primary tabular-nums">
                                    {formatCurrency(summary.total_value)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Nilai Stok
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header Info */}
                    <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                            <Package className="size-8 stroke-[1.5]" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="default"
                                    className="text-[11px]"
                                >
                                    {warehouse.name}
                                </Badge>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {product.code}
                                </span>
                                {summary.nearest_expiry &&
                                    getExpiryBadge(summary.nearest_expiry)}
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {product.name}
                            </h1>

                            <p className="text-xs text-muted-foreground">
                                {product.category?.name ?? 'Produk Inventaris'}
                                {product.form ? ` • ${product.form}` : ''}
                                {` • Satuan: ${product.unit_of_measure}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <CardContent className="p-4 sm:p-5">
                    <Tabs defaultValue="expiry" className="space-y-4">
                        <TabsList className="h-9 flex-wrap">
                            <TabsTrigger
                                value="expiry"
                                className="gap-1.5 text-xs"
                            >
                                <CalendarClock className="size-3.5" />
                                <span>Kedaluwarsa &amp; Opname</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {quants.length}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="movements"
                                className="gap-1.5 text-xs"
                            >
                                <ArrowLeftRight className="size-3.5" />
                                <span>Riwayat Pergerakan</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {movements.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="expiry" className="outline-none">
                            <StockExpiryTable
                                quants={quants}
                                unitOfMeasure={product.unit_of_measure}
                                onTransfer={(quant) =>
                                    openTransferDialog(quant.product_batch_id)
                                }
                                onAdjust={(batch) => setAdjustingBatch(batch)}
                            />
                        </TabsContent>

                        <TabsContent value="movements" className="outline-none">
                            <StockItemMovementTable movements={movements} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <StockMoveDialog
                open={isMoveOpen}
                onOpenChange={setIsMoveOpen}
                products={products}
                locations={locations}
                preset={movePreset}
            />

            <StockAdjustDialog
                batch={adjustingBatch}
                locations={locations}
                open={adjustingBatch !== null}
                onOpenChange={(open) => !open && setAdjustingBatch(null)}
            />
        </div>
    );
}
