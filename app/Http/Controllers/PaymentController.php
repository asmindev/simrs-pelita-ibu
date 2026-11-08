<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecordPaymentRequest;
use App\Http\Requests\RefundPaymentRequest;
use App\Models\Invoice;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function store(RecordPaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        Gate::authorize('pay', $invoice);

        $payment = $this->paymentService->recordPayment(
            $invoice,
            $request->validated(),
            $request->user()
        );

        $msg = "Pembayaran {$payment->payment_number} berhasil dicatat.";
        if ($payment->change_amount > 0) {
            $msg .= ' Kembalian: Rp '.number_format($payment->change_amount, 0, ',', '.');
        }

        return back()->with('success', $msg);
    }

    public function refund(RefundPaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        Gate::authorize('refund', $invoice);

        $refund = $this->paymentService->processRefund(
            $invoice,
            (float) $request->validated('amount'),
            $request->validated('reason'),
            $request->user()
        );

        return back()->with('success', "Refund {$refund->refund_number} sebesar Rp ".number_format($refund->amount, 0, ',', '.').' berhasil diproses.');
    }
}
