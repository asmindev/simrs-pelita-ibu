import { MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

import type { Product } from '../../types/product';

type QuantRow = NonNullable<Product['stock_quants']>[number];

type Props = {
    quants?: Product['stock_quants'];
    unitOfMeasure: string;
};

export function ProductQuantTable({ quants = [], unitOfMeasure }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return quants;
        const q = search.toLowerCase();
        return quants.filter(
            (item) =>
                (item.location?.name &&
                    item.location.name.toLowerCase().includes(q)) ||
                (item.location?.code &&
                    item.location.code.toLowerCase().includes(q)) ||
                (item.drug_batch?.batch_number &&
                    item.drug_batch.batch_number.toLowerCase().includes(q)),
        );
    }, [quants, search]);

    const columns = useMemo<DataTableColumn<QuantRow>[]>(
        () => [
            {
                key: 'location',
                header: 'Lokasi Simpan',
                render: (quant) => (
                    <div className="space-y-0.5">
                        <Badge
                            variant="outline"
                            className="font-mono text-[10px]"
                        >
                            {quant.location?.code ?? '-'}
                        </Badge>
                        <div className="text-xs font-medium text-foreground">
                            {quant.location?.name ?? '-'}
                        </div>
                    </div>
                ),
            },
            {
                key: 'batch',
                header: 'Nomor Batch / Lot',
                render: (quant) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {quant.drug_batch?.batch_number ?? '-'}
                    </span>
                ),
            },
            {
                key: 'expiry',
                header: 'Kedaluwarsa',
                render: (quant) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {quant.drug_batch?.expiry_date
                            ? formatDate(quant.drug_batch.expiry_date)
                            : '-'}
                    </span>
                ),
            },
            {
                key: 'quantity',
                header: 'Stok On-Hand',
                className: 'text-right',
                render: (quant) => (
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {quant.quantity.toLocaleString('id-ID')}{' '}
                        <span className="font-normal text-muted-foreground">
                            {unitOfMeasure}
                        </span>
                    </span>
                ),
            },
            {
                key: 'value',
                header: 'Nilai Lokasi',
                className: 'text-right',
                render: (quant) => {
                    const price = Number(quant.drug_batch?.buy_price ?? 0);
                    const qty = Number(quant.quantity ?? 0);
                    return (
                        <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                            {formatCurrency(qty * price)}
                        </span>
                    );
                },
            },
        ],
        [unitOfMeasure],
    );

    return (
        <DataTable<QuantRow>
            columns={columns}
            rows={filtered}
            rowKey={(quant) => quant.id}
            empty="Belum ada stok tersedia di lokasi penyimpanan manapun."
            toolbar={
                <TableToolbar
                    title="Posisi Stok per Lokasi (Quants)"
                    description="Distribusi stok fisik produk per gudang dan depo layanan."
                    icon={MapPin}
                    current={filtered.length}
                    total={quants.length}
                >
                    <div className="relative min-w-48 sm:w-64">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari lokasi atau batch..."
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
