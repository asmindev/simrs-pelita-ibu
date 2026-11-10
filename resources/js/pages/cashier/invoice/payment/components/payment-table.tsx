import { Receipt, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTable,
    type DataTableColumn,
} from '@/shared/components/data-table';
import { TableToolbar } from '@/shared/components/table-toolbar';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import { Input } from '@/shared/ui/input';

import type { Payment } from '../../../types/cashier';

interface PaymentTableProps {
    payments?: Payment[];
}

function getPaymentMethodLabel(method: string) {
    switch (method) {
        case 'cash':
            return 'Tunai (Cash)';
        case 'qris':
            return 'QRIS';
        case 'bank_transfer':
            return 'Transfer Bank';
        case 'debit_card':
            return 'Kartu Debit';
        case 'credit_card':
            return 'Kartu Kredit';
        default:
            return method;
    }
}

export function PaymentTable({ payments = [] }: PaymentTableProps) {
    const [search, setSearch] = useState('');

    const filteredPayments = useMemo(() => {
        if (!search.trim()) return payments;
        const q = search.toLowerCase();
        return payments.filter(
            (p) =>
                p.payment_number.toLowerCase().includes(q) ||
                (p.reference_number &&
                    p.reference_number.toLowerCase().includes(q)) ||
                (p.notes && p.notes.toLowerCase().includes(q)) ||
                (p.received_by?.name &&
                    p.received_by.name.toLowerCase().includes(q)) ||
                getPaymentMethodLabel(p.method).toLowerCase().includes(q),
        );
    }, [payments, search]);

    const columns = useMemo<DataTableColumn<Payment>[]>(
        () => [
            {
                key: 'index',
                header: 'No.',
                className: 'w-12 text-center',
                render: (_, index) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {(index ?? 0) + 1}
                    </span>
                ),
            },
            {
                key: 'payment_number',
                header: 'No. Transaksi / Kuitansi',
                render: (pay) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {pay.payment_number}
                    </span>
                ),
            },
            {
                key: 'paid_at',
                header: 'Tanggal & Waktu',
                render: (pay) => (
                    <span className="text-xs text-muted-foreground">
                        {formatDateTime(pay.paid_at)}
                    </span>
                ),
            },
            {
                key: 'method',
                header: 'Metode',
                render: (pay) => (
                    <span className="text-xs font-medium">
                        {getPaymentMethodLabel(pay.method)}
                    </span>
                ),
            },
            {
                key: 'reference_number',
                header: 'No. Referensi',
                render: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {pay.reference_number || '-'}
                    </span>
                ),
            },
            {
                key: 'amount',
                header: 'Jumlah Bayar',
                className: 'text-right',
                render: (pay) => (
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                        {formatCurrency(pay.amount)}
                    </span>
                ),
            },
            {
                key: 'change_amount',
                header: 'Kembalian',
                className: 'text-right',
                render: (pay) => (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(pay.change_amount)}
                    </span>
                ),
            },
            {
                key: 'received_by',
                header: 'Kasir / Petugas',
                render: (pay) => (
                    <span className="text-xs text-foreground">
                        {pay.received_by?.name ?? '-'}
                    </span>
                ),
            },
            {
                key: 'notes',
                header: 'Catatan',
                render: (pay) => (
                    <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {pay.notes || '-'}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <DataTable<Payment>
            columns={columns}
            rows={filteredPayments}
            rowKey={(pay) => pay.id}
            empty="Belum ada riwayat pembayaran yang tercatat untuk faktur ini."
            toolbar={
                <TableToolbar
                    title="Riwayat Transaksi Pembayaran"
                    description="Rincian seluruh setoran pembayaran dan pelunasan faktur ini."
                    icon={Receipt}
                    current={filteredPayments.length}
                    total={payments.length}
                >
                    <div className="relative min-w-48 sm:w-64">
                        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nomor kwitansi, kasir, metode..."
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
