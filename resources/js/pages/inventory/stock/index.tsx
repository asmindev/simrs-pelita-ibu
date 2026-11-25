import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';

import {
    StockMoveDialog,
    type StockMovePreset,
} from '../components/stock-move-dialog';
import type {
    PaginatedData,
    ProductInfo,
    StockLocation,
    WarehouseProductStockItem,
} from '../types/inventory';
import { NewStockDialog } from './components/new-stock-dialog';
import { StockFilters } from './components/stock-filters';
import { createStockItemColumns } from './components/stock-item-columns';
import { StockStatistics } from './components/stock-statistics';

type Props = {
    items: PaginatedData<WarehouseProductStockItem>;
    products: ProductInfo[];
    locations: StockLocation[];
    filters: {
        search: string;
        location_id: string;
        expiry: string;
    };
    statistics: {
        total_items: number;
        active_stock: number;
        expiring_soon: number;
        expired: number;
        total_valuation: number;
        today_moves: number;
    };
};

export default function InventoryStockIndex({
    items,
    products,
    locations,
    filters,
    statistics,
}: Props) {
    const [isAddStockOpen, setIsAddStockOpen] = useState(false);
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [movePreset, setMovePreset] = useState<StockMovePreset | null>(null);

    const columns = useMemo(() => createStockItemColumns(), []);

    function openNewMoveDialog(preset: StockMovePreset | null = null) {
        setMovePreset(preset);
        setIsMoveOpen(true);
    }

    return (
        <div className="space-y-3">
            <Head title="Stok Produk per Gudang — SIMRS" />

            <StockStatistics statistics={statistics} />

            <DataTable<WarehouseProductStockItem>
                columns={columns}
                rows={items.data}
                rowKey={(item) =>
                    `${item.stock_location_id}-${item.product_id}`
                }
                onRowClick={(item) =>
                    router.visit(
                        route('inventory.stock.show', {
                            warehouse: item.stock_location_id,
                            product: item.product_id,
                        }),
                    )
                }
                empty="Belum ada stok produk yang sesuai dengan filter."
                toolbar={
                    <StockFilters
                        filters={filters}
                        locations={locations}
                        current={items.data.length}
                        total={items.total}
                        onAddStockClick={() => setIsAddStockOpen(true)}
                        onCreateMoveClick={() => openNewMoveDialog()}
                    />
                }
                footer={
                    <Pagination
                        links={items.links}
                        from={items.from}
                        to={items.to}
                        total={items.total}
                    />
                }
            />

            <NewStockDialog
                open={isAddStockOpen}
                onOpenChange={setIsAddStockOpen}
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
        </div>
    );
}
