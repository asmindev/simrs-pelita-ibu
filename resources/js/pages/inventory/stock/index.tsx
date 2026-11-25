import { Head, router } from '@inertiajs/react';
import { ArrowLeftRight, Boxes, Layers, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import type {
    PaginatedData,
    ProductBatch,
    ProductInfo,
    StockLocation,
    StockMovement,
    StockQuant,
    StockValuationLayer,
} from './types/stock';
import { NewBatchDialog } from './components/new-batch-dialog';
import { StockAdjustDialog } from './components/stock-adjust-dialog';
import { createStockBatchColumns } from './components/stock-batch-columns';
import { StockFilters } from './components/stock-filters';
import {
    StockMoveDialog,
    type StockMovePreset,
} from './components/stock-move-dialog';
import { StockMoveTable } from './components/stock-move-table';
import { StockQuantTable } from './components/stock-quant-table';
import { StockStatistics } from './components/stock-statistics';
import { StockValuationTable } from './components/stock-valuation-table';

type Props = {
    activeTab: string;
    batches: PaginatedData<ProductBatch>;
    movements: PaginatedData<StockMovement>;
    valuationLayers: PaginatedData<StockValuationLayer>;
    quants: PaginatedData<StockQuant>;
    products: ProductInfo[];
    locations: StockLocation[];
    filters: {
        search: string;
        status: string;
        move_search: string;
        move_type: string;
        move_location_id: string;
        layer_search: string;
        layer_direction: string;
        quant_search: string;
        quant_location_id: string;
    };
    statistics: {
        total_batches: number;
        active_stock: number;
        expiring_soon: number;
        expired: number;
        total_valuation: number;
        today_moves: number;
    };
};

export default function PharmacyStockIndex({
    activeTab,
    batches,
    movements,
    valuationLayers,
    quants,
    products,
    locations,
    filters,
    statistics,
}: Props) {
    const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [movePreset, setMovePreset] = useState<StockMovePreset | null>(null);
    const [adjustingBatch, setAdjustingBatch] = useState<ProductBatch | null>(
        null,
    );

    const columns = useMemo(
        () =>
            createStockBatchColumns({
                onAdjust: (batch) => setAdjustingBatch(batch),
                onTransfer: (batch) => {
                    const firstQuant = (batch.stock_quants ?? []).find(
                        (q) => q.quantity > 0,
                    );
                    setMovePreset({
                        type: 'transfer',
                        productId: batch.product_id,
                        batchId: batch.id,
                        sourceLocationId: firstQuant?.stock_location_id,
                    });
                    setIsMoveOpen(true);
                },
            }),
        [],
    );

    function handleTabChange(nextTab: string) {
        router.get(
            route('inventory.stock.index'),
            { tab: nextTab },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openNewMoveDialog(preset: StockMovePreset | null = null) {
        setMovePreset(preset);
        setIsMoveOpen(true);
    }

    return (
        <div className="space-y-3">
            <Head title="Inventaris Stok & Stock Move — SIMRS" />

            <StockStatistics statistics={statistics} />

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-3"
            >
                <TabsList className="h-9 flex-wrap">
                    <TabsTrigger value="batches" className="gap-1.5 text-xs">
                        <Boxes className="size-3.5" />
                        <span>Batch &amp; FEFO</span>
                        <Badge
                            variant="secondary"
                            className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                        >
                            {batches.total}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger value="moves" className="gap-1.5 text-xs">
                        <ArrowLeftRight className="size-3.5" />
                        <span>Stock Moves</span>
                        <Badge
                            variant="secondary"
                            className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                        >
                            {movements.total}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger value="layers" className="gap-1.5 text-xs">
                        <Layers className="size-3.5" />
                        <span>Inventory Layer</span>
                        <Badge
                            variant="secondary"
                            className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                        >
                            {valuationLayers.total}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger value="quants" className="gap-1.5 text-xs">
                        <MapPin className="size-3.5" />
                        <span>Stok per Lokasi</span>
                        <Badge
                            variant="secondary"
                            className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                        >
                            {quants.total}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="batches" className="space-y-3 outline-none">
                    <DataTable<ProductBatch>
                        columns={columns}
                        rows={batches.data}
                        rowKey={(batch) => batch.id}
                        empty="Tidak ada batch produk yang sesuai dengan pencarian."
                        toolbar={
                            <StockFilters
                                filters={filters}
                                current={batches.data.length}
                                total={batches.total}
                                onAddBatchClick={() => setIsAddBatchOpen(true)}
                                onCreateMoveClick={() => openNewMoveDialog()}
                            />
                        }
                        footer={
                            <Pagination
                                links={batches.links}
                                from={batches.from}
                                to={batches.to}
                                total={batches.total}
                            />
                        }
                    />
                </TabsContent>

                <TabsContent value="moves" className="space-y-3 outline-none">
                    <StockMoveTable
                        movements={movements}
                        locations={locations}
                        filters={filters}
                        onCreateMoveClick={() => openNewMoveDialog()}
                    />
                </TabsContent>

                <TabsContent value="layers" className="space-y-3 outline-none">
                    <StockValuationTable
                        layers={valuationLayers}
                        filters={filters}
                    />
                </TabsContent>

                <TabsContent value="quants" className="space-y-3 outline-none">
                    <StockQuantTable
                        quants={quants}
                        locations={locations}
                        filters={filters}
                        onTransferQuant={(quant) =>
                            openNewMoveDialog({
                                type: 'transfer',
                                productId: quant.product_id,
                                batchId: quant.product_batch_id,
                                sourceLocationId: quant.stock_location_id,
                            })
                        }
                    />
                </TabsContent>
            </Tabs>

            <NewBatchDialog
                open={isAddBatchOpen}
                onOpenChange={setIsAddBatchOpen}
                products={products}
                locations={locations}
            />

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
