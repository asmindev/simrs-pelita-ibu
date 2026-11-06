<?php

use App\Enums\RoleName;
use App\Enums\UnitType;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('user unit relations and helpers work', function () {
    $user = User::factory()->create();
    $primary = Unit::factory()->create(['type' => UnitType::Outpatient]);
    $secondary = Unit::factory()->create(['type' => UnitType::Laboratory]);

    $user->units()->attach($primary->id, ['is_primary' => true]);
    $user->units()->attach($secondary->id, ['is_primary' => false]);

    expect($user->unitIds())->toHaveCount(2)
        ->and($user->hasUnitAccess($primary->id))->toBeTrue()
        ->and($user->hasUnitAccess(999999))->toBeFalse()
        ->and($user->primaryUnit()?->id)->toBe($primary->id);
});

test('unit type is cast to an enum', function () {
    $unit = Unit::factory()->create(['type' => UnitType::Radiology]);

    expect($unit->fresh()->type)->toBe(UnitType::Radiology);
});

test('active scope filters inactive units', function () {
    Unit::factory()->create();
    Unit::factory()->inactive()->create();

    expect(Unit::active()->count())->toBe(1);
});

test('unit policy uses master data permissions', function () {
    $unit = Unit::factory()->create();

    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    expect(Gate::forUser($admin)->allows('create', Unit::class))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('update', $unit))->toBeTrue()
        ->and(Gate::forUser($doctor)->allows('view', $unit))->toBeTrue()
        ->and(Gate::forUser($doctor)->allows('create', Unit::class))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('view', $unit))->toBeFalse();
});

test('super admin bypasses unit policy', function () {
    $unit = Unit::factory()->create();

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole(RoleName::SuperAdmin->value);

    expect(Gate::forUser($superAdmin)->allows('create', Unit::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('delete', $unit))->toBeTrue();
});
