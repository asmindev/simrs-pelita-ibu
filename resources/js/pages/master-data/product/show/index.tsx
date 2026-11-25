import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowLeftRight,
    Boxes,
    Edit2,
    Info,
    Layers,
    MapPin,
    Package,
    RotateCcw,
    Save,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import type {
    Product,
    ProductCategory,
    ProductTypeOption,
} from '../types/product';
import { ProductBatchTable } from './components/product-batch-table';
import { ProductGeneralTab } from './components/product-general-tab';
import { ProductQuantTable } from './components/product-quant-table';
import { ProductSheetHeader } from './components/product-sheet-header';
import {
    ProductSmartButtons,
    type ProductShowTab,
} from './components/product-smart-buttons';
import { ProductStockMovementTable } from './components/product-stock-movement-table';
import { ProductValuationTable } from './components/product-valuation-table';
import { useProductInlineForm } from './hooks/use-product-inline-form';

type Props = {
    product: Product;
    categories: ProductCategory[];
    productTypes: ProductTypeOption[];
    statistics: {
        total_stock?: number;
        active_batches?: number;
        total_batches?: number;
        locations_count?: number;
        movements_count?: number;
        total_valuation?: number;
        average_cost?: number;
    };
};

export default function ProductShow({
    product,
    categories,
    productTypes,
    statistics,
}: Props) {
    const [activeTab, setActiveTab] = useState<ProductShowTab>('general');
    const { can } = usePermissions();
    const canManage = can('master-data.product.manage');

    const {
        data,
        setData,
        errors,
        processing,
        isDirty,
        isEditing,
        imagePreview,
        fileInputRef,
        startEditing,
        handleTypeChange,
        handleImageChange,
        handleRemoveImage,
        handleDiscard,
        handleSave,
    } = useProductInlineForm(product);

    const isEditable = canManage && isEditing;
    const quantsCount = product.stock_quants?.length ?? 0;
    const batchesCount = product.batches?.length ?? 0;
    const movementsCount = product.stock_movements?.length ?? 0;
    const layersCount = product.valuation_layers?.length ?? 0;
    const activeUom = isEditable
        ? data.unit_of_measure || product.unit_of_measure
        : product.unit_of_measure;

    function handleStartEdit() {
        startEditing();
        if (activeTab !== 'general') {
            setActiveTab('general');
        }
    }

    function handleDelete() {
        if (!window.confirm(`Hapus produk ${product.name}?`)) {
            return;
        }

        router.delete(route('master-data.products.destroy', product.id));
    }

    return (
        <div className="space-y-3">
            <Head
                title={`${isEditable ? data.name || product.name : product.name} — Produk SIMRS`}
            />

            {/* Odoo-style Control Panel */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit px-2 text-xs text-muted-foreground hover:text-foreground"
                        asChild
                    >
                        <Link href={route('master-data.products.index')}>
                            <ArrowLeft className="mr-1.5 size-3.5" />
                            Kembali ke Daftar Produk
                        </Link>
                    </Button>

                    {isEditable && (
                        <Badge
                            variant="outline"
                            className="border-primary/40 bg-primary/10 text-[11px] font-medium text-primary"
                        >
                            {isDirty
                                ? 'Mode Edit • Perubahan belum disimpan'
                                : 'Mode Edit'}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {isEditable ? (
                        <>
                            <Button
                                type="button"
                                size="sm"
                                variant="default"
                                disabled={processing || !isDirty}
                                onClick={handleSave}
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Save className="size-3.5" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={processing}
                                onClick={handleDiscard}
                                className="h-8 gap-1.5 bg-card text-xs font-medium"
                            >
                                <RotateCcw className="size-3.5" />
                                Batalkan
                            </Button>
                        </>
                    ) : (
                        <>
                            <Can permission="pharmacy.stock.view">
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 bg-card text-xs font-medium"
                                >
                                    <Link
                                        href={route('inventory.stock.index', {
                                            search: product.code,
                                        })}
                                    >
                                        <Package className="size-3.5" />
                                        Kelola di Inventaris
                                    </Link>
                                </Button>
                            </Can>

                            <Can permission="master-data.product.manage">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    onClick={handleStartEdit}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Edit2 className="size-3.5" />
                                    Edit Produk
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <Trash2 className="size-3.5" />
                                    Hapus
                                </Button>
                            </Can>
                        </>
                    )}
                </div>
            </div>

            {/* Odoo Form Sheet */}
            <Card className="gap-0 overflow-hidden py-0">
                {/* Smart Buttons Bar + Sheet Header */}
                <div className="space-y-4 border-b border-border/70 p-4 sm:p-5">
                    <div className="flex justify-end">
                        <ProductSmartButtons
                            unitOfMeasure={activeUom}
                            statistics={statistics}
                            activeTab={activeTab}
                            onSelectTab={setActiveTab}
                        />
                    </div>

                    <ProductSheetHeader
                        product={product}
                        canManage={isEditable}
                        data={data}
                        errors={errors}
                        imagePreview={imagePreview}
                        fileInputRef={fileInputRef}
                        onNameChange={(name) => setData('name', name)}
                        onImageChange={handleImageChange}
                        onRemoveImage={handleRemoveImage}
                    />
                </div>

                {/* Tabs (shadcn standard) */}
                <CardContent className="p-4 sm:p-5">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) =>
                            setActiveTab(val as ProductShowTab)
                        }
                        className="space-y-4"
                    >
                        <TabsList className="h-9 flex-wrap">
                            <TabsTrigger
                                value="general"
                                className="gap-1.5 text-xs"
                            >
                                <Info className="size-3.5" />
                                <span>Informasi Umum</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="quants"
                                className="gap-1.5 text-xs"
                            >
                                <MapPin className="size-3.5" />
                                <span>Posisi Lokasi</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {quantsCount}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="batches"
                                className="gap-1.5 text-xs"
                            >
                                <Boxes className="size-3.5" />
                                <span>Lot / Batch</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {batchesCount}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="movements"
                                className="gap-1.5 text-xs"
                            >
                                <ArrowLeftRight className="size-3.5" />
                                <span>Stock Moves</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {movementsCount}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="valuation"
                                className="gap-1.5 text-xs"
                            >
                                <Layers className="size-3.5" />
                                <span>Inventory Layer</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {layersCount}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="outline-none">
                            <ProductGeneralTab
                                product={product}
                                categories={categories}
                                productTypes={productTypes}
                                canManage={isEditable}
                                data={data}
                                setData={setData}
                                errors={errors}
                                onTypeChange={handleTypeChange}
                                statistics={statistics}
                            />
                        </TabsContent>

                        <TabsContent value="quants" className="outline-none">
                            <ProductQuantTable
                                quants={product.stock_quants}
                                unitOfMeasure={activeUom}
                            />
                        </TabsContent>

                        <TabsContent value="batches" className="outline-none">
                            <ProductBatchTable
                                batches={product.batches}
                                unitOfMeasure={activeUom}
                            />
                        </TabsContent>

                        <TabsContent value="movements" className="outline-none">
                            <ProductStockMovementTable
                                movements={product.stock_movements}
                                unitOfMeasure={activeUom}
                            />
                        </TabsContent>

                        <TabsContent value="valuation" className="outline-none">
                            <ProductValuationTable
                                layers={product.valuation_layers}
                                unitOfMeasure={activeUom}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
