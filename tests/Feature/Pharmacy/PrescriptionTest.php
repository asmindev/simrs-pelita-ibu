<?php

use App\Enums\EncounterStatus;
use App\Enums\ProductType;
use App\Enums\RoleName;
use App\Models\Dispensing;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('doctor can create an electronic prescription with items', function () {
    $doctorUser = User::factory()->create();
    $doctorUser->assignRole(RoleName::Doctor->value);

    $doctor = Doctor::factory()->create();
    $patient = Patient::factory()->create();
    $unit = Unit::factory()->create();
    $encounter = Encounter::factory()->inConsultation()->create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'unit_id' => $unit->id,
    ]);
    $product1 = Product::factory()->create(['name' => 'Paracetamol 500mg']);
    $product2 = Product::factory()->create(['name' => 'Amoxicillin 500mg']);

    $response = $this->actingAs($doctorUser)->post(route('pharmacy.prescriptions.store'), [
        'encounter_id' => $encounter->id,
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'unit_id' => $unit->id,
        'notes' => 'Minum sesudah makan.',
        'items' => [
            [
                'product_id' => $product1->id,
                'dosage' => '500mg',
                'frequency' => '3x1',
                'route' => 'Oral',
                'duration_days' => 5,
                'quantity' => 15,
                'instructions' => 'Bila demam',
            ],
            [
                'product_id' => $product2->id,
                'dosage' => '500mg',
                'frequency' => '3x1',
                'route' => 'Oral',
                'duration_days' => 5,
                'quantity' => 15,
                'instructions' => 'Habiskan',
            ],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('prescriptions', [
        'encounter_id' => $encounter->id,
        'patient_id' => $patient->id,
        'status' => 'submitted',
    ]);
    $this->assertDatabaseCount('prescription_items', 2);
});

test('pharmacist can verify prescription', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $prescription = Prescription::factory()->create(['status' => 'submitted']);
    PrescriptionItem::factory()->count(2)->create(['prescription_id' => $prescription->id]);

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.prescriptions.verify', $prescription->id),
        ['verification_notes' => 'Dosis dan rute aman.']
    );

    $response->assertSessionHasNoErrors();
    $prescription->refresh();

    expect($prescription->status)->toBe('verified')
        ->and($prescription->pharmacist_id)->toBe($pharmacistUser->id)
        ->and($prescription->verification_notes)->toBe('Dosis dan rute aman.')
        ->and($prescription->verified_at)->not->toBeNull();
});

test('dispensing allocates batches using FEFO and updates stock balances', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $product = Product::factory()->create(['name' => 'Cetirizine 10mg']);

    // Batch 1: Expiring earlier (FEFO priority 1) - Stock 10
    $batchEarlier = ProductBatch::factory()->create([
        'product_id' => $product->id,
        'batch_number' => 'BATCH-EARLY',
        'expiry_date' => Carbon::today()->addDays(20),
        'initial_quantity' => 20,
        'current_quantity' => 10,
        'is_active' => true,
    ]);

    // Batch 2: Expiring later (FEFO priority 2) - Stock 20
    $batchLater = ProductBatch::factory()->create([
        'product_id' => $product->id,
        'batch_number' => 'BATCH-LATER',
        'expiry_date' => Carbon::today()->addDays(60),
        'initial_quantity' => 30,
        'current_quantity' => 20,
        'is_active' => true,
    ]);

    $prescription = Prescription::factory()->create(['status' => 'verified']);
    // Requesting 15 tablets: Should consume 10 from Batch 1, and 5 from Batch 2
    $item = PrescriptionItem::factory()->create([
        'prescription_id' => $prescription->id,
        'product_id' => $product->id,
        'quantity' => 15,
        'dispensed_quantity' => 0,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.prescriptions.dispense', $prescription->id),
        ['notes' => 'Diserahkan ke keluarga pasien.']
    );

    $response->assertSessionHasNoErrors();

    $batchEarlier->refresh();
    $batchLater->refresh();
    $prescription->refresh();
    $item->refresh();

    expect($batchEarlier->current_quantity)->toBe(0)
        ->and($batchLater->current_quantity)->toBe(15)
        ->and($item->dispensed_quantity)->toBe(15)
        ->and($item->status)->toBe('dispensed')
        ->and($prescription->status)->toBe('dispensed');

    $this->assertDatabaseHas('dispensings', [
        'prescription_id' => $prescription->id,
        'product_batch_id' => $batchEarlier->id,
        'quantity' => 10,
    ]);

    $this->assertDatabaseHas('dispensings', [
        'prescription_id' => $prescription->id,
        'product_batch_id' => $batchLater->id,
        'quantity' => 5,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'product_batch_id' => $batchEarlier->id,
        'type' => 'dispensing',
        'quantity' => -10,
        'balance_before' => 10,
        'balance_after' => 0,
    ]);
});

test('dispensing fails gracefully when available stock is insufficient', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $product = Product::factory()->create();
    ProductBatch::factory()->create([
        'product_id' => $product->id,
        'current_quantity' => 5,
        'is_active' => true,
        'expiry_date' => Carbon::today()->addDays(30),
    ]);

    $prescription = Prescription::factory()->create(['status' => 'verified']);
    PrescriptionItem::factory()->create([
        'prescription_id' => $prescription->id,
        'product_id' => $product->id,
        'quantity' => 20, // Requesting more than available 5
        'dispensed_quantity' => 0,
    ]);

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.prescriptions.dispense', $prescription->id)
    );

    $response->assertSessionHasErrors();
    $prescription->refresh();
    expect($prescription->status)->toBe('verified');
});

test('pharmacist can cancel prescription with reason', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $prescription = Prescription::factory()->create(['status' => 'submitted']);

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.prescriptions.cancel', $prescription->id),
        ['cancel_reason' => 'Pasien ada riwayat alergi obat penisilin.']
    );

    $response->assertSessionHasNoErrors();
    $prescription->refresh();

    expect($prescription->status)->toBe('cancelled')
        ->and($prescription->cancel_reason)->toBe('Pasien ada riwayat alergi obat penisilin.')
        ->and($prescription->cancelled_at)->not->toBeNull();
});

test('pharmacist can return dispensed medication and restore batch quantity', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $product = Product::factory()->create();
    $batch = ProductBatch::factory()->create([
        'product_id' => $product->id,
        'current_quantity' => 10,
    ]);

    $prescription = Prescription::factory()->create(['status' => 'dispensed']);
    $item = PrescriptionItem::factory()->create([
        'prescription_id' => $prescription->id,
        'product_id' => $product->id,
        'quantity' => 10,
        'dispensed_quantity' => 10,
        'status' => 'dispensed',
    ]);

    $dispensing = Dispensing::factory()->create([
        'prescription_id' => $prescription->id,
        'prescription_item_id' => $item->id,
        'product_batch_id' => $batch->id,
        'quantity' => 10,
    ]);

    $response = $this->actingAs($pharmacistUser)->post(
        route('pharmacy.prescriptions.return', $prescription->id),
        [
            'dispensing_id' => $dispensing->id,
            'quantity' => 5,
            'reason' => 'Pasien ganti obat oleh dokter spesialis.',
        ]
    );

    $response->assertSessionHasNoErrors();
    $batch->refresh();
    $item->refresh();

    expect($batch->current_quantity)->toBe(15) // Restored 5
        ->and($item->dispensed_quantity)->toBe(5);

    $this->assertDatabaseHas('stock_returns', [
        'prescription_id' => $prescription->id,
        'prescription_item_id' => $item->id,
        'product_batch_id' => $batch->id,
        'quantity' => 5,
        'return_reason' => 'Pasien ganti obat oleh dokter spesialis.',
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'product_batch_id' => $batch->id,
        'type' => 'return',
        'quantity' => 5,
        'balance_before' => 10,
        'balance_after' => 15,
    ]);
});

test('emr encounter show provides prescribable drugs and encounter prescriptions to doctor only', function () {
    $doctorUser = User::factory()->create();
    $doctorUser->assignRole(RoleName::Doctor->value);

    $nurseUser = User::factory()->create();
    $nurseUser->assignRole(RoleName::Nurse->value);

    $encounter = Encounter::factory()->inConsultation()->create();
    $drug = Product::factory()->create([
        'name' => 'Amoxicillin 500mg',
        'product_type' => ProductType::Drug,
        'is_active' => true,
    ]);
    Product::factory()->create([
        'name' => 'Spuit 3cc',
        'product_type' => ProductType::MedicalSupply,
        'is_active' => true,
    ]);
    Prescription::factory()->create([
        'encounter_id' => $encounter->id,
        'patient_id' => $encounter->patient_id,
    ]);

    $this->actingAs($doctorUser)
        ->get(route('medical-record.encounters.show', $encounter->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-record/encounter/show/index')
            ->has('encounter.prescriptions', 1)
            ->has('drugs', 1)
            ->where('drugs.0.id', $drug->id)
        );

    $this->actingAs($nurseUser)
        ->get(route('medical-record.encounters.show', $encounter->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-record/encounter/show/index')
            ->has('drugs', 0)
        );
});

test('pharmacy prescriptions index provides drugs and active encounters for creating e-prescriptions', function () {
    $pharmacistUser = User::factory()->create();
    $pharmacistUser->assignRole(RoleName::Pharmacist->value);

    $activeEncounter = Encounter::factory()->create([
        'status' => EncounterStatus::InConsultation,
        'arrived_at' => now(),
    ]);
    Encounter::factory()->create([
        'status' => EncounterStatus::InConsultation,
        'arrived_at' => now()->subDays(5),
    ]);
    Encounter::factory()->create([
        'status' => EncounterStatus::Arrived,
        'arrived_at' => now(),
    ]);
    Encounter::factory()->create([
        'status' => EncounterStatus::Finished,
        'arrived_at' => now(),
    ]);
    $drug = Product::factory()->create([
        'name' => 'Paracetamol 500mg',
        'product_type' => ProductType::Drug,
        'is_active' => true,
    ]);

    $this->actingAs($pharmacistUser)
        ->get(route('pharmacy.prescriptions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('pharmacy/prescription/list/index')
            ->has('drugs', 1)
            ->where('drugs.0.id', $drug->id)
            ->has('activeEncounters', 1)
            ->where('activeEncounters.0.id', $activeEncounter->id)
        );
});

test('prescription cannot be created for arrived, finished, or cancelled encounters', function () {
    $doctorUser = User::factory()->create();
    $doctorUser->assignRole(RoleName::Doctor->value);

    $arrivedEncounter = Encounter::factory()->create();
    $finishedEncounter = Encounter::factory()->finished()->create();
    $cancelledEncounter = Encounter::factory()->cancelled()->create();
    $drug = Product::factory()->create([
        'product_type' => ProductType::Drug,
        'is_active' => true,
    ]);

    foreach ([$arrivedEncounter, $finishedEncounter, $cancelledEncounter] as $encounter) {
        $this->actingAs($doctorUser)
            ->post(route('pharmacy.prescriptions.store'), [
                'encounter_id' => $encounter->id,
                'items' => [
                    [
                        'product_id' => $drug->id,
                        'dosage' => '500mg',
                        'frequency' => '3x1',
                        'quantity' => 10,
                    ],
                ],
            ])
            ->assertSessionHasErrors('encounter_id');
    }

    $this->actingAs($doctorUser)
        ->get(route('medical-record.encounters.show', $arrivedEncounter->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-record/encounter/show/index')
            ->has('drugs', 0)
        );
});

test('assigned prescriptions appear on registration visit show and patient emr history when permitted', function () {
    $doctorUser = User::factory()->create();
    $doctorUser->assignRole(RoleName::Doctor->value);

    $registrationUser = User::factory()->create();
    $registrationUser->assignRole(RoleName::Registration->value);

    $encounter = Encounter::factory()->inConsultation()->create();
    $prescription = Prescription::factory()->create([
        'encounter_id' => $encounter->id,
        'patient_id' => $encounter->patient_id,
    ]);
    PrescriptionItem::factory()->create([
        'prescription_id' => $prescription->id,
    ]);

    $this->actingAs($doctorUser)
        ->get(route('registration.visits.show', $encounter->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('registration/visit/show/index')
            ->has('encounter.prescriptions', 1)
            ->where('encounter.prescriptions.0.id', $prescription->id)
        );

    $this->actingAs($doctorUser)
        ->get(route('medical-record.patient.history', $encounter->patient_id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('medical-record/patient/history/index')
            ->has('encounters.data.0.prescriptions', 1)
            ->where('encounters.data.0.prescriptions.0.id', $prescription->id)
        );

    $this->actingAs($registrationUser)
        ->get(route('registration.visits.show', $encounter->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('registration/visit/show/index')
            ->missing('encounter.prescriptions')
        );
});
