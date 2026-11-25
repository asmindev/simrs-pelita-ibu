<?php

use App\Enums\RoleName;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('product category factory creates valid category', function () {
    $category = ProductCategory::factory()->create([
        'name' => 'Antibiotik',
        'description' => 'Obat pembasmi bakteri',
    ]);

    expect($category->name)->toBe('Antibiotik')
        ->and($category->description)->toBe('Obat pembasmi bakteri');
});

test('product category records activity log on creation and update', function () {
    $category = ProductCategory::factory()->create([
        'name' => 'Analgesik',
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => ProductCategory::class,
        'subject_id' => $category->id,
    ]);

    $category->update(['description' => 'Pereda nyeri']);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => ProductCategory::class,
        'subject_id' => $category->id,
    ]);
});

test('guest cannot manage product categories', function () {
    $this->post(route('master-data.product-categories.store'), ['name' => 'Antivirus'])
        ->assertRedirect(route('login'));
});

test('user without product manage permission cannot create product category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('master-data.product-categories.store'), ['name' => 'Antivirus'])
        ->assertForbidden();
});

test('pharmacist can create product category', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $this->actingAs($pharmacist)
        ->post(route('master-data.product-categories.store'), [
            'name' => 'BMHP Steril',
            'description' => 'Bahan medis habis pakai',
        ])
        ->assertSessionHas('success');

    $this->assertDatabaseHas('product_categories', [
        'name' => 'BMHP Steril',
        'description' => 'Bahan medis habis pakai',
    ]);
});

test('product category name must be unique', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    ProductCategory::factory()->create(['name' => 'Vitamin']);

    $this->actingAs($pharmacist)
        ->post(route('master-data.product-categories.store'), [
            'name' => 'Vitamin',
        ])
        ->assertSessionHasErrors(['name']);
});

test('pharmacist can update product category', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = ProductCategory::factory()->create(['name' => 'Suplemen']);

    $this->actingAs($pharmacist)
        ->put(route('master-data.product-categories.update', $category), [
            'name' => 'Suplemen Makanan',
            'description' => 'Penambah nafsu makan',
        ])
        ->assertSessionHas('success');

    $this->assertDatabaseHas('product_categories', [
        'id' => $category->id,
        'name' => 'Suplemen Makanan',
        'description' => 'Penambah nafsu makan',
    ]);
});

test('pharmacist can delete empty product category', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = ProductCategory::factory()->create();

    $this->actingAs($pharmacist)
        ->delete(route('master-data.product-categories.destroy', $category))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('product_categories', ['id' => $category->id]);
});

test('pharmacist cannot delete product category that has products', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = ProductCategory::factory()->create();
    Product::factory()->create(['product_category_id' => $category->id]);

    $this->actingAs($pharmacist)
        ->delete(route('master-data.product-categories.destroy', $category))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});
