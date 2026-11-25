import { router } from '@inertiajs/react';
import { Package, Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { FilterPopover } from '@/shared/components/filter-popover';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import type {
    ProductCategory,
    ProductFilters as Filters,
    ProductTypeOption,
} from '../types/product';

type Props = {
    filters: Filters;
    categories: ProductCategory[];
    productTypes: ProductTypeOption[];
    current: number;
    total: number;
    actions?: ReactNode;
};

export function ProductFilters({
    filters,
    categories,
    productTypes,
    current,
    total,
    actions,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [productType, setProductType] = useState(
        filters.product_type || 'all',
    );
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const activeFilterCount =
        (productType !== 'all' ? 1 : 0) +
        (categoryId !== 'all' ? 1 : 0) +
        (status !== 'all' ? 1 : 0);

    function executeFilter(nextParams?: {
        search?: string;
        productType?: string;
        categoryId?: string;
        status?: string;
    }) {
        const s = nextParams?.search !== undefined ? nextParams.search : search;
        const pt =
            nextParams?.productType !== undefined
                ? nextParams.productType
                : productType;
        const c =
            nextParams?.categoryId !== undefined
                ? nextParams.categoryId
                : categoryId;
        const st =
            nextParams?.status !== undefined ? nextParams.status : status;

        router.get(
            route('master-data.products.index'),
            {
                search: s || undefined,
                product_type: pt === 'all' ? undefined : pt,
                category_id: c === 'all' ? undefined : c,
                status: st === 'all' ? undefined : st,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        executeFilter();
    }

    function applyPopoverFilter() {
        executeFilter();
    }

    function resetPopoverFilters() {
        setProductType('all');
        setCategoryId('all');
        setStatus('all');
        executeFilter({ productType: 'all', categoryId: 'all', status: 'all' });
    }

    return (
        <TableToolbar
            title="Katalog Produk"
            description="Manajemen master produk terpadu: obat, alat kesehatan/BMHP, reagen, dan perlengkapan umum."
            icon={Package}
            current={current}
            total={total}
            actions={actions}
        >
            <form
                onSubmit={submit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="product-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Nama, kode, atau produsen"
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari produk"
                    />
                </div>

                <Button
                    type="submit"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                >
                    Cari
                </Button>

                <FilterPopover
                    title="Filter Produk"
                    activeCount={activeFilterCount}
                    onApply={applyPopoverFilter}
                    onReset={resetPopoverFilters}
                >
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="product-type-filter"
                                className="text-xs font-medium"
                            >
                                Tipe Produk
                            </Label>
                            <Select
                                value={productType}
                                onValueChange={setProductType}
                            >
                                <SelectTrigger
                                    id="product-type-filter"
                                    className="h-8 bg-background text-xs"
                                    aria-label="Filter tipe produk"
                                >
                                    <SelectValue placeholder="Semua tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Tipe Produk
                                    </SelectItem>
                                    {productTypes.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="product-category"
                                className="text-xs font-medium"
                            >
                                Kategori Produk
                            </Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                            >
                                <SelectTrigger
                                    id="product-category"
                                    className="h-8 bg-background text-xs"
                                    aria-label="Kategori produk"
                                >
                                    <SelectValue placeholder="Semua kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua kategori
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="product-status"
                                className="text-xs font-medium"
                            >
                                Status
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger
                                    id="product-status"
                                    className="h-8 bg-background text-xs"
                                    aria-label="Status produk"
                                >
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </FilterPopover>
            </form>
        </TableToolbar>
    );
}
