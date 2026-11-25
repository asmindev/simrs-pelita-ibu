import { ArrowLeftRight, Search, Warehouse } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Can } from '@/shared/components/can';
import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import type { StockQuant } from '../../types/stock';

type Props = {
    quants: StockQuant[];
    buyPrice: number;
    unitOfMeasure: string;
    onTransferQuant: (quant: StockQuant) => void;
};

export function BatchQuantTable({
    quants,
    buyPrice,
    unitOfMeasure,
    onTransferQuant,
}: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return quants;
        const q = search.toLowerCase();
        return quants.filter(
            (item) =>
                (item.location?.name &&
                    item.location.name.toLowerCase().includes(q)) ||
                (item.location?.code &&
                    item.location.code.toLowerCase().includes(q)),
        );
    }, [quants, search]);

    const columns = useMemo<DataTableColumn<StockQuant>[]>(
        () => [
            {
                key: 'location_name',
                header: 'Warehouse (WH)',
                className: 'py-1.5',
                render: (quant) => (
                    <span className="text-xs font-medium text-foreground">
                        {quant.location?.name ?? '-'}
                    </span>
                ),
            },
            {
                key: 'location_code',
                header: 'Kode Lokasi',
                className: 'py-1.5',
                render: (quant) => (
                    <Badge
                        variant="outline"
                        className="px-1.5 py-0 font-mono text-[10px]"
                    >
                        {quant.location?.code ?? '-'}
                    </Badge>
                ),
            },
            {
                key: 'quantity',
                header: 'Stok On-Hand',
                className: 'py-1.5 text-right',
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
                className: 'py-1.5 text-right',
                render: (quant) => (
                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                        {formatCurrency(quant.quantity * buyPrice)}
                    </span>
                ),
            },
            {
                key: 'actions',
                header: '',
                className: 'w-24 py-1.5 text-right',
                render: (quant) => (
                    <Can permission="pharmacy.stock.adjust">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onTransferQuant(quant)}
                            className="h-6 gap-1 bg-background px-2 text-[11px]"
                        >
                            <ArrowLeftRight className="size-3" />
                            Transfer
                        </Button>
                    </Can>
                ),
            },
        ],
        [buyPrice, unitOfMeasure, onTransferQuant],
    );

    return (
        <DataTable<StockQuant>
            columns={columns}
            rows={filtered}
            rowKey={(quant) => quant.id}
            empty="Batch ini belum memiliki stok aktif di gudang manapun."
            toolbar={
                <TableToolbar
                    title="Distribusi Stok per Warehouse"
                    description="Lokasi fisik tempat batch ini tersimpan saat ini."
                    icon={Warehouse}
                    current={filtered.length}
                    total={quants.length}
                >
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari gudang atau kode..."
                            className="h-8 bg-background pl-8 text-xs"
                            aria-label="Cari distribusi gudang"
                        />
                    </div>
                </TableToolbar>
            }
        />
    );
}
