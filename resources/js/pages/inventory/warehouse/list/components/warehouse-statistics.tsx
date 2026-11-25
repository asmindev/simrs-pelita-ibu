import { Boxes, CheckCircle2, MapPin, Warehouse } from 'lucide-react';

import { Card, CardContent } from '@/shared/ui/card';

import type { WarehouseStatistics as Stats } from '../../types/warehouse';

type Props = {
    statistics: Stats;
};

export function WarehouseStatistics({ statistics }: Props) {
    const cards = [
        {
            title: 'Total Lokasi',
            value: statistics.total_locations,
            suffix: 'lokasi terdaftar',
            icon: MapPin,
        },
        {
            title: 'Gudang & Depo Internal',
            value: statistics.internal_count,
            suffix: 'lokasi penyimpanan',
            icon: Warehouse,
        },
        {
            title: 'Lokasi Aktif',
            value: statistics.active_count,
            suffix: 'siap transaksi',
            icon: CheckCircle2,
        },
        {
            title: 'Total Stok On-Hand',
            value: statistics.total_on_hand.toLocaleString('id-ID'),
            suffix: 'unit tersimpan',
            icon: Boxes,
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card key={card.title} className="gap-0 py-3">
                        <CardContent className="flex items-center justify-between px-4">
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {card.title}
                                </p>
                                <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                                    {card.value}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {card.suffix}
                                </p>
                            </div>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="size-4" />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
