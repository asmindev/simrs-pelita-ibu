import { Boxes, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
    DataTable,
    type DataTableColumn,
} from "@/shared/components/data-table";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";

import type { Drug } from "../../types/drug";

type NonNullableBatch = NonNullable<Drug["batches"]>[number];

interface DrugBatchTableProps {
    batches?: Drug["batches"];
    unitOfMeasure: string;
}

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

export function DrugBatchTable({
    batches = [],
    unitOfMeasure,
}: DrugBatchTableProps) {
    const [search, setSearch] = useState("");

    const filteredBatches = useMemo(() => {
        if (!search.trim()) return batches;
        const q = search.toLowerCase();
        return batches.filter((b) => b.batch_number.toLowerCase().includes(q));
    }, [batches, search]);

    const columns = useMemo<DataTableColumn<NonNullableBatch>[]>(
        () => [
            {
                key: "index",
                header: "No.",
                className: "w-12 text-center",
                render: (_, index) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {(index ?? 0) + 1}
                    </span>
                ),
            },
            {
                key: "batch_number",
                header: "Nomor Batch",
                render: (batch) => (
                    <span className="font-mono text-xs font-bold text-foreground">
                        {batch.batch_number}
                    </span>
                ),
            },
            {
                key: "expiry_date",
                header: "Tanggal Kedaluwarsa",
                render: (batch) => getExpiryBadge(batch.expiry_date),
            },
            {
                key: "buy_price",
                header: "Harga Beli",
                className: "text-right",
                render: (batch) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(batch.buy_price)}
                    </span>
                ),
            },
            {
                key: "initial_quantity",
                header: "Stok Awal",
                className: "text-right",
                render: (batch) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {batch.initial_quantity.toLocaleString("id-ID")}{" "}
                        {unitOfMeasure}
                    </span>
                ),
            },
            {
                key: "current_quantity",
                header: "Sisa Stok Fisik",
                className: "text-right",
                render: (batch) => (
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {batch.current_quantity.toLocaleString("id-ID")}{" "}
                        {unitOfMeasure}
                    </span>
                ),
            },
            {
                key: "status",
                header: "Status",
                render: (batch) => (
                    <Badge
                        variant={
                            batch.current_quantity > 0 ? "default" : "secondary"
                        }
                        className="text-[10px]"
                    >
                        {batch.current_quantity > 0 ? "Tersedia" : "Habis"}
                    </Badge>
                ),
            },
        ],
        [unitOfMeasure],
    );

    return (
        <DataTable<NonNullableBatch>
            columns={columns}
            rows={filteredBatches}
            rowKey={(batch) => batch.id}
            empty="Belum ada batch persediaan yang tercatat untuk obat ini."
            toolbar={
                <TableToolbar
                    title="Daftar Batch Persediaan"
                    description="Rincian lot nomor batch dan kuantitas fisik aktif di gudang/depo farmasi."
                    icon={Boxes}
                    current={filteredBatches.length}
                    total={batches.length}
                >
                    <div className="relative min-w-48 sm:w-64">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nomor batch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 bg-background pl-8 text-xs"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
