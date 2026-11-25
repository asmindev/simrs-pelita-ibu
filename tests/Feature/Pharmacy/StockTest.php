<?php

use App\Enums\RoleName;
use App\Models\Dispensing;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\StockLocation;
use App\Models\StockValuationLayer;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\StockLocationSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class, StockLocationSeeder::class]);
});

test('pharmacist can add a new drug batch with initial stock movement, quant, and valuation layer', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();
    $whStock = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    $vendors = StockLocation::where('code', StockLocation::CODE_VENDORS)->firstOrFail();

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.stock.batches.store'),
        [
            'drug_id' => $drug->id,
            'batch_number' => 'BATCH-TEST-99',
            'expiry_date' => Carbon::today()->addMonths(6)->toDateString(),
            'initial_quantity' => 100,
            'buy_price' => 2500,
            'origin' => 'PO-2026-001',
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
        'source_location_id' => $vendors->id,
        'destination_location_id' => $whStock->id,
        'type' => 'in',
        'quantity' => 100,
        'balance_before' => 0,
        'balance_after' => 100,
        'unit_cost' => 2500,
        'total_value' => 250000,
        'origin' => 'PO-2026-001',
        'state' => 'done',
    ]);

    $this->assertDatabaseHas('stock_quants', [
        'stock_location_id' => $whStock->id,
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'quantity' => 100,
    ]);

    $this->assertDatabaseHas('stock_valuation_layers', [
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'stock_location_id' => $whStock->id,
        'quantity' => 100,
        'remaining_qty' => 100,
        'unit_cost' => 2500,
        'value' => 250000,
        'remaining_value' => 250000,
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
        'buy_price' => 1000,
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
        'total_value' => -5000,
        'reason' => 'Hasil stock opname fisik: 5 botol rusak saat penyimpanan.',
    ]);

    $this->assertDatabaseHas('stock_valuation_layers', [
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'quantity' => -5,
        'value' => -5000,
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

test('pharmacist can transfer stock between internal locations without altering total valuation', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();
    $whStock = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    $opdDepo = StockLocation::where('code', StockLocation::CODE_OPD_DEPO)->firstOrFail();

    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.batches.store'), [
        'drug_id' => $drug->id,
        'batch_number' => 'BATCH-TRANS-01',
        'expiry_date' => Carbon::today()->addMonths(8)->toDateString(),
        'initial_quantity' => 80,
        'buy_price' => 3000,
    ])->assertSessionHasNoErrors();

    $batch = DrugBatch::where('batch_number', 'BATCH-TRANS-01')->firstOrFail();

    $response = $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.moves.store'), [
        'type' => 'transfer',
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'source_location_id' => $whStock->id,
        'destination_location_id' => $opdDepo->id,
        'quantity' => 30,
        'origin' => 'DIST-OPD-01',
        'reason' => 'Distribusi stok harian ke Depo Rawat Jalan.',
    ]);

    $response->assertSessionHasNoErrors();

    $batch->refresh();
    expect($batch->current_quantity)->toBe(80);

    $this->assertDatabaseHas('stock_quants', [
        'stock_location_id' => $whStock->id,
        'drug_batch_id' => $batch->id,
        'quantity' => 50,
    ]);

    $this->assertDatabaseHas('stock_quants', [
        'stock_location_id' => $opdDepo->id,
        'drug_batch_id' => $batch->id,
        'quantity' => 30,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'source_location_id' => $whStock->id,
        'destination_location_id' => $opdDepo->id,
        'type' => 'transfer',
        'quantity' => 30,
        'balance_before' => 80,
        'balance_after' => 50,
        'origin' => 'DIST-OPD-01',
    ]);

    // Total valuation remains 80 * 3000 = 240000 after internal transfer
    $totalValuation = (int) StockValuationLayer::where('drug_id', $drug->id)->sum('value');
    expect($totalValuation)->toBe(240000);
});

test('outbound stock move allocates FEFO across batches and consumes valuation layers', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();
    $whStock = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    $customers = StockLocation::where('code', StockLocation::CODE_CUSTOMERS)->firstOrFail();

    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.batches.store'), [
        'drug_id' => $drug->id,
        'batch_number' => 'FEFO-EARLY',
        'expiry_date' => Carbon::today()->addDays(20)->toDateString(),
        'initial_quantity' => 10,
        'buy_price' => 1000,
    ])->assertSessionHasNoErrors();

    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.batches.store'), [
        'drug_id' => $drug->id,
        'batch_number' => 'FEFO-LATE',
        'expiry_date' => Carbon::today()->addDays(90)->toDateString(),
        'initial_quantity' => 20,
        'buy_price' => 1500,
    ])->assertSessionHasNoErrors();

    // Request 15 outbound without batch specified -> FEFO takes 10 from FEFO-EARLY + 5 from FEFO-LATE
    $response = $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.moves.store'), [
        'type' => 'out',
        'drug_id' => $drug->id,
        'drug_batch_id' => null,
        'source_location_id' => $whStock->id,
        'destination_location_id' => $customers->id,
        'quantity' => 15,
        'origin' => 'UNIT-IGD-09',
        'reason' => 'Pemakaian paket emergency IGD.',
    ]);

    $response->assertSessionHasNoErrors();

    $earlyBatch = DrugBatch::where('batch_number', 'FEFO-EARLY')->firstOrFail();
    $lateBatch = DrugBatch::where('batch_number', 'FEFO-LATE')->firstOrFail();

    expect($earlyBatch->current_quantity)->toBe(0)
        ->and($lateBatch->current_quantity)->toBe(15);

    // Remaining SVL on early batch = 0, late batch = 15 * 1500 = 22500
    $earlyRemaining = StockValuationLayer::where('drug_batch_id', $earlyBatch->id)
        ->where('quantity', '>', 0)
        ->firstOrFail();
    $lateRemaining = StockValuationLayer::where('drug_batch_id', $lateBatch->id)
        ->where('quantity', '>', 0)
        ->firstOrFail();

    expect($earlyRemaining->remaining_qty)->toBe(0)
        ->and($earlyRemaining->remaining_value)->toBe(0)
        ->and($lateRemaining->remaining_qty)->toBe(15)
        ->and($lateRemaining->remaining_value)->toBe(22500);

    $totalValuation = (int) StockValuationLayer::where('drug_id', $drug->id)->sum('value');
    expect($totalValuation)->toBe(22500);
});

test('inbound stock move adds stock to existing batch and creates new valuation layer', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();
    $whStock = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    $vendors = StockLocation::where('code', StockLocation::CODE_VENDORS)->firstOrFail();

    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.batches.store'), [
        'drug_id' => $drug->id,
        'batch_number' => 'BATCH-ADD-01',
        'expiry_date' => Carbon::today()->addMonths(6)->toDateString(),
        'initial_quantity' => 20,
        'buy_price' => 2000,
    ])->assertSessionHasNoErrors();

    $batch = DrugBatch::where('batch_number', 'BATCH-ADD-01')->firstOrFail();

    $response = $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.moves.store'), [
        'type' => 'in',
        'drug_id' => $drug->id,
        'drug_batch_id' => $batch->id,
        'source_location_id' => $vendors->id,
        'destination_location_id' => $whStock->id,
        'quantity' => 30,
        'unit_cost' => 2200,
        'origin' => 'PO-2026-099',
        'reason' => 'Tambahan penerimaan batch yang sama.',
    ]);

    $response->assertSessionHasNoErrors();

    $batch->refresh();
    expect($batch->current_quantity)->toBe(50);

    $totalValuation = (int) StockValuationLayer::where('drug_id', $drug->id)->sum('value');
    expect($totalValuation)->toBe((20 * 2000) + (30 * 2200));
});

test('dispensing and return update quants and valuation layers accurately', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();

    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.batches.store'), [
        'drug_id' => $drug->id,
        'batch_number' => 'BATCH-DISP-SVL',
        'expiry_date' => Carbon::today()->addMonths(6)->toDateString(),
        'initial_quantity' => 40,
        'buy_price' => 5000,
    ])->assertSessionHasNoErrors();

    $batch = DrugBatch::where('batch_number', 'BATCH-DISP-SVL')->firstOrFail();

    $prescription = Prescription::factory()->create(['status' => 'verified']);
    PrescriptionItem::factory()->create([
        'prescription_id' => $prescription->id,
        'drug_id' => $drug->id,
        'quantity' => 10,
        'dispensed_quantity' => 0,
        'status' => 'pending',
    ]);

    $this->actingAs($pharmacistUser)
        ->post(route('pharmacy.prescriptions.dispense', $prescription->id))
        ->assertSessionHasNoErrors();

    expect((int) StockValuationLayer::where('drug_id', $drug->id)->sum('value'))->toBe(150000);

    $dispensing = Dispensing::where('prescription_id', $prescription->id)->firstOrFail();

    $this->actingAs($pharmacistUser)
        ->post(route('pharmacy.prescriptions.return', $prescription->id), [
            'dispensing_id' => $dispensing->id,
            'quantity' => 4,
            'reason' => 'Pasien hanya menebus sebagian resep.',
        ])
        ->assertSessionHasNoErrors();

    $batch->refresh();
    expect($batch->current_quantity)->toBe(34)
        ->and((int) StockValuationLayer::where('drug_id', $drug->id)->sum('value'))->toBe(170000);
});

test('stock move rejects insufficient source stock, same-location transfer, and unauthorized users', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $registrationUser = User::factory()->create();
    $registrationUser->assignRole(RoleName::Registration->value);

    $drug = Drug::factory()->create();
    $whStock = StockLocation::where('code', StockLocation::CODE_DEFAULT_WAREHOUSE)->firstOrFail();
    $opdDepo = StockLocation::where('code', StockLocation::CODE_OPD_DEPO)->firstOrFail();

    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.batches.store'), [
        'drug_id' => $drug->id,
        'batch_number' => 'BATCH-GUARD-01',
        'expiry_date' => Carbon::today()->addMonths(6)->toDateString(),
        'initial_quantity' => 10,
        'buy_price' => 1000,
    ])->assertSessionHasNoErrors();

    // Insufficient stock in source
    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.moves.store'), [
        'type' => 'transfer',
        'drug_id' => $drug->id,
        'source_location_id' => $whStock->id,
        'destination_location_id' => $opdDepo->id,
        'quantity' => 25,
        'reason' => 'Melebihi stok tersedia.',
    ])->assertSessionHasErrors('quantity');

    // Same source and destination
    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.moves.store'), [
        'type' => 'transfer',
        'drug_id' => $drug->id,
        'source_location_id' => $whStock->id,
        'destination_location_id' => $whStock->id,
        'quantity' => 5,
        'reason' => 'Lokasi sama.',
    ])->assertSessionHasErrors('destination_location_id');

    // Unauthorized role
    $this->actingAs($registrationUser)->post(route('pharmacy.stock.moves.store'), [
        'type' => 'transfer',
        'drug_id' => $drug->id,
        'source_location_id' => $whStock->id,
        'destination_location_id' => $opdDepo->id,
        'quantity' => 5,
        'reason' => 'Tidak berwenang.',
    ])->assertForbidden();
});

test('pharmacy stock index returns paginated movements, valuation layers, quants, and locations', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $drug = Drug::factory()->create();

    $this->actingAs($pharmacistUser)->post(route('pharmacy.stock.batches.store'), [
        'drug_id' => $drug->id,
        'batch_number' => 'BATCH-UI-01',
        'expiry_date' => Carbon::today()->addMonths(6)->toDateString(),
        'initial_quantity' => 25,
        'buy_price' => 4000,
    ])->assertSessionHasNoErrors();

    $response = $this->actingAs($pharmacistUser)->get(route('pharmacy.stock.index', ['tab' => 'layers']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('pharmacy/stock/index')
            ->where('activeTab', 'layers')
            ->has('movements.data', 1)
            ->has('valuationLayers.data', 1)
            ->has('quants.data', 1)
            ->has('locations', 7)
            ->where('statistics.total_valuation', 100000)
        );
});
