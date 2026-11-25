import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowLeftRight,
    Boxes,
    DollarSign,
    Layers,
    Package,
    SlidersHorizontal,
    Warehouse,
} from 'lucide-react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import { StockAdjustDialog } from '../components/stock-adjust-dialog';
import {
    getBatchStatusBadge,
    getExpiryBadge,
} from '../components/stock-batch-columns';
import {
    StockMoveDialog,
    type StockMovePreset,
} from '../components/stock-move-dialog';
import type {
    ProductBatch,
    ProductInfo,
    StockLocation,
    StockMovement,
    StockValuationLayer,
} from '../types/stock';
import { BatchMovementTable } from './components/batch-movement-table';
import { BatchQuantTable } from './components/batch-quant-table';
import { BatchValuationTable } from './components/batch-valuation-table';

type Props = {
    batch: ProductBatch;
    movements: StockMovement[];
    valuationLayers: StockValuationLayer[];
    products: ProductInfo[];
    locations: StockLocation[];
};

export default function StockBatchShow({
    batch,
    movements,
    valuationLayers,
    products,
    locations,
}: Props) {
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [movePreset, setMovePreset] = useState<StockMovePreset | null>(null);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);

    const activeQuants = batch.stock_quants ?? [];
    const unit = batch.product?.unit_of_measure ?? '';
    const stockValue = batch.current_quantity * batch.buy_price;

    function openTransferDialog(sourceLocationId?: number) {
        const defaultSourceId =
            sourceLocationId ?? activeQuants[0]?.stock_location_id;

        setMovePreset({
            type: 'transfer',
            productId: batch.product_id,
            batchId: batch.id,
            sourceLocationId: defaultSourceId,
        });
        setIsMoveOpen(true);
    }

    return (
        <div className="space-y-3">
            <Head title={`Batch ${batch.batch_number} — Inventaris SIMRS`} />

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
                        Kembali ke Stok &amp; Batch
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <Can permission="pharmacy.stock.adjust">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={batch.current_quantity <= 0}
                            onClick={() => openTransferDialog()}
                            className="h-8 gap-1.5 bg-card text-xs font-medium"
                        >
                            <ArrowLeftRight className="size-3.5" />
                            Transfer / Stock Move
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => setIsAdjustOpen(true)}
                            className="h-8 gap-1.5 text-xs font-medium"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            Penyesuaian Stok (Opname)
                        </Button>
                    </Can>
                </div>
            </div>

            {/* Batch Sheet Card */}
            <Card className="gap-0 overflow-hidden py-0">
                <div className="space-y-4 border-b border-border/70 p-4 sm:p-5">
                    {/* Smart Stats Strip */}
                    <div className="flex flex-wrap justify-end gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <DollarSign className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-foreground tabular-nums">
                                    {formatCurrency(batch.buy_price)}
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
                                    {batch.current_quantity.toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    {unit}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Sisa Stok (Awal:{' '}
                                    {batch.initial_quantity.toLocaleString(
                                        'id-ID',
                                    )}
                                    )
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <Layers className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-primary tabular-nums">
                                    {formatCurrency(stockValue)}
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
                                    variant="outline"
                                    className="font-mono text-xs font-semibold text-primary"
                                >
                                    {batch.batch_number}
                                </Badge>
                                {batch.product?.code && (
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {batch.product.code}
                                    </span>
                                )}
                                {getBatchStatusBadge(batch)}
                                {getExpiryBadge(batch.expiry_date)}
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {batch.product?.name ?? '-'}
                            </h1>

                            <p className="text-xs text-muted-foreground">
                                {batch.product?.category?.name ??
                                    'Produk Inventaris'}
                                {batch.product?.form
                                    ? ` • ${batch.product.form}`
                                    : ''}
                                {unit ? ` • Satuan: ${unit}` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <CardContent className="p-4 sm:p-5">
                    <Tabs defaultValue="quants" className="space-y-4">
                        <TabsList className="h-9 flex-wrap">
                            <TabsTrigger
                                value="quants"
                                className="gap-1.5 text-xs"
                            >
                                <Warehouse className="size-3.5" />
                                <span>Distribusi Warehouse</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {activeQuants.length}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="movements"
                                className="gap-1.5 text-xs"
                            >
                                <ArrowLeftRight className="size-3.5" />
                                <span>Riwayat Stock Moves</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {movements.length}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="layers"
                                className="gap-1.5 text-xs"
                            >
                                <Layers className="size-3.5" />
                                <span>Valuation Layers</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {valuationLayers.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="quants" className="outline-none">
                            <BatchQuantTable
                                quants={activeQuants}
                                buyPrice={batch.buy_price}
                                unitOfMeasure={unit}
                                onTransferQuant={(quant) =>
                                    openTransferDialog(quant.stock_location_id)
                                }
                            />
                        </TabsContent>

                        <TabsContent value="movements" className="outline-none">
                            <BatchMovementTable movements={movements} />
                        </TabsContent>

                        <TabsContent value="layers" className="outline-none">
                            <BatchValuationTable layers={valuationLayers} />
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
                batch={isAdjustOpen ? batch : null}
                locations={locations}
                open={isAdjustOpen}
                onOpenChange={setIsAdjustOpen}
            />
        </div>
    );
}
