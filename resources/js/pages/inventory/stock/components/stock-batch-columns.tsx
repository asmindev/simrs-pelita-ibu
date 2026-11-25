import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';

import type { ProductBatch } from '../types/stock';

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

export function getBatchStatusBadge(batch: ProductBatch) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(batch.expiry_date);
    exp.setHours(0, 0, 0, 0);

    if (exp < today) {
        return (
            <Badge
                variant="destructive"
                className="px-1.5 py-0 text-[11px] leading-5"
            >
                Expired
            </Badge>
        );
    }

    if (batch.current_quantity <= 0) {
        return (
            <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[11px] leading-5"
            >
                Habis
            </Badge>
        );
    }

    return (
        <Badge variant="default" className="px-1.5 py-0 text-[11px] leading-5">
            Aktif / FEFO
        </Badge>
    );
}

export function createStockBatchColumns(): DataTableColumn<ProductBatch>[] {
    return [
        {
            key: 'locations',
            header: 'WH',
            className: 'py-1.5',
            render: (batch) => {
                const activeQuants = (batch.stock_quants ?? []).filter(
                    (q) => q.quantity > 0,
                );

                if (activeQuants.length === 0) {
                    return (
                        <span className="text-xs text-muted-foreground">-</span>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        {activeQuants.map((quant) => (
                            <Badge
                                key={quant.id}
                                variant="outline"
                                className="px-1.5 py-0 text-[11px] font-normal"
                                title={`${quant.location?.code ?? 'LOC'}: ${quant.quantity}`}
                            >
                                {quant.location?.name ??
                                    quant.location?.code ??
                                    '-'}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'product_name',
            header: 'Produk',
            className: 'max-w-52 py-1.5',
            render: (batch) => (
                <span
                    className="block truncate text-xs font-medium text-foreground"
                    title={
                        batch.product?.form
                            ? `${batch.product.name} (${batch.product.form})`
                            : batch.product?.name
                    }
                >
                    {batch.product?.name ?? '-'}
                </span>
            ),
        },
        {
            key: 'buy_price',
            header: 'Harga Beli',
            className: 'py-1.5 text-right',
            render: (batch) => (
                <span className="font-mono text-xs text-foreground tabular-nums">
                    {formatCurrency(batch.buy_price)}
                </span>
            ),
        },
        {
            key: 'current_quantity',
            header: 'Sisa Stok',
            className: 'py-1.5 text-right',
            render: (batch) => (
                <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                    {batch.current_quantity.toLocaleString('id-ID')}{' '}
                    <span className="font-normal text-muted-foreground">
                        {batch.product?.unit_of_measure ?? ''}
                    </span>
                </span>
            ),
        },
        {
            key: 'stock_value',
            header: 'Nilai Stok',
            className: 'py-1.5 text-right',
            render: (batch) => (
                <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                    {formatCurrency(batch.current_quantity * batch.buy_price)}
                </span>
            ),
        },
        {
            key: 'batch_number',
            header: 'No. Batch',
            className: 'py-1.5',
            render: (batch) => (
                <span className="font-mono text-xs font-semibold text-foreground">
                    {batch.batch_number}
                </span>
            ),
        },
    ];
}
