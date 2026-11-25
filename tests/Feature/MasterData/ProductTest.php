<?php

use App\Enums\ProductType;
use App\Enums\RoleName;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('product factory creates valid drug and non-drug products', function () {
    $category = ProductCategory::factory()->create(['name' => 'Antibiotik']);
    $drug = Product::factory()->create([
        'code' => 'AMX-500',
        'name' => 'Amoxicillin 500mg',
        'product_type' => ProductType::Drug->value,
        'product_category_id' => $category->id,
        'form' => 'Kapsul',
        'strength' => '500 mg',
        'unit_of_measure' => 'Strip',
        'price' => 15000,
        'manufacturer' => 'Kimia Farma',
        'is_active' => true,
    ]);

    $supply = Product::factory()->medicalSupply()->create([
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
    $product = Product::factory()->inactive()->create();

    expect($product->is_active)->toBeFalse();
});

test('product records activity log on creation and update', function () {
    $product = Product::factory()->create([
        'code' => 'PCT-500',
        'name' => 'Paracetamol 500mg',
        'price' => 5000,
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Product::class,
        'subject_id' => $product->id,
    ]);

    $product->update(['price' => 6000]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Product::class,
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

    $category = ProductCategory::factory()->create(['name' => 'Analgesik']);
    Product::factory()->count(3)->create(['product_category_id' => $category->id]);

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

    $category = ProductCategory::factory()->create(['name' => 'Antibiotik']);
    $product = Product::factory()->create(['product_category_id' => $category->id]);

    $this->actingAs($doctor)
        ->get(route('master-data.products.show', $product->id))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/product/show/index')
            ->has('product')
            ->has('categories', 1)
            ->has('productTypes', 4)
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

    $cat1 = ProductCategory::factory()->create(['name' => 'Kategori A']);
    $cat2 = ProductCategory::factory()->create(['name' => 'Kategori B']);

    Product::factory()->create([
        'code' => 'AMX-500',
        'name' => 'Amoxicillin Trihydrate',
        'product_type' => ProductType::Drug->value,
        'manufacturer' => 'Bernofarm',
        'product_category_id' => $cat1->id,
        'is_active' => true,
    ]);
    Product::factory()->medicalSupply()->create([
        'code' => 'ALK-001',
        'name' => 'Spuit 3cc',
        'manufacturer' => 'Terumo',
        'product_category_id' => $cat2->id,
        'is_active' => true,
    ]);
    Product::factory()->create([
        'code' => 'PCT-500',
        'name' => 'Paracetamol',
        'product_type' => ProductType::Drug->value,
        'manufacturer' => 'Kalbe',
        'product_category_id' => $cat1->id,
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
            ->where('products.data.0.product_category_id', $cat1->id)
            ->where('products.data.0.is_active', true)
        );
});

test('pharmacist can create drug product and non-drug medical supply product', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = ProductCategory::factory()->create();

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
            'product_category_id' => $category->id,
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
            'product_category_id' => $category->id,
            'unit_of_measure' => 'Pcs',
            'price' => 3500,
            'description' => 'Spuit steril sekali pakai 3 ml',
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('products', [
        'code' => 'ALK-SP3',
        'product_type' => ProductType::MedicalSupply->value,
        'form' => null,
        'strength' => null,
    ]);
});

test('store drug product requires form and strength while rejecting duplicate code', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    Product::factory()->create(['code' => 'DUP-01']);

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.store'), [
            'code' => 'DUP-01',
            'name' => 'Duplicate Product',
            'product_type' => ProductType::Drug->value,
            'product_category_id' => 99999,
            'unit_of_measure' => 'Tablet',
            'price' => 1000,
        ])
        ->assertSessionHasErrors(['code', 'product_category_id', 'form', 'strength']);
});

test('pharmacist can edit and update product', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $product = Product::factory()->create([
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
            'product_category_id' => $product->product_category_id,
            'form' => 'Kaplet',
            'strength' => '400 mg',
            'unit_of_measure' => 'Strip',
            'price' => 10000,
            'manufacturer' => 'Tempo Scan',
            'is_active' => false,
        ])
        ->assertRedirect(route('master-data.products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Ibuprofen Forte 400mg',
        'price' => 10000,
        'is_active' => false,
    ]);
});

test('pharmacist can delete product', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $product = Product::factory()->create();

    $this->actingAs($pharmacist)
        ->delete(route('master-data.products.destroy', $product))
        ->assertRedirect(route('master-data.products.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('pharmacist can upload, replace, and remove product image and destroy cleans up file', function () {
    Storage::fake('public');

    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = ProductCategory::factory()->create();

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.store'), [
            'code' => 'IMG-01',
            'name' => 'Betadine 60ml',
            'product_type' => ProductType::MedicalSupply->value,
            'product_category_id' => $category->id,
            'unit_of_measure' => 'Botol',
            'price' => 25000,
            'image' => UploadedFile::fake()->image('betadine.jpg', 300, 300),
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.products.index'));

    $product = Product::where('code', 'IMG-01')->firstOrFail();
    $firstImagePath = $product->image_path;

    expect($firstImagePath)->not->toBeNull()
        ->and($product->image_url)->toContain($firstImagePath);
    Storage::disk('public')->assertExists($firstImagePath);

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.update', $product), [
            '_method' => 'put',
            'code' => 'IMG-01',
            'name' => 'Betadine Solution 60ml',
            'product_type' => ProductType::MedicalSupply->value,
            'product_category_id' => $category->id,
            'unit_of_measure' => 'Botol',
            'price' => 26000,
            'image' => UploadedFile::fake()->image('betadine-v2.png', 400, 400),
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.products.index'));

    $product->refresh();
    $secondImagePath = $product->image_path;

    expect($secondImagePath)->not->toBeNull()
        ->and($secondImagePath)->not->toBe($firstImagePath);
    Storage::disk('public')->assertMissing($firstImagePath);
    Storage::disk('public')->assertExists($secondImagePath);

    $this->actingAs($pharmacist)
        ->delete(route('master-data.products.destroy', $product))
        ->assertRedirect(route('master-data.products.index'));

    Storage::disk('public')->assertMissing($secondImagePath);
});

test('pharmacist can remove existing product image via update', function () {
    Storage::fake('public');

    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $path = UploadedFile::fake()->image('existing.jpg')->store('products', 'public');
    $product = Product::factory()->create([
        'product_type' => ProductType::General->value,
        'form' => null,
        'strength' => null,
        'image_path' => $path,
    ]);

    Storage::disk('public')->assertExists($path);

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.update', $product), [
            '_method' => 'put',
            'code' => $product->code,
            'name' => $product->name,
            'product_type' => ProductType::General->value,
            'product_category_id' => $product->product_category_id,
            'unit_of_measure' => $product->unit_of_measure,
            'price' => $product->price,
            'remove_image' => true,
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.products.index'));

    $product->refresh();

    expect($product->image_path)->toBeNull()
        ->and($product->image_url)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('pharmacist can update product inline and stay on product detail page', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $product = Product::factory()->create([
        'code' => 'INL-01',
        'name' => 'Inline Awal',
        'price' => 5000,
    ]);

    $this->actingAs($pharmacist)
        ->post(route('master-data.products.update', $product), [
            '_method' => 'put',
            'inline' => true,
            'code' => 'INL-01',
            'name' => 'Inline Terbarui',
            'product_type' => ProductType::Drug->value,
            'product_category_id' => $product->product_category_id,
            'form' => 'Tablet',
            'strength' => '500 mg',
            'unit_of_measure' => 'Tablet',
            'price' => 7500,
            'is_active' => true,
        ])
        ->assertRedirect(route('master-data.products.show', $product))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Inline Terbarui',
        'price' => 7500,
    ]);
});
