<?php

namespace App\Policies;

use App\Enums\Permissions\PharmacyPermission;
use App\Models\ProductBatch;
use App\Models\User;

class ProductBatchPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(PharmacyPermission::StockView->value);
    }

    public function view(User $user, ProductBatch $batch): bool
    {
        return $user->can(PharmacyPermission::StockView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(PharmacyPermission::StockAdjust->value);
    }

    public function adjust(User $user, ProductBatch $batch): bool
    {
        return $user->can(PharmacyPermission::StockAdjust->value);
    }

    public function opname(User $user, ProductBatch $batch): bool
    {
        return $user->can(PharmacyPermission::StockOpname->value);
    }
}
