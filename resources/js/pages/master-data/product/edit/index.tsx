import { Head } from '@inertiajs/react';

import { Card, CardContent } from '@/shared/ui/card';

import { ProductForm } from '../components/product-form';
import type {
    Product,
    ProductCategory,
    ProductTypeOption,
} from '../types/product';

type Props = {
    product: Product;
    categories: ProductCategory[];
    productTypes: ProductTypeOption[];
};

export default function ProductEdit({
    product,
    categories,
    productTypes,
}: Props) {
    return (
        <div className="space-y-4">
            <Head title={`Edit Produk — ${product.name}`} />

            <Card>
                <CardContent className="pt-6">
                    <ProductForm
                        product={product}
                        categories={categories}
                        productTypes={productTypes}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
