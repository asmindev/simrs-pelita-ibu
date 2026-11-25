import { formatCurrency } from '@/shared/lib/format';

import { PRODUCT_TYPE_LABELS, type Product } from '../../types/product';

type Props = {
    product: Product;
    statistics: {
        total_stock?: number;
        active_batches?: number;
        total_batches?: number;
        locations_count?: number;
        total_valuation?: number;
        average_cost?: number;
    };
};

function FieldRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="grid grid-cols-3 gap-2 border-b border-border/50 py-2 text-xs last:border-b-0">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd
                className={`col-span-2 text-foreground ${mono ? 'font-mono font-semibold tabular-nums' : 'font-medium'}`}
            >
                {value}
            </dd>
        </div>
    );
}

export function ProductGeneralTab({ product, statistics }: Props) {
    const isDrug = product.product_type === 'drug';
    const totalStock = statistics.total_stock ?? 0;
    const activeBatches = statistics.active_batches ?? 0;
    const totalBatches = statistics.total_batches ?? 0;
    const locationsCount = statistics.locations_count ?? 0;
    const totalValuation = statistics.total_valuation ?? 0;
    const averageCost = statistics.average_cost ?? 0;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Informasi Produk
                </h3>
                <dl className="rounded-lg border border-border/70 bg-muted/20 px-3.5 py-1">
                    <FieldRow
                        label="Tipe Produk"
                        value={
                            PRODUCT_TYPE_LABELS[product.product_type] ??
                            product.product_type
                        }
                    />
                    <FieldRow label="Kode / SKU" value={product.code} mono />
                    <FieldRow
                        label="Kategori"
                        value={product.category?.name ?? '-'}
                    />
                    <FieldRow
                        label="Satuan Ukur"
                        value={product.unit_of_measure}
                    />
                    {isDrug && (
                        <>
                            <FieldRow
                                label="Bentuk Sediaan"
                                value={product.form || '-'}
                            />
                            <FieldRow
                                label="Kekuatan / Dosis"
                                value={product.strength || '-'}
                            />
                        </>
                    )}
                    <FieldRow
                        label="Pabrik / Merk"
                        value={product.manufacturer || '-'}
                    />
                    <FieldRow
                        label="Spesifikasi"
                        value={product.description || '-'}
                    />
                </dl>
            </div>

            <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Harga &amp; Valuasi Persediaan
                </h3>
                <dl className="rounded-lg border border-border/70 bg-muted/20 px-3.5 py-1">
                    <FieldRow
                        label="Harga Jual Dasar"
                        value={formatCurrency(product.price)}
                        mono
                    />
                    <FieldRow
                        label="Biaya Rata-Rata"
                        value={`${formatCurrency(averageCost)} / ${product.unit_of_measure}`}
                        mono
                    />
                    <FieldRow
                        label="Nilai Inventory (SVL)"
                        value={formatCurrency(totalValuation)}
                        mono
                    />
                    <FieldRow
                        label="Stok On-Hand"
                        value={`${totalStock.toLocaleString('id-ID')} ${product.unit_of_measure}`}
                        mono
                    />
                    <FieldRow
                        label="Batch Aktif / Total"
                        value={`${activeBatches} / ${totalBatches} batch`}
                        mono
                    />
                    <FieldRow
                        label="Lokasi Penyimpanan"
                        value={`${locationsCount} lokasi internal`}
                        mono
                    />
                </dl>
            </div>
        </div>
    );
}
