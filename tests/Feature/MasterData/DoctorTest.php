<?php

use App\Enums\RoleName;
use App\Models\Doctor;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleName::Admin->value);
});

test('doctor index lists and filters doctors', function () {
    Doctor::factory()->create([
        'code' => 'DOK-001',
        'name' => 'dr. Budi Santoso',
        'specialization' => 'Penyakit Dalam',
    ]);
    Doctor::factory()->inactive()->create([
        'code' => 'DOK-002',
        'name' => 'dr. Siti Aminah',
        'specialization' => 'Anak',
    ]);

    $this->actingAs($this->admin)
        ->get(route('master-data.doctors.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('master-data/doctor/list/index')
            ->has('doctors.data', 2)
            ->where('filters.search', '')
            ->where('filters.status', ''));

    $this->actingAs($this->admin)
        ->get(route('master-data.doctors.index', [
            'search' => 'Budi',
            'status' => 'active',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('doctors.data', 1)
            ->where('doctors.data.0.name', 'dr. Budi Santoso'));
});

test('doctor index is forbidden without permission', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Auditor->value);

    $this->actingAs($user)
        ->get(route('master-data.doctors.index'))
        ->assertForbidden();
});

test('doctor create page requires manage permission', function () {
    $this->actingAs($this->admin)
        ->get(route('master-data.doctors.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('master-data/doctor/create/index'));

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->get(route('master-data.doctors.create'))
        ->assertForbidden();
});

test('doctor can be created and is recorded in activity log', function () {
    $this->actingAs($this->admin)
        ->post(route('master-data.doctors.store'), [
            'code' => 'DOK-010',
            'name' => 'dr. Budi Santoso',
            'specialization' => 'Penyakit Dalam',
            'license_number' => 'SIP-010',
            'phone' => '081234567890',
            'email' => 'budi@example.com',
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.doctors.index'))
        ->assertSessionHas('success');

    $doctor = Doctor::query()->where('code', 'DOK-010')->sole();

    $this->assertDatabaseHas('doctors', [
        'id' => $doctor->id,
        'name' => 'dr. Budi Santoso',
        'specialization' => 'Penyakit Dalam',
        'license_number' => 'SIP-010',
        'is_active' => true,
    ]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Doctor::class,
        'subject_id' => $doctor->id,
    ]);
});

test('doctor creation rejects invalid and duplicate data', function () {
    $existing = Doctor::factory()->create([
        'code' => 'DOK-EXIST',
        'license_number' => 'SIP-EXIST',
    ]);

    $this->actingAs($this->admin)
        ->post(route('master-data.doctors.store'), [
            'code' => $existing->code,
            'name' => '',
            'license_number' => $existing->license_number,
            'email' => 'bukan-email',
        ])
        ->assertSessionHasErrors(['code', 'name', 'license_number', 'email']);
});

test('doctor can be updated and is recorded in activity log', function () {
    $doctor = Doctor::factory()->create([
        'code' => 'DOK-A',
        'name' => 'dr. Nama Lama',
    ]);

    $this->actingAs($this->admin)
        ->put(route('master-data.doctors.update', $doctor), [
            'code' => 'DOK-A',
            'name' => 'dr. Nama Baru',
            'specialization' => 'Bedah',
            'license_number' => $doctor->license_number,
            'phone' => '081200000000',
            'email' => 'baru@example.com',
            'is_active' => false,
        ])
        ->assertRedirect(route('master-data.doctors.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('doctors', [
        'id' => $doctor->id,
        'code' => 'DOK-A',
        'name' => 'dr. Nama Baru',
        'specialization' => 'Bedah',
        'is_active' => false,
    ]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Doctor::class,
        'subject_id' => $doctor->id,
    ]);
});

test('doctor update requires manage permission', function () {
    $doctor = Doctor::factory()->create();

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->put(route('master-data.doctors.update', $doctor), [
            'code' => $doctor->code,
            'name' => $doctor->name,
        ])
        ->assertForbidden();
});

test('doctor delete deactivates instead of removing the record', function () {
    $doctor = Doctor::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('master-data.doctors.destroy', $doctor))
        ->assertRedirect(route('master-data.doctors.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('doctors', [
        'id' => $doctor->id,
        'is_active' => false,
    ]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Doctor::class,
        'subject_id' => $doctor->id,
    ]);
});
