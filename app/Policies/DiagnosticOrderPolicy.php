<?php

namespace App\Policies;

use App\Enums\Permissions\DiagnosticsPermission;
use App\Models\DiagnosticOrder;
use App\Models\User;

class DiagnosticOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(DiagnosticsPermission::OrderView->value)
            || $user->can(DiagnosticsPermission::ResultView->value);
    }

    public function view(User $user, DiagnosticOrder $order): bool
    {
        return $user->can(DiagnosticsPermission::OrderView->value)
            || $user->can(DiagnosticsPermission::ResultView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(DiagnosticsPermission::OrderCreate->value);
    }

    public function inputResult(User $user, DiagnosticOrder $order): bool
    {
        return $user->can(DiagnosticsPermission::ResultInput->value)
            && $order->status !== 'cancelled';
    }

    public function complete(User $user, DiagnosticOrder $order): bool
    {
        return ($user->can(DiagnosticsPermission::ResultVerify->value)
            || $user->can(DiagnosticsPermission::ResultRelease->value))
            && $order->status !== 'cancelled';
    }
}
