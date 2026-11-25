import {
    ArrowLeftRight,
    Boxes,
    Layers,
    MapPin,
    PackageCheck,
} from 'lucide-react';

import { formatCurrency } from '@/shared/lib/format';

export type ProductShowTab =
    | 'general'
    | 'quants'
    | 'batches'
    | 'movements'
    | 'valuation';

type Props = {
    unitOfMeasure: string;
    statistics: {
        total_stock?: number;
        active_batches?: number;
        total_batches?: number;
        locations_count?: number;
        movements_count?: number;
        total_valuation?: number;
    };
    activeTab: ProductShowTab;
    onSelectTab: (tab: ProductShowTab) => void;
};

export function ProductSmartButtons({
    unitOfMeasure,
    statistics,
    activeTab,
    onSelectTab,
}: Props) {
    const totalStock = statistics.total_stock ?? 0;
    const activeBatches = statistics.active_batches ?? 0;
    const totalBatches = statistics.total_batches ?? 0;
    const locationsCount = statistics.locations_count ?? 0;
    const movementsCount = statistics.movements_count ?? 0;
    const totalValuation = statistics.total_valuation ?? 0;

    const items: Array<{
        tab: ProductShowTab;
        icon: typeof PackageCheck;
        value: string;
        label: string;
    }> = [
        {
            tab: 'quants',
            icon: PackageCheck,
            value: `${totalStock.toLocaleString('id-ID')} ${unitOfMeasure}`,
            label: 'On Hand',
        },
        {
            tab: 'quants',
            icon: MapPin,
            value: `${locationsCount} Lokasi`,
            label: 'Stok Lokasi',
        },
        {
            tab: 'batches',
            icon: Boxes,
            value: `${activeBatches} / ${totalBatches}`,
            label: 'Lot / Batch',
        },
        {
            tab: 'movements',
            icon: ArrowLeftRight,
            value: `${movementsCount}`,
            label: 'In / Out Moves',
        },
        {
            tab: 'valuation',
            icon: Layers,
            value: formatCurrency(totalValuation),
            label: 'Valuasi Layer',
        },
    ];

    return (
        <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border bg-muted/30 sm:flex sm:flex-wrap sm:divide-y-0">
            {items.map((item, idx) => {
                const Icon = item.icon;
                const isActive =
                    activeTab === item.tab &&
                    !(idx === 1 && activeTab === 'quants');

                return (
                    <button
                        key={`${item.label}-${idx}`}
                        type="button"
                        onClick={() => onSelectTab(item.tab)}
                        className={`flex min-w-28 items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent/50 ${
                            isActive ? 'bg-accent/60' : 'bg-card'
                        }`}
                    >
                        <Icon className="size-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                            <div className="truncate font-mono text-xs font-semibold text-foreground tabular-nums">
                                {item.value}
                            </div>
                            <div className="truncate text-[10px] font-medium text-muted-foreground">
                                {item.label}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
