import {
    Building2,
    DollarSign,
    Layers,
    Package,
} from 'lucide-react';

import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import type { Drug } from '../../types/drug';

interface DrugInfoCardProps {
    drug: Drug;
    totalStock: number;
}

export function DrugInfoCard({ drug, totalStock }: DrugInfoCardProps) {
    return (
        <Card className="border-border bg-card shadow-xs">
            <CardHeader className="border-b border-border pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-bold text-foreground">
                                {drug.name}
                            </CardTitle>
                            <Badge
                                variant={
                                    drug.is_active ? 'default' : 'secondary'
                                }
                                className="text-xs"
                            >
                                {drug.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                            Kode:{' '}
                            <span className="font-semibold text-foreground">
                                {drug.code}
                            </span>{' '}
                            &bull; Kategori: {drug.category?.name ?? '-'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-right">
                        <div>
                            <div className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                Total Stok Fisik
                            </div>
                            <div className="font-mono text-xl font-extrabold text-primary tabular-nums">
                                {totalStock.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">
                                    {drug.unit_of_measure}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4 pt-4 text-xs sm:grid-cols-4">
                <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Layers className="size-3.5 text-primary" />
                        Bentuk & Kekuatan
                    </span>
                    <div className="font-semibold text-foreground">
                        {drug.form} ({drug.strength})
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Package className="size-3.5 text-primary" />
                        Satuan Ukur
                    </span>
                    <div className="font-semibold text-foreground">
                        {drug.unit_of_measure}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="size-3.5 text-primary" />
                        Harga Jual Satuan
                    </span>
                    <div className="font-mono font-bold text-foreground">
                        {formatCurrency(drug.price)}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="size-3.5 text-primary" />
                        Pabrik / Produsen
                    </span>
                    <div className="font-semibold text-foreground">
                        {drug.manufacturer || '-'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
