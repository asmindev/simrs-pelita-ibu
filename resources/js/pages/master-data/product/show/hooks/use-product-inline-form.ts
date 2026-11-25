import { useForm } from '@inertiajs/react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { route } from '@/shared/lib/route';

import type { Product, ProductInput, ProductType } from '../../types/product';

function buildInitialValues(product: Product): ProductInput {
    return {
        code: product.code ?? '',
        name: product.name ?? '',
        product_type: product.product_type ?? 'drug',
        product_category_id: product.product_category_id ?? '',
        form: product.form ?? '',
        strength: product.strength ?? '',
        unit_of_measure: product.unit_of_measure ?? 'Pcs',
        price: product.price ?? 0,
        manufacturer: product.manufacturer ?? '',
        description: product.description ?? '',
        image: null,
        remove_image: false,
        is_active: product.is_active ?? true,
    };
}

export function useProductInlineForm(product: Product) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const productSignature = `${product.id}:${product.updated_at}:${product.image_url ?? ''}`;
    const lastSyncedSignature = useRef(productSignature);

    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(
        product.image_url ?? null,
    );

    const {
        data,
        setData,
        setDefaults,
        post,
        transform,
        reset,
        clearErrors,
        processing,
        errors,
        isDirty,
    } = useForm<ProductInput>(buildInitialValues(product));

    useEffect(() => {
        if (lastSyncedSignature.current === productSignature) {
            return;
        }

        lastSyncedSignature.current = productSignature;
        const nextValues = buildInitialValues(product);
        setData(nextValues);
        setDefaults(nextValues);
        setImagePreview(product.image_url ?? null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [product, productSignature, setData, setDefaults]);

    function startEditing() {
        const nextValues = buildInitialValues(product);
        setData(nextValues);
        setDefaults(nextValues);
        clearErrors();
        setImagePreview(product.image_url ?? null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsEditing(true);
    }

    function handleTypeChange(value: string) {
        const nextType = value as ProductType;
        setData((prev) => ({
            ...prev,
            product_type: nextType,
            form: nextType === 'drug' ? prev.form || 'Tablet' : '',
            strength: nextType === 'drug' ? prev.strength : '',
            unit_of_measure:
                nextType === 'drug' && prev.unit_of_measure === 'Pcs'
                    ? 'Tablet'
                    : nextType !== 'drug' && prev.unit_of_measure === 'Tablet'
                      ? 'Pcs'
                      : prev.unit_of_measure,
        }));
    }

    function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setData((prev) => ({
            ...prev,
            image: file,
            remove_image: false,
        }));
        setImagePreview(URL.createObjectURL(file));
    }

    function handleRemoveImage() {
        setData((prev) => ({
            ...prev,
            image: null,
            remove_image: true,
        }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function handleDiscard() {
        reset();
        clearErrors();
        setImagePreview(product.image_url ?? null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsEditing(false);
    }

    function handleSave() {
        transform((values) => ({
            ...values,
            _method: 'put',
            inline: true,
        }));

        post(route('master-data.products.update', product.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    }

    return {
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
    };
}
