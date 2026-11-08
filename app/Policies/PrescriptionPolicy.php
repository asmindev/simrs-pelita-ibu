<?php

namespace App\Policies;

use App\Enums\Permissions\PharmacyPermission;
use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(PharmacyPermission::PrescriptionView->value);
    }

    public function view(User $user, Prescription $prescription): bool
    {
        return $user->can(PharmacyPermission::PrescriptionView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(PharmacyPermission::PrescriptionCreate->value);
    }

    public function verify(User $user, Prescription $prescription): bool
    {
        return $user->can(PharmacyPermission::PrescriptionVerify->value)
            && in_array($prescription->status, ['submitted', 'draft']);
    }

    public function dispense(User $user, Prescription $prescription): bool
    {
        return $user->can(PharmacyPermission::DispensingCreate->value)
            && in_array($prescription->status, ['submitted', 'verified']);
    }

    public function printLabel(User $user, Prescription $prescription): bool
    {
        return $user->can(PharmacyPermission::LabelPrint->value);
    }

    public function cancel(User $user, Prescription $prescription): bool
    {
        return ($user->can(PharmacyPermission::PrescriptionVerify->value)
            || $user->can(PharmacyPermission::PrescriptionCreate->value))
            && $prescription->status !== 'dispensed';
    }

    public function return(User $user, Prescription $prescription): bool
    {
        return $user->can(PharmacyPermission::ReturnCreate->value)
            && $prescription->status === 'dispensed';
    }
}
