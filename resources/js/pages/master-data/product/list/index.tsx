import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { Can } from '@/shared/components/can';
import { DataTable } from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { ProductFilters } from '../components/product-filters';
import type {
    Paginated,
    Product,
    ProductCategory,
    ProductFilters as Filters,
    ProductTypeOption,
} from '../types/product';
import { createProductColumns } from './components/product-columns';

type Props = {
    products: Paginated<Product>;
    categories: ProductCategory[];
    productTypes: ProductTypeOption[];
    filters: Filters;
};

export default function ProductIndex({
    products,
    categories,
    productTypes,
    filters,
}: Props) {
    const columns = useMemo(() => createProductColumns(), []);

    return (
        <div className="space-y-4">
            <Head title="Master Produk — SIMRS" />

            <DataTable
                columns={columns}
                rows={products.data}
                rowKey={(product) => product.id}
                onRowClick={(product) =>
                    router.visit(route('master-data.products.show', product.id))
                }
                empty="Belum ada data produk yang sesuai."
                toolbar={
                    <ProductFilters
                        filters={filters}
                        categories={categories}
                        productTypes={productTypes}
                        current={products.data.length}
                        total={products.total}
                        actions={
                            <Can permission="master-data.product.manage">
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs"
                                >
                                    <Link
                                        href={route(
                                            'master-data.products.create',
                                        )}
                                    >
                                        <Plus className="size-3.5" />
                                        Tambah Produk
                                    </Link>
                                </Button>
                            </Can>
                        }
                    />
                }
                footer={
                    <Pagination
                        links={products.links}
                        from={products.from}
                        to={products.to}
                        total={products.total}
                    />
                }
            />
        </div>
    );
}
