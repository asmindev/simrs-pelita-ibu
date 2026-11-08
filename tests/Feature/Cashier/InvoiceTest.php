<?php

use App\Enums\RoleName;
use App\Models\Doctor;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Tariff;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('cashier can view invoices list', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    Invoice::factory()->count(3)->create();

    $response = $this->actingAs($cashierUser)->get(route('cashier.invoices.index'));

    $response->assertOk();
});

test('generating invoice from encounter calculates administrative, consultation and dispensed drugs', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    // Setup tariffs
    Tariff::factory()->create([
        'category' => 'administration',
        'name' => 'Biaya Pendaftaran',
        'price' => 20000,
        'is_active' => true,
    ]);
    Tariff::factory()->create([
        'category' => 'consultation',
        'name' => 'Konsultasi Dokter Umum',
        'price' => 50000,
        'is_active' => true,
    ]);

    $unit = Unit::factory()->create(['name' => 'Poli Umum']);
    $doctor = Doctor::factory()->create();
    $patient = Patient::factory()->create();
    $encounter = Encounter::factory()->create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'unit_id' => $unit->id,
    ]);

    // Setup dispensed prescription
    $drug = Drug::factory()->create(['name' => 'Paracetamol', 'price' => 5000]);
    $batch = DrugBatch::factory()->create(['drug_id' => $drug->id, 'current_quantity' => 100]);

    $prescription = Prescription::factory()->create([
        'encounter_id' => $encounter->id,
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'unit_id' => $unit->id,
        'status' => 'dispensed',
    ]);
    PrescriptionItem::factory()->create([
        'prescription_id' => $prescription->id,
        'drug_id' => $drug->id,
        'quantity' => 10,
        'dispensed_quantity' => 10,
        'status' => 'dispensed',
    ]);

    // Generate invoice via endpoint
    $response = $this->actingAs($cashierUser)->post(route('cashier.invoices.store'), [
        'encounter_id' => $encounter->id,
    ]);

    $response->assertSessionHasNoErrors();

    // Total expected: 20,000 (admin) + 50,000 (consultation) + 50,000 (10 * 5,000 drug) = 120,000
    $this->assertDatabaseHas('invoices', [
        'encounter_id' => $encounter->id,
        'patient_id' => $patient->id,
        'status' => 'draft',
        'total_amount' => 120000,
    ]);

    $invoice = Invoice::where('encounter_id', $encounter->id)->firstOrFail();
    expect($invoice->items)->toHaveCount(3);
});

test('cashier can view invoice detail', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    $invoice = Invoice::factory()->create();

    $response = $this->actingAs($cashierUser)->get(route('cashier.invoices.show', $invoice->id));

    $response->assertOk();
});

test('cashier can void unpaid invoice with reason', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    $invoice = Invoice::factory()->create(['status' => 'draft', 'paid_amount' => 0]);

    $response = $this->actingAs($cashierUser)->post(
        route('cashier.invoices.void', $invoice->id),
        ['void_reason' => 'Pasien batal berobat karena kondisi darurat dirujuk.']
    );

    $response->assertSessionHasNoErrors();
    $invoice->refresh();

    expect($invoice->status)->toBe('voided')
        ->and($invoice->void_reason)->toBe('Pasien batal berobat karena kondisi darurat dirujuk.')
        ->and($invoice->voided_at)->not->toBeNull()
        ->and($invoice->voided_by)->toBe($cashierUser->id);
});
