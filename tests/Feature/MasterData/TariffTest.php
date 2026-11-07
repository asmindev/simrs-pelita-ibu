<?php

use App\Enums\RoleName;
use App\Enums\TariffCategory;
use App\Models\Tariff;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('tariff factory creates valid tariff optionally linked to a unit', function () {
    $unit = Unit::factory()->create();
    $tariff = Tariff::factory()->create([
        'code' => 'KONSUL-01',
        'name' => 'Konsultasi Dokter Umum',
        'category' => TariffCategory::Consultation,
        'price' => 50000,
        'unit_id' => $unit->id,
        'is_active' => true,
    ]);

    expect($tariff->code)->toBe('KONSUL-01')
        ->and($tariff->name)->toBe('Konsultasi Dokter Umum')
        ->and($tariff->category)->toBe(TariffCategory::Consultation)
        ->and($tariff->price)->toBe(50000)
        ->and($tariff->unit->id)->toBe($unit->id)
        ->and($tariff->is_active)->toBeTrue();
});

test('tariff factory inactive state creates inactive tariff', function () {
    $tariff = Tariff::factory()->inactive()->create();

    expect($tariff->is_active)->toBeFalse();
});

test('tariff records activity log on creation and update', function () {
    $tariff = Tariff::factory()->create([
        'code' => 'EKG-01',
        'name' => 'Pemeriksaan EKG',
        'category' => TariffCategory::Procedure,
        'price' => 75000,
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Tariff::class,
        'subject_id' => $tariff->id,
    ]);

    $tariff->update(['price' => 85000]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Tariff::class,
        'subject_id' => $tariff->id,
    ]);
});

test('tariff scope search filters by code or name', function () {
    Tariff::factory()->create([
        'code' => 'USG-01',
        'name' => 'Pemeriksaan USG Abdomen',
    ]);
    Tariff::factory()->create([
        'code' => 'DARAH-01',
        'name' => 'Hematologi Lengkap',
    ]);

    expect(Tariff::query()->search('USG')->count())->toBe(1)
        ->and(Tariff::query()->search('Hematologi')->count())->toBe(1)
        ->and(Tariff::query()->search('NonExistent')->count())->toBe(0);
});

test('tariff policy checks view and manage permissions', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole(RoleName::SuperAdmin->value);

    $tariff = Tariff::factory()->create();

    // Admin has both view and manage
    expect(Gate::forUser($admin)->allows('viewAny', Tariff::class))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('view', $tariff))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('create', Tariff::class))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('update', $tariff))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('delete', $tariff))->toBeTrue();

    // Auditor has no tariff view or manage permissions
    expect(Gate::forUser($auditor)->allows('viewAny', Tariff::class))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('view', $tariff))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('create', Tariff::class))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('update', $tariff))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('delete', $tariff))->toBeFalse();

    // SuperAdmin bypasses all
    expect(Gate::forUser($superAdmin)->allows('viewAny', Tariff::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('view', $tariff))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('create', Tariff::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('update', $tariff))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('delete', $tariff))->toBeTrue();
});
