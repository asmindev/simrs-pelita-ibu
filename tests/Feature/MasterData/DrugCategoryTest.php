<?php

use App\Enums\RoleName;
use App\Models\Drug;
use App\Models\DrugCategory;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('drug category factory creates valid category', function () {
    $category = DrugCategory::factory()->create([
        'name' => 'Antibiotik',
        'description' => 'Obat pembasmi bakteri',
    ]);

    expect($category->name)->toBe('Antibiotik')
        ->and($category->description)->toBe('Obat pembasmi bakteri');
});

test('drug category records activity log on creation and update', function () {
    $category = DrugCategory::factory()->create([
        'name' => 'Analgesik',
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => DrugCategory::class,
        'subject_id' => $category->id,
    ]);

    $category->update(['description' => 'Pereda nyeri']);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => DrugCategory::class,
        'subject_id' => $category->id,
    ]);
});

test('guest cannot manage drug categories', function () {
    $this->post(route('master-data.drug-categories.store'), ['name' => 'Antivirus'])
        ->assertRedirect(route('login'));
});

test('user without drug manage permission cannot create drug category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('master-data.drug-categories.store'), ['name' => 'Antivirus'])
        ->assertForbidden();
});

test('pharmacist can create drug category', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $this->actingAs($pharmacist)
        ->post(route('master-data.drug-categories.store'), [
            'name' => 'Antasida',
            'description' => 'Pereda asam lambung',
        ])
        ->assertSessionHas('success');

    $this->assertDatabaseHas('drug_categories', [
        'name' => 'Antasida',
        'description' => 'Pereda asam lambung',
    ]);
});

test('drug category name must be unique', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    DrugCategory::factory()->create(['name' => 'Vitamin']);

    $this->actingAs($pharmacist)
        ->post(route('master-data.drug-categories.store'), [
            'name' => 'Vitamin',
        ])
        ->assertSessionHasErrors(['name']);
});

test('pharmacist can update drug category', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = DrugCategory::factory()->create(['name' => 'Suplemen']);

    $this->actingAs($pharmacist)
        ->put(route('master-data.drug-categories.update', $category), [
            'name' => 'Suplemen Makanan',
            'description' => 'Penambah nafsu makan',
        ])
        ->assertSessionHas('success');

    $this->assertDatabaseHas('drug_categories', [
        'id' => $category->id,
        'name' => 'Suplemen Makanan',
        'description' => 'Penambah nafsu makan',
    ]);
});

test('pharmacist can delete empty drug category', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = DrugCategory::factory()->create();

    $this->actingAs($pharmacist)
        ->delete(route('master-data.drug-categories.destroy', $category))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('drug_categories', ['id' => $category->id]);
});

test('pharmacist cannot delete drug category that has drugs', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $category = DrugCategory::factory()->create();
    Drug::factory()->create(['drug_category_id' => $category->id]);

    $this->actingAs($pharmacist)
        ->delete(route('master-data.drug-categories.destroy', $category))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('drug_categories', ['id' => $category->id]);
});
