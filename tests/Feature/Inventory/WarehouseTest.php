<?php

use App\Enums\RoleName;
use App\Enums\StockLocationUsage;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockLocation;
use App\Models\StockQuant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\StockLocationSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class, StockLocationSeeder::class]);
});

test('guest and unauthorized users cannot access warehouses', function () {
    $this->get(route('inventory.warehouses.index'))->assertRedirect(route('login'));

    $user = User::factory()->create();
    $this->actingAs($user)->get(route('inventory.warehouses.index'))->assertForbidden();

    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);
    $this->actingAs($doctor)->get(route('inventory.warehouses.index'))->assertForbidden();
});

test('pharmacist can view warehouses list and filter by usage or search', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $this->actingAs($pharmacist)
        ->get(route('inventory.warehouses.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('inventory/warehouse/list/index')
            ->has('warehouses.data', 7)
            ->has('usageOptions', 4)
            ->has('statistics.total_locations')
            ->has('statistics.internal_count')
        );

    $this->actingAs($pharmacist)
        ->get(route('inventory.warehouses.index', ['usage' => StockLocationUsage::Internal->value]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('warehouses.data', 4)
        );

    $this->actingAs($pharmacist)
        ->get(route('inventory.warehouses.index', ['search' => 'OPD/STOCK']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('warehouses.data', 1)
            ->where('warehouses.data.0.code', StockLocation::CODE_OPD_DEPO)
        );
});

test('pharmacist can view warehouse detail with stored quants', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $warehouse = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    $product = Product::factory()->create();
    $batch = ProductBatch::factory()->create(['product_id' => $product->id, 'current_quantity' => 30]);

    StockQuant::create([
        'stock_location_id' => $warehouse->id,
        'product_id' => $product->id,
        'product_batch_id' => $batch->id,
        'quantity' => 30,
    ]);

    $this->actingAs($pharmacist)
        ->get(route('inventory.warehouses.show', $warehouse))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('inventory/warehouse/show/index')
            ->where('warehouse.id', $warehouse->id)
            ->has('quants', 1)
            ->where('statistics.total_on_hand', 30)
            ->where('statistics.sku_count', 1)
        );
});

test('pharmacist can create warehouse and promote new default warehouse', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $previousDefault = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    expect($previousDefault->is_default_warehouse)->toBeTrue();

    $this->actingAs($pharmacist)
        ->post(route('inventory.warehouses.store'), [
            'code' => 'ok/stock',
            'name' => 'Depo Farmasi Kamar Operasi',
            'usage' => StockLocationUsage::Internal->value,
            'description' => 'Stok khusus OK',
            'is_default_warehouse' => true,
            'is_active' => true,
        ])
        ->assertRedirect(route('inventory.warehouses.index'))
        ->assertSessionHas('success');

    $newWarehouse = StockLocation::where('code', 'OK/STOCK')->firstOrFail();
    $previousDefault->refresh();

    expect($newWarehouse->is_default_warehouse)->toBeTrue()
        ->and($previousDefault->is_default_warehouse)->toBeFalse();
});

test('non-internal location cannot be set as default warehouse', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $this->actingAs($pharmacist)
        ->post(route('inventory.warehouses.store'), [
            'code' => 'EXT/SUP2',
            'name' => 'Supplier Lain',
            'usage' => StockLocationUsage::Supplier->value,
            'is_default_warehouse' => true,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('is_default_warehouse');
});

test('pharmacist can update and safely deactivate empty non-default warehouse', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $warehouse = StockLocation::factory()->create([
        'code' => 'ICU/STOCK',
        'name' => 'Depo ICU',
        'usage' => StockLocationUsage::Internal->value,
        'is_default_warehouse' => false,
        'is_active' => true,
    ]);

    $this->actingAs($pharmacist)
        ->put(route('inventory.warehouses.update', $warehouse), [
            'code' => 'ICU/STOCK',
            'name' => 'Depo ICU & ICCU',
            'usage' => StockLocationUsage::Internal->value,
            'description' => 'Diperbarui',
            'is_default_warehouse' => false,
            'is_active' => true,
        ])
        ->assertSessionHas('success');

    $this->assertDatabaseHas('stock_locations', [
        'id' => $warehouse->id,
        'name' => 'Depo ICU & ICCU',
    ]);

    $this->actingAs($pharmacist)
        ->delete(route('inventory.warehouses.destroy', $warehouse))
        ->assertSessionHas('success');

    $warehouse->refresh();
    expect($warehouse->is_active)->toBeFalse();
});

test('cannot deactivate default warehouse or warehouse with active stock', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $defaultWh = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    $this->actingAs($pharmacist)
        ->delete(route('inventory.warehouses.destroy', $defaultWh))
        ->assertSessionHas('error');

    $opdDepo = StockLocation::where('code', StockLocation::CODE_OPD_DEPO)->firstOrFail();
    $product = Product::factory()->create();
    $batch = ProductBatch::factory()->create(['product_id' => $product->id, 'current_quantity' => 5]);
    StockQuant::create([
        'stock_location_id' => $opdDepo->id,
        'product_id' => $product->id,
        'product_batch_id' => $batch->id,
        'quantity' => 5,
    ]);

    $this->actingAs($pharmacist)
        ->delete(route('inventory.warehouses.destroy', $opdDepo))
        ->assertSessionHas('error');

    $opdDepo->refresh();
    expect($opdDepo->is_active)->toBeTrue();
});
