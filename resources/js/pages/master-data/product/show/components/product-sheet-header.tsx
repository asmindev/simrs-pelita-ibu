import { Package } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';

import { PRODUCT_TYPE_LABELS, type Product } from '../../types/product';

type Props = {
    product: Product;
};

export function ProductSheetHeader({ product }: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Package className="size-6" />
                </div>

                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Produk
                        </span>
                        <Badge
                            variant={
                                product.product_type === 'drug'
                                    ? 'default'
                                    : 'secondary'
                            }
                            className="text-[11px]"
                        >
                            {PRODUCT_TYPE_LABELS[product.product_type] ??
                                product.product_type}
                        </Badge>
                        <Badge
                            variant={
                                product.is_active ? 'outline' : 'secondary'
                            }
                            className="text-[11px]"
                        >
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {product.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>
                            SKU:{' '}
                            <span className="font-mono font-semibold text-foreground">
                                {product.code}
                            </span>
                        </span>
                        <span>&bull;</span>
                        <span>
                            Kategori:{' '}
                            <span className="font-medium text-foreground">
                                {product.category?.name ?? '-'}
                            </span>
                        </span>
                        <span>&bull;</span>
                        <span>
                            Satuan:{' '}
                            <span className="font-medium text-foreground">
                                {product.unit_of_measure}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
