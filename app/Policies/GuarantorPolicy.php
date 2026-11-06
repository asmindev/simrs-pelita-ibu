<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\Guarantor;
use App\Models\User;

class GuarantorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::GuarantorView->value);
    }

    public function view(User $user, Guarantor $guarantor): bool
    {
        return $user->can(MasterDataPermission::GuarantorView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::GuarantorManage->value);
    }

    public function update(User $user, Guarantor $guarantor): bool
    {
        return $user->can(MasterDataPermission::GuarantorManage->value);
    }

    public function delete(User $user, Guarantor $guarantor): bool
    {
        return $user->can(MasterDataPermission::GuarantorManage->value);
    }
}
