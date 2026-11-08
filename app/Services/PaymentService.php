<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    /**
     * Record a payment against an invoice.
     *
     * @param  array{
     *     method: string,
     *     amount: float|int,
     *     reference_number?: string|null,
     *     notes?: string|null
     * }  $data
     */
    public function recordPayment(Invoice $invoice, array $data, User $user): Payment
    {
        return DB::transaction(function () use ($invoice, $data, $user) {
            /** @var Invoice $lockedInvoice */
            $lockedInvoice = Invoice::where('id', $invoice->id)->lockForUpdate()->firstOrFail();

            if ($lockedInvoice->status === 'voided') {
                throw ValidationException::withMessages([
                    'payment' => 'Pembayaran tidak dapat diproses untuk invoice yang telah dibatalkan (void).',
                ]);
            }

            if ($lockedInvoice->status === 'draft') {
                // Auto-finalize draft invoice when payment is being recorded
                $lockedInvoice->update([
                    'status' => 'finalized',
                    'finalized_at' => now(),
                    'finalized_by' => $user->id,
                ]);
            }

            $remainingBalance = max(0, (float) $lockedInvoice->total_amount - (float) $lockedInvoice->paid_amount);

            if ($remainingBalance <= 0) {
                throw ValidationException::withMessages([
                    'payment' => 'Tagihan invoice ini telah lunas sepenuhnya.',
                ]);
            }

            $amountTendered = (float) $data['amount'];
            if ($amountTendered <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'Jumlah pembayaran harus lebih besar dari 0.',
                ]);
            }

            $changeAmount = 0;
            $appliedAmount = $amountTendered;

            if ($data['method'] === 'cash') {
                if ($amountTendered > $remainingBalance) {
                    $changeAmount = $amountTendered - $remainingBalance;
                    $appliedAmount = $remainingBalance;
                }
            } else {
                if ($amountTendered > $remainingBalance) {
                    throw ValidationException::withMessages([
                        'amount' => 'Pembayaran non-tunai tidak boleh melebihi sisa tagihan (Rp '.number_format($remainingBalance, 0, ',', '.').').',
                    ]);
                }
            }

            $datePrefix = 'PAY-'.now()->format('Ymd');
            $countToday = Payment::where('payment_number', 'like', "{$datePrefix}%")->count() + 1;
            $paymentNumber = sprintf('%s-%04d', $datePrefix, $countToday);

            $payment = Payment::create([
                'invoice_id' => $lockedInvoice->id,
                'payment_number' => $paymentNumber,
                'method' => $data['method'],
                'amount' => $amountTendered,
                'change_amount' => $changeAmount,
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'paid_at' => now(),
                'received_by' => $user->id,
            ]);

            $newPaidAmount = (float) $lockedInvoice->paid_amount + $appliedAmount;
            $newStatus = ($newPaidAmount >= (float) $lockedInvoice->total_amount) ? 'paid' : 'partially_paid';

            $lockedInvoice->update([
                'paid_amount' => $newPaidAmount,
                'status' => $newStatus,
            ]);

            return $payment;
        });
    }

    /**
     * Process a refund with required reason and authorization.
     */
    public function processRefund(Invoice $invoice, float $amount, string $reason, User $user, ?Payment $payment = null): Refund
    {
        return DB::transaction(function () use ($invoice, $amount, $reason, $user, $payment) {
            /** @var Invoice $lockedInvoice */
            $lockedInvoice = Invoice::where('id', $invoice->id)->lockForUpdate()->firstOrFail();

            if ($lockedInvoice->status === 'voided') {
                throw ValidationException::withMessages([
                    'refund' => 'Pengembalian dana tidak dapat diproses untuk invoice void.',
                ]);
            }

            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'Nominal pengembalian dana harus lebih besar dari 0.',
                ]);
            }

            if ($amount > (float) $lockedInvoice->paid_amount) {
                throw ValidationException::withMessages([
                    'amount' => 'Nominal refund melebihi total pembayaran yang telah diterima (Rp '.number_format($lockedInvoice->paid_amount, 0, ',', '.').').',
                ]);
            }

            $datePrefix = 'REF-'.now()->format('Ymd');
            $countToday = Refund::where('refund_number', 'like', "{$datePrefix}%")->count() + 1;
            $refundNumber = sprintf('%s-%04d', $datePrefix, $countToday);

            $refund = Refund::create([
                'invoice_id' => $lockedInvoice->id,
                'payment_id' => $payment?->id,
                'refund_number' => $refundNumber,
                'amount' => $amount,
                'reason' => $reason,
                'approved_by' => $user->id,
                'processed_at' => now(),
            ]);

            $newPaidAmount = max(0, (float) $lockedInvoice->paid_amount - $amount);
            $newStatus = ($newPaidAmount <= 0)
                ? 'finalized'
                : (($newPaidAmount < (float) $lockedInvoice->total_amount) ? 'partially_paid' : 'paid');

            $lockedInvoice->update([
                'paid_amount' => $newPaidAmount,
                'status' => $newStatus,
            ]);

            return $refund;
        });
    }
}
