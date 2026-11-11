import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    Clock,
    MoreHorizontal,
    PackageCheck,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { Pagination } from '@/shared/components/pagination';
import {
    formatCurrency,
    formatDate,
    formatDateTime,
} from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import type {
    DrugBatch,
    DrugInfo,
    PaginatedData,
    StockMovement,
} from '../types/pharmacy';
import { NewBatchDialog } from './components/new-batch-dialog';
import { StockAdjustDialog } from './components/stock-adjust-dialog';
import { StockFilters } from './components/stock-filters';

type Props = {
    batches: PaginatedData<DrugBatch>;
    drugs: DrugInfo[];
    recentMovements: StockMovement[];
    filters: {
        search: string;
        status: string;
    };
    statistics: {
        total_batches: number;
        active_stock: number;
        expiring_soon: number;
        expired: number;
    };
};

function getExpiryBadge(expiryDate: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
        (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
        return (
            <Badge variant="destructive" className="text-xs">
                Kadaluwarsa ({formatDate(expiryDate)})
            </Badge>
        );
    }

    if (diffDays <= 30) {
        return (
            <Badge
                variant="outline"
                className="border-destructive/50 text-xs text-destructive"
            >
                Mendekati ED: {diffDays} hr ({formatDate(expiryDate)})
            </Badge>
        );
    }

    return (
        <span className="font-mono text-xs text-muted-foreground">
            {formatDate(expiryDate)}
        </span>
    );
}

function getMovementTypeBadge(type: StockMovement['type']) {
    switch (type) {
        case 'in':
            return (
                <Badge variant="outline" className="text-xs">
                    <ArrowDownRight className="mr-1 size-3 text-primary" />
                    Masuk
                </Badge>
            );
        case 'out':
        case 'dispensing':
            return (
                <Badge variant="secondary" className="text-xs">
                    <ArrowUpRight className="mr-1 size-3 text-muted-foreground" />
                    Keluar / Resep
                </Badge>
            );
        case 'adjustment':
        case 'opname':
            return (
                <Badge variant="outline" className="text-xs">
                    <SlidersHorizontal className="mr-1 size-3 text-muted-foreground" />
                    Opname
                </Badge>
            );
        case 'return':
            return (
                <Badge variant="default" className="text-xs">
                    <RotateCcw className="mr-1 size-3" />
                    Retur
                </Badge>
            );
    }
}

export default function PharmacyStockIndex({
    batches,
    drugs,
    recentMovements,
    filters,
    statistics,
}: Props) {
    const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
    const [adjustingBatch, setAdjustingBatch] = useState<DrugBatch | null>(
        null,
    );

    const columns: DataTableColumn<DrugBatch>[] = [
        {
            key: 'batch_drug',
            header: 'No. Batch & Obat',
            render: (batch) => (
                <div className="space-y-0.5">
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {batch.batch_number}
                    </span>
                    <div className="text-xs font-medium text-foreground">
                        {batch.drug?.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {batch.drug?.code} &bull; {batch.drug?.form}
                    </div>
                </div>
            ),
        },
        {
            key: 'expiry_date',
            header: 'Kedaluwarsa (FEFO)',
            render: (batch) => getExpiryBadge(batch.expiry_date),
        },
        {
            key: 'current_quantity',
            header: 'Sisa Stok',
            render: (batch) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground">
                        {batch.current_quantity}{' '}
                        <span className="font-normal text-muted-foreground">
                            {batch.drug?.unit_of_measure}
                        </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Awal: {batch.initial_quantity}
                    </div>
                </div>
            ),
        },
        {
            key: 'buy_price',
            header: 'Harga Beli',
            render: (batch) => (
                <span className="text-xs text-muted-foreground">
                    {formatCurrency(batch.buy_price)}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (batch) => {
                const isExpired = new Date(batch.expiry_date) < new Date();
                if (isExpired) {
                    return (
                        <Badge variant="destructive" className="text-xs">
                            Expired
                        </Badge>
                    );
                }
                if (batch.current_quantity <= 0) {
                    return (
                        <Badge variant="secondary" className="text-xs">
                            Habis
                        </Badge>
                    );
                }
                return (
                    <Badge variant="default" className="text-xs">
                        Aktif / FEFO
                    </Badge>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            className: 'w-12 text-right',
            render: (batch) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Buka menu aksi</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                                onClick={() => setAdjustingBatch(batch)}
                            >
                                <SlidersHorizontal className="mr-2 size-3.5" />
                                Penyesuaian Stok
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Head title="Inventaris Stok & Batch Obat — SIMRS" />

            {/* Statistik Banner */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Total Batch Aktif
                        </CardTitle>
                        <Boxes className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.total_batches}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Batch obat terdaftar
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Total Stok Fisik
                        </CardTitle>
                        <PackageCheck className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {statistics.active_stock}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Akumulasi seluruh batch
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Mendekati ED (&le;30 Hari)
                        </CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.expiring_soon}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Prioritas pengeluaran FEFO
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            Batch Kadaluwarsa
                        </CardTitle>
                        <AlertTriangle className="size-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {statistics.expired}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Harus dikarantina / dihapus
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs: Inventaris Batch Obat & Riwayat Mutasi */}
            <Tabs defaultValue="batches" className="space-y-4">
                <TabsList className="h-9">
                    <TabsTrigger value="batches" className="gap-2">
                        <Boxes className="size-4" />
                        <span>Inventaris & Batch Obat</span>
                        <Badge
                            variant="secondary"
                            className="ml-1 px-1.5 py-0 font-mono text-[10px]"
                        >
                            {batches.total}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="movements" className="gap-2">
                        <RotateCcw className="size-4" />
                        <span>Riwayat Mutasi Stok</span>
                        {recentMovements.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-1 px-1.5 py-0 font-mono text-[10px]"
                            >
                                {recentMovements.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Tabel Batch Obat */}
                <TabsContent value="batches" className="space-y-4 outline-none">
                    <DataTable<DrugBatch>
                        columns={columns}
                        rows={batches.data}
                        rowKey={(batch) => batch.id}
                        empty="Tidak ada batch obat yang sesuai dengan pencarian."
                        toolbar={
                            <StockFilters
                                filters={filters}
                                current={batches.data.length}
                                total={batches.total}
                                onAddBatchClick={() => setIsAddBatchOpen(true)}
                            />
                        }
                        footer={
                            <Pagination
                                links={batches.links}
                                from={batches.from}
                                to={batches.to}
                                total={batches.total}
                            />
                        }
                    />
                </TabsContent>

                {/* Tab 2: Riwayat Mutasi Stok Terbaru */}
                <TabsContent
                    value="movements"
                    className="space-y-4 outline-none"
                >
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="flex items-center justify-between text-sm font-semibold">
                                <span>Mutasi Transaksi Stok Obat</span>
                                <Badge variant="outline" className="text-xs">
                                    10 Mutasi Terakhir
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs">
                                            Waktu
                                        </TableHead>
                                        <TableHead className="text-xs">
                                            Obat & Batch
                                        </TableHead>
                                        <TableHead className="text-xs">
                                            Tipe
                                        </TableHead>
                                        <TableHead className="text-right text-xs">
                                            Kuantitas
                                        </TableHead>
                                        <TableHead className="text-right text-xs">
                                            Saldo Sesudah
                                        </TableHead>
                                        <TableHead className="text-xs">
                                            Petugas / Keterangan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentMovements.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center text-xs text-muted-foreground"
                                            >
                                                Belum ada riwayat mutasi stok.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentMovements.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        m.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <span className="font-medium text-foreground">
                                                        {m.drug?.name}
                                                    </span>
                                                    {m.drug_batch
                                                        ?.batch_number && (
                                                        <span className="ml-1.5 font-mono text-muted-foreground">
                                                            (
                                                            {
                                                                m.drug_batch
                                                                    .batch_number
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getMovementTypeBadge(
                                                        m.type,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs font-medium">
                                                    {m.quantity}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs font-bold">
                                                    {m.balance_after}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="font-medium text-foreground">
                                                        {m.user?.name ??
                                                            'Sistem'}
                                                    </div>
                                                    {m.reason && (
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {m.reason}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <NewBatchDialog
                open={isAddBatchOpen}
                onOpenChange={setIsAddBatchOpen}
                drugs={drugs}
            />

            <StockAdjustDialog
                batch={adjustingBatch}
                open={adjustingBatch !== null}
                onOpenChange={(open) => !open && setAdjustingBatch(null)}
            />
        </div>
    );
}
