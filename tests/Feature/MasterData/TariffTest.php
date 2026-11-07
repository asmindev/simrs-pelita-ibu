<?php

use App\Enums\RoleName;
use App\Enums\TariffCategory;
use App\Models\Tariff;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia;

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

test('tariff index lists and filters tariffs by search, category, unit, and status', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $unit = Unit::factory()->create(['name' => 'Poli Umum']);
    Tariff::factory()->create([
        'code' => 'KONSUL-01',
        'name' => 'Konsultasi Dokter Umum',
        'category' => TariffCategory::Consultation,
        'unit_id' => $unit->id,
        'price' => 50000,
        'is_active' => true,
    ]);
    Tariff::factory()->inactive()->create([
        'code' => 'EKG-01',
        'name' => 'Pemeriksaan EKG',
        'category' => TariffCategory::Procedure,
        'unit_id' => null,
        'price' => 75000,
        'is_active' => false,
    ]);

    $this->actingAs($admin)
        ->get(route('master-data.tariffs.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/tariff/list/index')
            ->has('tariffs.data', 2)
            ->where('filters.search', '')
            ->where('filters.category', '')
            ->where('filters.unit_id', '')
            ->where('filters.status', '')
        );

    $this->actingAs($admin)
        ->get(route('master-data.tariffs.index', [
            'search' => 'Konsultasi',
            'category' => 'consultation',
            'unit_id' => (string) $unit->id,
            'status' => 'active',
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('tariffs.data', 1)
            ->where('tariffs.data.0.code', 'KONSUL-01')
        );
});

test('tariff index requires view permission', function () {
    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $this->actingAs($auditor)
        ->get(route('master-data.tariffs.index'))
        ->assertForbidden();
});

test('admin can create tariff with valid unit and activity log', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $unit = Unit::factory()->create();

    $response = $this->actingAs($admin)
        ->post(route('master-data.tariffs.store'), [
            'code' => 'DARAH-01',
            'name' => 'Darah Lengkap Rutin',
            'category' => 'laboratory',
            'price' => 90000,
            'unit_id' => $unit->id,
            'description' => 'Pemeriksaan DL rutin',
            'is_active' => true,
        ]);

    $response->assertRedirect(route('master-data.tariffs.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('tariffs', [
        'code' => 'DARAH-01',
        'price' => 90000,
        'unit_id' => $unit->id,
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Tariff::class,
    ]);
});

test('store rejects duplicate code, negative price, and invalid unit', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    Tariff::factory()->create(['code' => 'EXISTING']);

    $response = $this->actingAs($admin)
        ->post(route('master-data.tariffs.store'), [
            'code' => 'EXISTING',
            'name' => 'Tarif Invalid',
            'category' => 'consultation',
            'price' => -5000,
            'unit_id' => 999999,
        ]);

    $response->assertSessionHasErrors(['code', 'price', 'unit_id']);
});

test('admin can update tariff and change unit binding', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $unit1 = Unit::factory()->create();
    $unit2 = Unit::factory()->create();

    $tariff = Tariff::factory()->create([
        'code' => 'RAWAT-01',
        'unit_id' => $unit1->id,
        'price' => 100000,
    ]);

    $response = $this->actingAs($admin)
        ->put(route('master-data.tariffs.update', $tariff), [
            'code' => 'RAWAT-01',
            'name' => 'Rawat Luka Sedang',
            'category' => 'procedure',
            'price' => 150000,
            'unit_id' => $unit2->id,
            'is_active' => false,
        ]);

    $response->assertRedirect(route('master-data.tariffs.index'))
        ->assertSessionHas('success');

    expect($tariff->fresh()->price)->toBe(150000)
        ->and($tariff->fresh()->unit_id)->toBe($unit2->id)
        ->and($tariff->fresh()->is_active)->toBeFalse();
});

test('admin can delete tariff', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $tariff = Tariff::factory()->create();

    $response = $this->actingAs($admin)
        ->delete(route('master-data.tariffs.destroy', $tariff));

    $response->assertRedirect(route('master-data.tariffs.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('tariffs', ['id' => $tariff->id]);
});
