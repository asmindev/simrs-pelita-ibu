<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\Tariff;
use App\Models\User;

class TariffPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::TariffView->value);
    }

    public function view(User $user, Tariff $tariff): bool
    {
        return $user->can(MasterDataPermission::TariffView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::TariffManage->value);
    }

    public function update(User $user, Tariff $tariff): bool
    {
        return $user->can(MasterDataPermission::TariffManage->value);
    }

    public function delete(User $user, Tariff $tariff): bool
    {
        return $user->can(MasterDataPermission::TariffManage->value);
    }
}
