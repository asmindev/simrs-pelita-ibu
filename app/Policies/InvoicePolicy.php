<?php

namespace App\Policies;

use App\Enums\Permissions\CashierPermission;
use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(CashierPermission::InvoiceView->value);
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->can(CashierPermission::InvoiceView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(CashierPermission::InvoiceCreate->value);
    }

    public function finalize(User $user, Invoice $invoice): bool
    {
        return $user->can(CashierPermission::InvoiceFinalize->value)
            && $invoice->status === 'draft';
    }

    public function void(User $user, Invoice $invoice): bool
    {
        return $user->can(CashierPermission::InvoiceVoid->value)
            && $invoice->status !== 'voided';
    }

    public function pay(User $user, Invoice $invoice): bool
    {
        return $user->can(CashierPermission::PaymentCreate->value)
            && ! $invoice->isPaid()
            && ! $invoice->isVoided();
    }

    public function refund(User $user, Invoice $invoice): bool
    {
        return $user->can(CashierPermission::RefundCreate->value)
            && (float) $invoice->paid_amount > 0;
    }
}
