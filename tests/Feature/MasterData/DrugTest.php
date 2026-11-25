<?php

use App\Enums\ProductType;
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

test('product factory creates valid drug and non-drug products', function () {
    $category = DrugCategory::factory()->create(['name' => 'Antibiotik']);
    $drug = Drug::factory()->create([
        'code' => 'AMX-500',
        'name' => 'Amoxicillin 500mg',
        'product_type' => ProductType::Drug->value,
        'drug_category_id' => $category->id,
        'form' => 'Kapsul',
        'strength' => '500 mg',
        'unit_of_measure' => 'Strip',
        'price' => 15000,
        'manufacturer' => 'Kimia Farma',
        'is_active' => true,
    ]);

    $supply = Drug::factory()->medicalSupply()->create([
        'code' => 'ALK-001',
        'name' => 'Spuit 3cc Terumo',
    ]);

    expect($drug->code)->toBe('AMX-500')
        ->and($drug->product_type)->toBe(ProductType::Drug)
        ->and($drug->category->id)->toBe($category->id)
        ->and($supply->product_type)->toBe(ProductType::MedicalSupply)
        ->and($supply->form)->toBeNull()
        ->and($supply->strength)->toBeNull();
});

test('product factory inactive state creates inactive product', function () {
    $product = Drug::factory()->inactive()->create();

    expect($product->is_active)->toBeFalse();
});

test('product records activity log on creation and update', function () {
    $product = Drug::factory()->create([
        'code' => 'PCT-500',
        'name' => 'Paracetamol 500mg',
        'price' => 5000,
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Drug::class,
        'subject_id' => $product->id,
    ]);

    $product->update(['price' => 6000]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Drug::class,
        'subject_id' => $product->id,
    ]);
});

test('guest cannot access product index or endpoints', function () {
    $this->get(route('master-data.products.index'))->assertRedirect(route('login'));
    $this->get(route('master-data.products.create'))->assertRedirect(route('login'));
    $this->post(route('master-data.products.store'), [])->assertRedirect(route('login'));
});

test('user without product view permission cannot view product index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('master-data.products.index'))
        ->assertForbidden();
});

test('user with product view permission can view product index', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    $category = DrugCategory::factory()->create(['name' => 'Analgesik']);
    Drug::factory()->count(3)->create(['drug_category_id' => $category->id]);

    $this->actingAs($doctor)
        ->get(route('master-data.products.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/list/index')
            ->has('products.data', 3)
            ->has('categories', 1)
            ->has('productTypes', 4)
        );
});

test('user with product view permission can view product show page with batches and stock movements', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    $category = DrugCategory::factory()->create(['name' => 'Antibiotik']);
    $product = Drug::factory()->create(['drug_category_id' => $category->id]);

    $this->actingAs($doctor)
        ->get(route('master-data.products.show', $product->id))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/show/index')
            ->has('product')
            ->where('product.id', $product->id)
            ->has('statistics.total_stock')
            ->has('statistics.locations_count')
            ->has('statistics.movements_count')
            ->has('statistics.total_valuation')
            ->has('statistics.average_cost')
        );
});

test('product index filters by search query, product type, category, and active status', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $cat1 = DrugCategory::factory()->create(['name' => 'Kategori A']);
    $cat2 = DrugCategory::factory()->create(['name' => 'Kategori B']);

    Drug::factory()->create([
        'code' => 'AMX-500',
        'name' => 'Amoxicillin Trihydrate',
        'product_type' => ProductType::Drug->value,
        'manufacturer' => 'Bernofarm',
        'drug_category_id' => $cat1->id,
        'is_active' => true,
    ]);
    Drug::factory()->medicalSupply()->create([
        'code' => 'ALK-001',
        'name' => 'Spuit 3cc',
        'manufacturer' => 'Terumo',
        'drug_category_id' => $cat2->id,
        'is_active' => true,
    ]);
    Drug::factory()->create([
        'code' => 'PCT-500',
        'name' => 'Paracetamol',
        'product_type' => ProductType::Drug->value,
        'manufacturer' => 'Kalbe',
        'drug_category_id' => $cat1->id,
        'is_active' => false,
    ]);

    $this->actingAs($pharmacist)
        ->get(route('master-data.products.index', ['search' => 'Amox']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/list/index')
            ->has('products.data', 1)
            ->where('products.data.0.code', 'AMX-500')
        );

    $this->actingAs($pharmacist)
        ->get(route('master-data.products.index', ['product_type' => ProductType::MedicalSupply->value]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/list/index')
            ->has('products.data', 1)
            ->where('products.data.0.code', 'ALK-001')
        );

    $this->actingAs($pharmacist)
        ->get(route('master-data.products.index', ['category_id' => $cat1->id, 'status' => 'active']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/list/index')
            ->has('products.data', 1)
            ->where('products.data.0.drug_category_id', $cat1->id)
            ->where('products.data.0.is_active', true)
        );
});

test('pharmacist can create drug product and non-drug medical supply product', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = DrugCategory::factory()->create();

    $this->actingAs($pharmacist)
        ->get(route('master-data.products.create'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/create/index')
            ->has('categories', 1)
            ->has('productTypes', 4)
        );

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.store'), [
            'code' => 'CET-10',
            'name' => 'Cetirizine 10mg',
            'product_type' => ProductType::Drug->value,
            'drug_category_id' => $category->id,
            'form' => 'Tablet',
            'strength' => '10 mg',
            'unit_of_measure' => 'Strip',
            'price' => 12000,
            'manufacturer' => 'Sanbe Farma',
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.products.index'))
        ->assertSessionHas('success');

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.store'), [
            'code' => 'ALK-SP3',
            'name' => 'Spuit 3cc Disposable',
            'product_type' => ProductType::MedicalSupply->value,
            'drug_category_id' => $category->id,
            'unit_of_measure' => 'Pcs',
            'price' => 3500,
            'description' => 'Spuit steril sekali pakai 3 ml',
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('drugs', [
        'code' => 'ALK-SP3',
        'product_type' => ProductType::MedicalSupply->value,
        'form' => null,
        'strength' => null,
    ]);
});

test('store drug product requires form and strength while rejecting duplicate code', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    Drug::factory()->create(['code' => 'DUP-01']);

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.store'), [
            'code' => 'DUP-01',
            'name' => 'Duplicate Drug',
            'product_type' => ProductType::Drug->value,
            'drug_category_id' => 99999,
            'unit_of_measure' => 'Tablet',
            'price' => 1000,
        ])
        ->assertSessionHasErrors(['code', 'drug_category_id', 'form', 'strength']);
});

test('pharmacist can edit and update product', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $product = Drug::factory()->create([
        'code' => 'IBU-400',
        'name' => 'Ibuprofen 400mg',
        'price' => 8000,
    ]);

    $this->actingAs($pharmacist)
        ->get(route('master-data.products.edit', $product))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/edit/index')
            ->where('product.id', $product->id)
        );

    $this->actingAs($pharmacist)
        ->put(route('master-data.products.update', $product), [
            'code' => 'IBU-400',
            'name' => 'Ibuprofen Forte 400mg',
            'product_type' => ProductType::Drug->value,
            'drug_category_id' => $product->drug_category_id,
            'form' => 'Kaplet',
            'strength' => '400 mg',
            'unit_of_measure' => 'Strip',
            'price' => 10000,
            'manufacturer' => 'Tempo Scan',
            'is_active' => false,
        ])
        ->assertRedirect(route('master-data.products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('drugs', [
        'id' => $product->id,
        'name' => 'Ibuprofen Forte 400mg',
        'price' => 10000,
        'is_active' => false,
    ]);
});

test('pharmacist can delete product', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $product = Drug::factory()->create();

    $this->actingAs($pharmacist)
        ->delete(route('master-data.products.destroy', $product))
        ->assertRedirect(route('master-data.products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('drugs', ['id' => $product->id]);
});
