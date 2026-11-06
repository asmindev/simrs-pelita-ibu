<?php

use App\Enums\RoleName;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleName::Admin->value);
});

test('patient index lists patients for users with permission', function () {
    $patient = Patient::factory()->create(['name' => 'Budi Santoso']);

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->get(route('master-data.patients.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('master-data/patient/index')
            ->has('patients.data', 1)
            ->where('patients.data.0.id', $patient->id)
            ->where('filters.search', '')
            ->where('filters.status', ''));
});

test('patient index filters by search and status', function () {
    Patient::factory()->create(['name' => 'Budi Santoso']);
    Patient::factory()->inactive()->create(['name' => 'Siti Aminah']);

    $this->actingAs($this->admin)
        ->get(route('master-data.patients.index', [
            'search' => 'Siti',
            'status' => 'inactive',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('patients.data', 1)
            ->where('patients.data.0.name', 'Siti Aminah'));
});

test('patient index is forbidden without permission', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Auditor->value);

    $this->actingAs($user)
        ->get(route('master-data.patients.index'))
        ->assertForbidden();
});

test('patient create page requires create permission', function () {
    $this->actingAs($this->admin)
        ->get(route('master-data.patients.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('master-data/patient/create'));

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->get(route('master-data.patients.create'))
        ->assertForbidden();
});

test('patient can be created and validated', function () {
    $payload = [
        'medical_record_number' => 'RM-000001',
        'nik' => '1234567890123456',
        'name' => 'Budi Santoso',
        'gender' => 'male',
        'birth_date' => '1990-01-01',
        'address' => 'Jl. Contoh 1',
        'phone' => '081234567890',
        'is_active' => true,
    ];

    $this->actingAs($this->admin)
        ->post(route('master-data.patients.store'), $payload)
        ->assertRedirect(route('master-data.patients.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('patients', [
        'medical_record_number' => 'RM-000001',
        'nik' => '1234567890123456',
        'name' => 'Budi Santoso',
        'gender' => 'male',
        'is_active' => true,
    ]);
});

test('patient creation rejects invalid and duplicate data', function () {
    $existing = Patient::factory()->create([
        'medical_record_number' => 'RM-EXISTING',
        'nik' => '1111111111111111',
    ]);

    $this->actingAs($this->admin)
        ->post(route('master-data.patients.store'), [
            'medical_record_number' => $existing->medical_record_number,
            'nik' => '123',
            'name' => '',
            'gender' => 'other',
            'birth_date' => now()->addDay()->toDateString(),
        ])
        ->assertSessionHasErrors([
            'medical_record_number',
            'nik',
            'name',
            'gender',
            'birth_date',
        ]);
});

test('patient can be updated without changing medical record number', function () {
    $patient = Patient::factory()->create([
        'medical_record_number' => 'RM-000002',
        'name' => 'Nama Lama',
    ]);

    $this->actingAs($this->admin)
        ->put(route('master-data.patients.update', $patient), [
            'nik' => $patient->nik,
            'name' => 'Nama Baru',
            'gender' => 'female',
            'birth_date' => $patient->birth_date->toDateString(),
            'address' => 'Alamat baru',
            'phone' => '081200000000',
            'is_active' => false,
        ])
        ->assertRedirect(route('master-data.patients.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('patients', [
        'id' => $patient->id,
        'medical_record_number' => 'RM-000002',
        'name' => 'Nama Baru',
        'gender' => 'female',
        'is_active' => false,
    ]);
});

test('patient update requires update permission', function () {
    $patient = Patient::factory()->create();

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->put(route('master-data.patients.update', $patient), [
            'nik' => $patient->nik,
            'name' => $patient->name,
            'gender' => $patient->gender->value,
            'birth_date' => $patient->birth_date->toDateString(),
        ])
        ->assertForbidden();
});

test('patient delete deactivates instead of removing the record', function () {
    $patient = Patient::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('master-data.patients.destroy', $patient))
        ->assertRedirect(route('master-data.patients.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('patients', [
        'id' => $patient->id,
        'is_active' => false,
    ]);
});

test('duplicate detection matches nik or name and birth date', function () {
    $patient = Patient::factory()->create([
        'medical_record_number' => 'RM-DUP-1',
        'nik' => '2222222222222222',
        'name' => 'Siti Aminah',
        'birth_date' => '1990-01-01',
    ]);
    $other = Patient::factory()->create([
        'medical_record_number' => 'RM-DUP-2',
        'nik' => '3333333333333333',
        'name' => 'Siti Aminah',
        'birth_date' => '1990-01-01',
    ]);

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->getJson(route('master-data.patients.duplicates', [
            'nik' => '2222222222222222',
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $patient->id);

    $this->actingAs($user)
        ->getJson(route('master-data.patients.duplicates', [
            'name' => 'Siti Aminah',
            'birth_date' => '1990-01-01',
            'exclude' => $patient->id,
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $other->id);
});
