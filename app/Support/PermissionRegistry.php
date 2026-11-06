<?php

namespace App\Support;

use App\Enums\Permissions\AuditPermission;
use App\Enums\Permissions\CashierPermission;
use App\Enums\Permissions\DiagnosticsPermission;
use App\Enums\Permissions\InpatientPermission;
use App\Enums\Permissions\MasterDataPermission;
use App\Enums\Permissions\MedicalRecordPermission;
use App\Enums\Permissions\PharmacyPermission;
use App\Enums\Permissions\RbacPermission;
use App\Enums\Permissions\RegistrationPermission;

final class PermissionRegistry
{
    /**
     * @return array<int, class-string<\BackedEnum>>
     */
    public static function enums(): array
    {
        return [
            MasterDataPermission::class,
            RegistrationPermission::class,
            MedicalRecordPermission::class,
            PharmacyPermission::class,
            CashierPermission::class,
            DiagnosticsPermission::class,
            InpatientPermission::class,
            RbacPermission::class,
            AuditPermission::class,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        $permissions = [];

        foreach (self::enums() as $enum) {
            foreach ($enum::cases() as $case) {
                $permissions[] = $case->value;
            }
        }

        return array_values(array_unique($permissions));
    }

    /**
     * @return array<string, array<int, string>>
     */
    public static function byDomain(): array
    {
        $domains = [];

        foreach (self::all() as $permission) {
            [$domain] = explode('.', $permission, 2);
            $domains[$domain][] = $permission;
        }

        return $domains;
    }
}
