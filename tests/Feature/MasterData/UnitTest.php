<?php

use App\Enums\RoleName;
use App\Enums\UnitType;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleName::Admin->value);
});

test('unit index lists and filters units', function () {
    Unit::factory()->create([
        'code' => 'POLI-UMUM',
        'name' => 'Poli Umum',
        'type' => UnitType::Outpatient,
    ]);
    Unit::factory()->inactive()->create([
        'code' => 'LAB-01',
        'name' => 'Laboratorium',
        'type' => UnitType::Laboratory,
    ]);

    $this->actingAs($this->admin)
        ->get(route('master-data.units.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('master-data/unit/index')
            ->has('units.data', 2)
            ->where('filters.search', '')
            ->where('filters.type', '')
            ->where('filters.status', ''));

    $this->actingAs($this->admin)
        ->get(route('master-data.units.index', [
            'search' => 'Poli',
            'type' => 'outpatient',
            'status' => 'active',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('units.data', 1)
            ->where('units.data.0.name', 'Poli Umum'));
});

test('unit index is forbidden without permission', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Auditor->value);

    $this->actingAs($user)
        ->get(route('master-data.units.index'))
        ->assertForbidden();
});

test('unit create page requires manage permission', function () {
    $this->actingAs($this->admin)
        ->get(route('master-data.units.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('master-data/unit/create'));

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->get(route('master-data.units.create'))
        ->assertForbidden();
});

test('unit can be created and is recorded in activity log', function () {
    $this->actingAs($this->admin)
        ->post(route('master-data.units.store'), [
            'code' => 'POLI-01',
            'name' => 'Poli Penyakit Dalam',
            'description' => 'Pelayanan rawat jalan penyakit dalam.',
            'type' => 'outpatient',
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.units.index'))
        ->assertSessionHas('success');

    $unit = Unit::query()->where('code', 'POLI-01')->sole();

    $this->assertDatabaseHas('units', [
        'id' => $unit->id,
        'name' => 'Poli Penyakit Dalam',
        'description' => 'Pelayanan rawat jalan penyakit dalam.',
        'type' => 'outpatient',
        'is_active' => true,
    ]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Unit::class,
        'subject_id' => $unit->id,
    ]);
});

test('unit creation rejects invalid and duplicate data', function () {
    Unit::factory()->create(['code' => 'UNIT-EXIST']);

    $this->actingAs($this->admin)
        ->post(route('master-data.units.store'), [
            'code' => 'UNIT-EXIST',
            'name' => '',
            'type' => 'invalid',
        ])
        ->assertSessionHasErrors(['code', 'name', 'type']);
});

test('unit can be updated and is recorded in activity log', function () {
    $unit = Unit::factory()->create([
        'code' => 'UNIT-A',
        'name' => 'Nama Lama',
        'type' => UnitType::Outpatient,
    ]);

    $this->actingAs($this->admin)
        ->put(route('master-data.units.update', $unit), [
            'code' => 'UNIT-A',
            'name' => 'Nama Baru',
            'description' => 'Deskripsi baru.',
            'type' => 'inpatient',
            'is_active' => false,
        ])
        ->assertRedirect(route('master-data.units.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('units', [
        'id' => $unit->id,
        'code' => 'UNIT-A',
        'name' => 'Nama Baru',
        'type' => 'inpatient',
        'is_active' => false,
    ]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Unit::class,
        'subject_id' => $unit->id,
    ]);
});

test('unit update requires manage permission', function () {
    $unit = Unit::factory()->create();

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->put(route('master-data.units.update', $unit), [
            'code' => $unit->code,
            'name' => $unit->name,
            'type' => $unit->type->value,
        ])
        ->assertForbidden();
});

test('unit delete deactivates instead of removing the record', function () {
    $unit = Unit::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('master-data.units.destroy', $unit))
        ->assertRedirect(route('master-data.units.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('units', [
        'id' => $unit->id,
        'is_active' => false,
    ]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Unit::class,
        'subject_id' => $unit->id,
    ]);
});
