<?php

use App\Enums\RoleName;
use App\Models\Drug;
use App\Models\DrugCategory;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('drug factory creates valid drug', function () {
    $category = DrugCategory::factory()->create(['name' => 'Antibiotik']);
    $drug = Drug::factory()->create([
        'code' => 'AMX-500',
        'name' => 'Amoxicillin 500mg',
        'drug_category_id' => $category->id,
        'form' => 'Kapsul',
        'strength' => '500 mg',
        'unit_of_measure' => 'Strip',
        'price' => 15000,
        'manufacturer' => 'Kimia Farma',
        'is_active' => true,
    ]);

    expect($drug->code)->toBe('AMX-500')
        ->and($drug->name)->toBe('Amoxicillin 500mg')
        ->and($drug->category->id)->toBe($category->id)
        ->and($drug->form)->toBe('Kapsul')
        ->and($drug->strength)->toBe('500 mg')
        ->and($drug->unit_of_measure)->toBe('Strip')
        ->and($drug->price)->toBe(15000)
        ->and($drug->manufacturer)->toBe('Kimia Farma')
        ->and($drug->is_active)->toBeTrue();
});

test('drug factory inactive state creates inactive drug', function () {
    $drug = Drug::factory()->inactive()->create();

    expect($drug->is_active)->toBeFalse();
});

test('drug records activity log on creation and update', function () {
    $drug = Drug::factory()->create([
        'code' => 'PCT-500',
        'name' => 'Paracetamol 500mg',
        'price' => 5000,
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Drug::class,
        'subject_id' => $drug->id,
    ]);

    $drug->update(['price' => 6000]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Drug::class,
        'subject_id' => $drug->id,
    ]);
});

test('guest cannot access drug index or endpoints', function () {
    $this->get(route('master-data.drugs.index'))->assertRedirect(route('login'));
    $this->get(route('master-data.drugs.create'))->assertRedirect(route('login'));
    $this->post(route('master-data.drugs.store'), [])->assertRedirect(route('login'));
});

test('user without drug view permission cannot view drug index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('master-data.drugs.index'))
        ->assertForbidden();
});

test('user with drug view permission can view drug index', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    $category = DrugCategory::factory()->create(['name' => 'Analgesik']);
    Drug::factory()->count(3)->create(['drug_category_id' => $category->id]);

    $this->actingAs($doctor)
        ->get(route('master-data.drugs.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/drug/list/index')
            ->has('drugs.data', 3)
            ->has('categories', 1)
        );
});

test('user with drug view permission can view drug show page with batches and stock movements', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    $category = DrugCategory::factory()->create(['name' => 'Antibiotik']);
    $drug = Drug::factory()->create(['drug_category_id' => $category->id]);

    $this->actingAs($doctor)
        ->get(route('master-data.drugs.show', $drug->id))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/drug/show/index')
            ->has('drug')
            ->where('drug.id', $drug->id)
            ->has('statistics.total_stock')
        );
});

test('drug index filters by search query on name, code, or manufacturer', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = DrugCategory::factory()->create();
    Drug::factory()->create([
        'code' => 'AMX-500',
        'name' => 'Amoxicillin Trihydrate',
        'manufacturer' => 'Bernofarm',
        'drug_category_id' => $category->id,
    ]);
    Drug::factory()->create([
        'code' => 'PCT-500',
        'name' => 'Paracetamol',
        'manufacturer' => 'Kalbe',
        'drug_category_id' => $category->id,
    ]);

    $this->actingAs($pharmacist)
        ->get(route('master-data.drugs.index', ['search' => 'Amox']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/drug/list/index')
            ->has('drugs.data', 1)
            ->where('drugs.data.0.code', 'AMX-500')
        );

    $this->actingAs($pharmacist)
        ->get(route('master-data.drugs.index', ['search' => 'Kalbe']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/drug/list/index')
            ->has('drugs.data', 1)
            ->where('drugs.data.0.code', 'PCT-500')
        );
});

test('drug index filters by category and active status', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $cat1 = DrugCategory::factory()->create(['name' => 'Kategori A']);
    $cat2 = DrugCategory::factory()->create(['name' => 'Kategori B']);

    Drug::factory()->create(['drug_category_id' => $cat1->id, 'is_active' => true]);
    Drug::factory()->create(['drug_category_id' => $cat1->id, 'is_active' => false]);
    Drug::factory()->create(['drug_category_id' => $cat2->id, 'is_active' => true]);

    $this->actingAs($pharmacist)
        ->get(route('master-data.drugs.index', ['category_id' => $cat1->id, 'status' => 'active']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/drug/list/index')
            ->has('drugs.data', 1)
            ->where('drugs.data.0.drug_category_id', $cat1->id)
            ->where('drugs.data.0.is_active', true)
        );
});

test('pharmacist can access create drug page and store valid drug', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = DrugCategory::factory()->create();

    $this->actingAs($pharmacist)
        ->get(route('master-data.drugs.create'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/drug/create/index')
            ->has('categories', 1)
        );

    $payload = [
        'code' => 'CET-10',
        'name' => 'Cetirizine 10mg',
        'drug_category_id' => $category->id,
        'form' => 'Tablet',
        'strength' => '10 mg',
        'unit_of_measure' => 'Strip',
        'price' => 12000,
        'manufacturer' => 'Sanbe Farma',
        'is_active' => true,
    ];

    $this->actingAs($pharmacist)
        ->post(route('master-data.drugs.store'), $payload)
        ->assertRedirect(route('master-data.drugs.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('drugs', [
        'code' => 'CET-10',
        'name' => 'Cetirizine 10mg',
        'price' => 12000,
    ]);
});

test('store drug requires unique code and valid foreign key', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $existing = Drug::factory()->create(['code' => 'DUP-01']);

    $this->actingAs($pharmacist)
        ->post(route('master-data.drugs.store'), [
            'code' => 'DUP-01',
            'name' => 'Duplicate Drug',
            'drug_category_id' => 99999, // non-existent
            'form' => 'Tablet',
            'strength' => '500 mg',
            'unit_of_measure' => 'Tablet',
            'price' => 1000,
            'manufacturer' => 'Pharma',
        ])
        ->assertSessionHasErrors(['code', 'drug_category_id']);
});

test('pharmacist can edit and update drug', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create([
        'code' => 'IBU-400',
        'name' => 'Ibuprofen 400mg',
        'price' => 8000,
    ]);

    $this->actingAs($pharmacist)
        ->get(route('master-data.drugs.edit', $drug))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/drug/edit/index')
            ->where('drug.id', $drug->id)
        );

    $this->actingAs($pharmacist)
        ->put(route('master-data.drugs.update', $drug), [
            'code' => 'IBU-400',
            'name' => 'Ibuprofen Forte 400mg',
            'drug_category_id' => $drug->drug_category_id,
            'form' => 'Kaplet',
            'strength' => '400 mg',
            'unit_of_measure' => 'Strip',
            'price' => 10000,
            'manufacturer' => 'Tempo Scan',
            'is_active' => false,
        ])
        ->assertRedirect(route('master-data.drugs.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('drugs', [
        'id' => $drug->id,
        'name' => 'Ibuprofen Forte 400mg',
        'price' => 10000,
        'is_active' => false,
    ]);
});

test('pharmacist can delete drug', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();

    $this->actingAs($pharmacist)
        ->delete(route('master-data.drugs.destroy', $drug))
        ->assertRedirect(route('master-data.drugs.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('drugs', ['id' => $drug->id]);
});
