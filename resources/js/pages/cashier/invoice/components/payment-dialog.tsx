import { useForm } from '@inertiajs/react';
import { CheckCircle2, Wallet } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';

import { formatCurrency } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import type { Invoice } from '../../types/cashier';

type Props = {
    invoice: Invoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PaymentDialog({ invoice, open, onOpenChange }: Props) {
    const remainingBalance = invoice
        ? Math.max(0, invoice.total_amount - invoice.paid_amount)
        : 0;

    const { data, setData, post, processing, errors, reset } = useForm({
        method: 'cash',
        amount: '',
        reference_number: '',
        notes: '',
    });

    useEffect(() => {
        if (invoice) {
            const rem = Math.max(0, invoice.total_amount - invoice.paid_amount);
            setData({
                method: 'cash',
                amount: String(rem),
                reference_number: '',
                notes: '',
            });
        }
    }, [invoice]);

    if (!invoice) return null;

    const enteredAmount = Number(data.amount || 0);
    const changeAmount =
        data.method === 'cash'
            ? Math.max(0, enteredAmount - remainingBalance)
            : 0;

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!invoice) return;

        post(route('cashier.invoices.payments.store', invoice.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    function handlePayExact() {
        setData('amount', String(remainingBalance));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="size-5 text-primary" />
                        Terima Pembayaran Kasir
                    </DialogTitle>
                    <DialogDescription>
                        Catat penerimaan pembayaran tagihan pasien secara
                        langsung dan cepat.
                    </DialogDescription>
                </DialogHeader>

                {/* Ringkasan Tagihan */}
                <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            No. Invoice:
                        </span>
                        <span className="font-mono font-semibold">
                            {invoice.invoice_number}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Nama Pasien:
                        </span>
                        <span className="font-medium text-foreground">
                            {invoice.patient?.name}
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1">
                        <span className="font-medium text-muted-foreground">
                            Sisa Tagihan:
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {formatCurrency(remainingBalance)}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="pay-method">
                            Metode Pembayaran{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.method}
                            onValueChange={(val) => setData('method', val)}
                        >
                            <SelectTrigger
                                id="pay-method"
                                className="bg-background"
                            >
                                <SelectValue placeholder="Pilih metode..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">
                                    Tunai (Cash)
                                </SelectItem>
                                <SelectItem value="qris">QRIS</SelectItem>
                                <SelectItem value="bank_transfer">
                                    Transfer Bank
                                </SelectItem>
                                <SelectItem value="debit_card">
                                    Kartu Debit
                                </SelectItem>
                                <SelectItem value="credit_card">
                                    Kartu Kredit
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.method && (
                            <p className="text-xs text-destructive">
                                {errors.method}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="pay-amount">
                                Jumlah Dibayar{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <button
                                type="button"
                                onClick={handlePayExact}
                                className="text-[11px] font-medium text-primary hover:underline"
                            >
                                Bayar Pas ({formatCurrency(remainingBalance)})
                            </button>
                        </div>
                        <Input
                            id="pay-amount"
                            type="number"
                            min={1}
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0"
                            className="bg-background text-base font-semibold"
                            required
                        />
                        {errors.amount && (
                            <p className="text-xs text-destructive">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    {/* Kalkulator Kembalian Tunai */}
                    {data.method === 'cash' && enteredAmount > 0 && (
                        <div className="flex items-center justify-between rounded-md border border-border bg-card p-2.5 text-xs">
                            <span className="font-medium text-muted-foreground">
                                Kembalian:
                            </span>
                            <span className="font-mono text-sm font-bold text-foreground">
                                {formatCurrency(changeAmount)}
                            </span>
                        </div>
                    )}

                    {data.method !== 'cash' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="pay-ref">
                                Nomor Referensi / No. Transaksi (Opsional)
                            </Label>
                            <Input
                                id="pay-ref"
                                value={data.reference_number}
                                onChange={(e) =>
                                    setData('reference_number', e.target.value)
                                }
                                placeholder="Contoh: RRN-998812, Approval Code..."
                                className="bg-background text-xs"
                            />
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || enteredAmount <= 0}
                            className="font-medium"
                        >
                            <CheckCircle2 className="mr-1.5 size-4" />
                            {processing
                                ? 'Memproses...'
                                : 'Konfirmasi & Selesaikan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
