import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Boxes, Edit2, History } from 'lucide-react';

import { Can } from '@/shared/components/can';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import type { Drug } from '../types/drug';
import { DrugBatchTable } from './components/drug-batch-table';
import { DrugInfoCard } from './components/drug-info-card';
import { DrugStockMovementTable } from './components/drug-stock-movement-table';

type Props = {
    drug: Drug;
    statistics: {
        total_stock: number;
        active_batches: number;
        total_batches: number;
    };
};

export default function DrugShow({ drug, statistics }: Props) {
    const batchesCount = drug.batches?.length ?? 0;
    const movementsCount = drug.stock_movements?.length ?? 0;

    return (
        <div className="space-y-6">
            <Head title={`Detail Obat - ${drug.name} — SIMRS`} />

            {/* Header & Back Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-xs text-muted-foreground hover:text-foreground"
                    asChild
                >
                    <Link href={route('master-data.drugs.index')}>
                        <ArrowLeft className="mr-1.5 size-3.5" />
                        Kembali ke Daftar Obat
                    </Link>
                </Button>

                <div className="flex items-center gap-2">
                    <Can permission="master-data.drug.manage">
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs font-medium"
                        >
                            <Link
                                href={route('master-data.drugs.edit', drug.id)}
                            >
                                <Edit2 className="size-3.5" />
                                Edit Data Obat
                            </Link>
                        </Button>
                    </Can>
                </div>
            </div>

            {/* Kartu Profil & Atribut Master Obat */}
            <DrugInfoCard drug={drug} totalStock={statistics.total_stock} />

            {/* Tabs Inventaris: Batch Fisik & Stock Move (Mutasi) */}
            <Tabs defaultValue="batches" className="space-y-4">
                <div className="border-b border-border pb-px">
                    <TabsList className="h-10 bg-muted/40 p-1 text-muted-foreground">
                        <TabsTrigger
                            value="batches"
                            className="gap-2 px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <Boxes className="size-3.5" />
                            <span>Batch Persediaan</span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                                ({batchesCount})
                            </span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="movements"
                            className="gap-2 px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <History className="size-3.5" />
                            <span>Riwayat Mutasi / Stock Move</span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                                ({movementsCount})
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="batches"
                    className="space-y-4 focus-visible:outline-none"
                >
                    <DrugBatchTable
                        batches={drug.batches}
                        unitOfMeasure={drug.unit_of_measure}
                    />
                </TabsContent>

                <TabsContent
                    value="movements"
                    className="space-y-4 focus-visible:outline-none"
                >
                    <DrugStockMovementTable
                        movements={drug.stock_movements}
                        unitOfMeasure={drug.unit_of_measure}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
