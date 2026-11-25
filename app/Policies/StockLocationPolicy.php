<?php

namespace App\Policies;

use App\Enums\Permissions\PharmacyPermission;
use App\Models\StockLocation;
use App\Models\User;

class StockLocationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(PharmacyPermission::StockView->value);
    }

    public function view(User $user, StockLocation $stockLocation): bool
    {
        return $user->can(PharmacyPermission::StockView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(PharmacyPermission::StockAdjust->value);
    }

    public function update(User $user, StockLocation $stockLocation): bool
    {
        return $user->can(PharmacyPermission::StockAdjust->value);
    }

    public function delete(User $user, StockLocation $stockLocation): bool
    {
        return $user->can(PharmacyPermission::StockAdjust->value);
    }
}
