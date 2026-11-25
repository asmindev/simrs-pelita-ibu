import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowLeftRight,
    Boxes,
    Edit2,
    Layers,
    Package,
    PowerOff,
    Star,
    Warehouse,
} from 'lucide-react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import { WarehouseFormDialog } from '../components/warehouse-form-dialog';
import {
    USAGE_LABELS,
    type UsageOption,
    type WarehouseLocation,
    type WarehouseMovement,
    type WarehouseQuant,
} from '../types/warehouse';
import { WarehouseMovementTable } from './components/warehouse-movement-table';
import { WarehouseQuantTable } from './components/warehouse-quant-table';

type Props = {
    warehouse: WarehouseLocation;
    quants: WarehouseQuant[];
    movements: WarehouseMovement[];
    usageOptions: UsageOption[];
    statistics: {
        total_on_hand: number;
        sku_count: number;
        batch_count: number;
        total_valuation: number;
        movements_count: number;
    };
};

export default function WarehouseShow({
    warehouse,
    quants,
    movements,
    usageOptions,
    statistics,
}: Props) {
    const [editOpen, setEditOpen] = useState(false);

    function handleDeactivate() {
        if (
            !window.confirm(
                `Nonaktifkan lokasi ${warehouse.code} (${warehouse.name})?`,
            )
        ) {
            return;
        }

        router.delete(route('inventory.warehouses.destroy', warehouse.id));
    }

    return (
        <div className="space-y-3">
            <Head title={`${warehouse.name} — Gudang SIMRS`} />

            {/* Control Panel */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit px-2 text-xs text-muted-foreground hover:text-foreground"
                    asChild
                >
                    <Link href={route('inventory.warehouses.index')}>
                        <ArrowLeft className="mr-1.5 size-3.5" />
                        Kembali ke Daftar Gudang
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <Can permission="pharmacy.stock.adjust">
                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => setEditOpen(true)}
                            className="h-8 gap-1.5 text-xs font-medium"
                        >
                            <Edit2 className="size-3.5" />
                            Edit Gudang
                        </Button>
                        {warehouse.is_active &&
                            !warehouse.is_default_warehouse && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleDeactivate}
                                    className="h-8 gap-1.5 text-xs font-medium"
                                >
                                    <PowerOff className="size-3.5" />
                                    Nonaktifkan
                                </Button>
                            )}
                    </Can>
                </div>
            </div>

            {/* Warehouse Sheet Card */}
            <Card className="gap-0 overflow-hidden py-0">
                <div className="space-y-4 border-b border-border/70 p-4 sm:p-5">
                    {/* Smart Stats Strip */}
                    <div className="flex flex-wrap justify-end gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <Boxes className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-foreground tabular-nums">
                                    {statistics.total_on_hand.toLocaleString(
                                        'id-ID',
                                    )}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Stok On-Hand
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <Package className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-foreground tabular-nums">
                                    {statistics.sku_count} SKU /{' '}
                                    {statistics.batch_count} Batch
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Item Tersimpan
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs">
                            <Layers className="size-3.5 text-primary" />
                            <div>
                                <div className="font-mono font-bold text-foreground tabular-nums">
                                    {formatCurrency(statistics.total_valuation)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Nilai Persediaan
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header Info */}
                    <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                            <Warehouse className="size-10 stroke-[1.5]" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-primary">
                                    {warehouse.code}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="text-[11px]"
                                >
                                    {USAGE_LABELS[warehouse.usage] ??
                                        warehouse.usage}
                                </Badge>
                                {warehouse.is_default_warehouse && (
                                    <Badge
                                        variant="default"
                                        className="gap-1 text-[11px]"
                                    >
                                        <Star className="size-3 fill-current" />
                                        Gudang Utama
                                    </Badge>
                                )}
                                <Badge
                                    variant={
                                        warehouse.is_active
                                            ? 'outline'
                                            : 'secondary'
                                    }
                                    className="text-[11px]"
                                >
                                    {warehouse.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {warehouse.name}
                            </h1>

                            {warehouse.description && (
                                <p className="text-xs text-muted-foreground">
                                    {warehouse.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <CardContent className="p-4 sm:p-5">
                    <Tabs defaultValue="quants" className="space-y-4">
                        <TabsList className="h-9 flex-wrap">
                            <TabsTrigger
                                value="quants"
                                className="gap-1.5 text-xs"
                            >
                                <Package className="size-3.5" />
                                <span>Stok di Lokasi</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {quants.length}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="movements"
                                className="gap-1.5 text-xs"
                            >
                                <ArrowLeftRight className="size-3.5" />
                                <span>Riwayat Stock Moves</span>
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {movements.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="quants" className="outline-none">
                            <WarehouseQuantTable quants={quants} />
                        </TabsContent>

                        <TabsContent value="movements" className="outline-none">
                            <WarehouseMovementTable movements={movements} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <WarehouseFormDialog
                warehouse={warehouse}
                usageOptions={usageOptions}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </div>
    );
}
