import type { DataTableColumn } from '@/shared/components/data-table';
import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';

import { PRODUCT_TYPE_LABELS, type Product } from '../../types/product';

export function createProductColumns(): DataTableColumn<Product>[] {
    return [
        {
            key: 'code',
            header: 'Kode',
            render: (product) => (
                <span className="font-mono text-xs font-medium tabular-nums">
                    {product.code}
                </span>
            ),
        },
        {
            key: 'name',
            header: 'Nama Produk',
            render: (product) => (
                <span className="font-medium text-foreground">
                    {product.name}
                </span>
            ),
        },
        {
            key: 'product_type',
            header: 'Tipe',
            render: (product) => (
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
            ),
        },
        {
            key: 'category',
            header: 'Kategori',
            render: (product) => (
                <Badge variant="outline">{product.category?.name ?? '-'}</Badge>
            ),
        },
        {
            key: 'spec',
            header: 'Sediaan / Spesifikasi',
            render: (product) => (
                <span className="text-sm text-muted-foreground">
                    {product.product_type === 'drug' &&
                    (product.form || product.strength)
                        ? [product.form, product.strength]
                              .filter(Boolean)
                              .join(' · ')
                        : product.description || product.unit_of_measure}
                </span>
            ),
        },
        {
            key: 'price',
            header: 'Harga Satuan',
            className: 'text-right',
            render: (product) => (
                <span className="font-medium tabular-nums">
                    {formatCurrency(product.price)}
                </span>
            ),
        },
        {
            key: 'manufacturer',
            header: 'Pabrik / Merk',
            render: (product) => (
                <span className="text-sm text-muted-foreground">
                    {product.manufacturer || '-'}
                </span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (product) => (
                <Badge variant={product.is_active ? 'default' : 'outline'}>
                    {product.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
    ];
}
