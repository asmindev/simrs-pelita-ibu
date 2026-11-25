import type { DataTableColumn } from "@/shared/components/data-table";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";

import type { WarehouseProductStockItem } from "../../types/inventory";

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
            <Badge
                variant="destructive"
                className="px-1.5 py-0 text-[11px] leading-5"
            >
                Kadaluwarsa ({formatDate(expiryDate)})
            </Badge>
        );
    }

    if (diffDays <= 30) {
        return (
            <Badge
                variant="outline"
                className="border-destructive/50 px-1.5 py-0 text-[11px] leading-5 text-destructive"
            >
                ED {diffDays} hr ({formatDate(expiryDate)})
            </Badge>
        );
    }

    return (
        <span className="font-mono text-xs text-muted-foreground">
            {formatDate(expiryDate)}
        </span>
    );
}

export function createStockItemColumns(): DataTableColumn<WarehouseProductStockItem>[] {
    return [
        {
            key: "warehouse",
            header: "Warehouses",
            className: "py-1.5",
            render: (item) => <span>{item.location_name}</span>,
        },
        {
            key: "product",
            header: "Produk",
            className: "max-w-64 py-1.5",
            render: (item) => (
                <span
                    className="block truncate text-xs font-medium text-foreground"
                    title={
                        item.product_form
                            ? `${item.product_name} (${item.product_form})`
                            : item.product_name
                    }
                >
                    {item.product_name}
                </span>
            ),
        },
        {
            key: "avg_buy_price",
            header: "Harga Beli",
            className: "py-1.5 text-right",
            render: (item) => (
                <span className="font-mono text-xs text-foreground tabular-nums">
                    {formatCurrency(item.avg_buy_price)}
                </span>
            ),
        },
        {
            key: "total_quantity",
            header: "Sisa Stok",
            className: "py-1.5 text-right",
            render: (item) => (
                <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                    {item.total_quantity.toLocaleString("id-ID")}{" "}
                    <span className="font-normal text-muted-foreground">
                        {item.unit_of_measure}
                    </span>
                </span>
            ),
        },
        {
            key: "total_value",
            header: "Nilai Stok",
            className: "py-1.5 text-right",
            render: (item) => (
                <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                    {formatCurrency(item.total_value)}
                </span>
            ),
        },
    ];
}
