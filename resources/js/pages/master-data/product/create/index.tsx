import { Head } from '@inertiajs/react';

import { Card, CardContent } from '@/shared/ui/card';

import { ProductForm } from '../components/product-form';
import type { ProductCategory, ProductTypeOption } from '../types/product';

type Props = {
    categories: ProductCategory[];
    productTypes: ProductTypeOption[];
};

export default function ProductCreate({ categories, productTypes }: Props) {
    return (
        <div className="space-y-4">
            <Head title="Tambah Produk — SIMRS" />

            <Card>
                <CardContent className="pt-6">
                    <ProductForm
                        categories={categories}
                        productTypes={productTypes}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
