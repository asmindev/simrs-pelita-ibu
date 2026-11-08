<?php

use App\Enums\RoleName;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('pharmacist can add a new drug batch with initial stock movement', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.stock.batches.store'),
        [
            'drug_id' => $drug->id,
            'batch_number' => 'BATCH-TEST-99',
            'expiry_date' => Carbon::today()->addMonths(6)->toDateString(),
            'initial_quantity' => 100,
            'buy_price' => 2500,
        ]
    );

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('drug_batches', [
        'drug_id' => $drug->id,
        'batch_number' => 'BATCH-TEST-99',
        'initial_quantity' => 100,
        'current_quantity' => 100,
        'buy_price' => 2500,
        'is_active' => true,
    ]);

    $batch = DrugBatch::where('batch_number', 'BATCH-TEST-99')->firstOrFail();

    $this->assertDatabaseHas('stock_movements', [
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'type' => 'in',
        'quantity' => 100,
        'balance_before' => 0,
        'balance_after' => 100,
    ]);
});

test('pharmacist can adjust stock with a mandatory reason', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();
    $batch = DrugBatch::factory()->create([
        'drug_id' => $drug->id,
        'batch_number' => 'BATCH-ADJUST',
        'initial_quantity' => 50,
        'current_quantity' => 50,
    ]);

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.stock.batches.adjust', $batch->id),
        [
            'new_quantity' => 45,
            'reason' => 'Hasil stock opname fisik: 5 botol rusak saat penyimpanan.',
        ]
    );

    $response->assertSessionHasNoErrors();
    $batch->refresh();

    expect($batch->current_quantity)->toBe(45);

    $this->assertDatabaseHas('stock_movements', [
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'type' => 'adjustment',
        'quantity' => -5,
        'balance_before' => 50,
        'balance_after' => 45,
        'reason' => 'Hasil stock opname fisik: 5 botol rusak saat penyimpanan.',
    ]);
});

test('stock adjustment validates and rejects negative quantity', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $batch = DrugBatch::factory()->create(['current_quantity' => 10]);

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.stock.batches.adjust', $batch->id),
        [
            'new_quantity' => -5,
            'reason' => 'Tes nilai negatif.',
        ]
    );

    $response->assertSessionHasErrors('new_quantity');
    $batch->refresh();
    expect($batch->current_quantity)->toBe(10);
});
