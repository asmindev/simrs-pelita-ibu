<?php

namespace App\Policies;

use App\Enums\Permissions\PharmacyPermission;
use App\Models\DrugBatch;
use App\Models\User;

class DrugBatchPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(PharmacyPermission::StockView->value);
    }

    public function view(User $user, DrugBatch $batch): bool
    {
        return $user->can(PharmacyPermission::StockView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(PharmacyPermission::StockAdjust->value);
    }

    public function adjust(User $user, DrugBatch $batch): bool
    {
        return $user->can(PharmacyPermission::StockAdjust->value);
    }

    public function opname(User $user, DrugBatch $batch): bool
    {
        return $user->can(PharmacyPermission::StockOpname->value);
    }
}
