import { Camera, Package, Trash2 } from 'lucide-react';
import type { ChangeEvent, RefObject } from 'react';

import { Badge } from '@/shared/ui/badge';

import {
    PRODUCT_TYPE_LABELS,
    type Product,
    type ProductInput,
} from '../../types/product';

type Props = {
    product: Product;
    canManage: boolean;
    data: ProductInput;
    errors: Partial<Record<keyof ProductInput, string>>;
    imagePreview: string | null;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onNameChange: (name: string) => void;
    onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
};

export function ProductSheetHeader({
    product,
    canManage,
    data,
    errors,
    imagePreview,
    fileInputRef,
    onNameChange,
    onImageChange,
    onRemoveImage,
}: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-start gap-4 sm:items-center sm:gap-5">
                <div className="shrink-0 space-y-1">
                    <div className="group relative size-24 overflow-hidden rounded-xl border border-border bg-card shadow-xs sm:size-28">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt={data.name || product.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
                                <Package className="size-12 stroke-[1.5] sm:size-14" />
                            </div>
                        )}

                        {canManage && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={onImageChange}
                                    className="hidden"
                                    aria-label="Upload foto produk"
                                />
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-foreground/75 px-1.5 py-1 text-background opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium hover:bg-background/20"
                                        title="Ubah foto produk"
                                    >
                                        <Camera className="size-3" />
                                        <span>Ubah</span>
                                    </button>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={onRemoveImage}
                                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium hover:bg-destructive/80"
                                            title="Hapus foto produk"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {errors.image && (
                        <p className="max-w-28 text-[11px] text-destructive">
                            {errors.image}
                        </p>
                    )}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Produk
                        </span>
                        <Badge
                            variant={
                                data.product_type === 'drug'
                                    ? 'default'
                                    : 'secondary'
                            }
                            className="text-[11px]"
                        >
                            {PRODUCT_TYPE_LABELS[data.product_type] ??
                                data.product_type}
                        </Badge>
                        <Badge
                            variant={data.is_active ? 'outline' : 'secondary'}
                            className="text-[11px]"
                        >
                            {data.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                    </div>

                    {canManage ? (
                        <div>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(event) =>
                                    onNameChange(event.target.value)
                                }
                                placeholder="Nama produk..."
                                aria-label="Nama Produk"
                                className="-mx-1.5 w-full max-w-xl rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-xl font-bold tracking-tight text-foreground transition-colors hover:border-border focus:border-primary focus:bg-background focus:outline-none sm:text-2xl"
                            />
                            {errors.name && (
                                <p className="mt-0.5 text-xs text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                    ) : (
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            {product.name}
                        </h1>
                    )}
                </div>
            </div>
        </div>
    );
}
