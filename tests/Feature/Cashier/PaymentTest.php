<?php

use App\Enums\RoleName;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('cashier can record full cash payment with change calculation', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    $invoice = Invoice::factory()->create([
        'total_amount' => 150000,
        'paid_amount' => 0,
        'status' => 'draft',
    ]);

    // Pay with 200,000 cash for 150,000 bill
    $response = $this->actingAs($cashierUser)->post(
        route('cashier.invoices.payments.store', $invoice->id),
        [
            'method' => 'cash',
            'amount' => 200000,
            'notes' => 'Pembayaran tunai di loket 1.',
        ]
    );

    $response->assertSessionHasNoErrors();
    $invoice->refresh();

    expect($invoice->status)->toBe('paid')
        ->and((float) $invoice->paid_amount)->toBe(150000.0);

    $this->assertDatabaseHas('payments', [
        'invoice_id' => $invoice->id,
        'method' => 'cash',
        'amount' => 200000,
        'change_amount' => 50000,
        'received_by' => $cashierUser->id,
    ]);
});

test('cashier can record non-cash QRIS payment', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    $invoice = Invoice::factory()->create([
        'total_amount' => 75000,
        'paid_amount' => 0,
        'status' => 'draft',
    ]);

    $response = $this->actingAs($cashierUser)->post(
        route('cashier.invoices.payments.store', $invoice->id),
        [
            'method' => 'qris',
            'amount' => 75000,
            'reference_number' => 'QRIS-NMID-991283',
        ]
    );

    $response->assertSessionHasNoErrors();
    $invoice->refresh();

    expect($invoice->status)->toBe('paid')
        ->and((float) $invoice->paid_amount)->toBe(75000.0);

    $this->assertDatabaseHas('payments', [
        'invoice_id' => $invoice->id,
        'method' => 'qris',
        'amount' => 75000,
        'reference_number' => 'QRIS-NMID-991283',
    ]);
});

test('payment cannot be made on voided invoice', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    $invoice = Invoice::factory()->voided()->create();

    $response = $this->actingAs($cashierUser)->post(
        route('cashier.invoices.payments.store', $invoice->id),
        [
            'method' => 'cash',
            'amount' => 50000,
        ]
    );

    $response->assertForbidden();
});

test('cashier can process refund on paid invoice', function () {
    $cashierUser = User::factory()->create();
    $cashierUser->assignRole(RoleName::Cashier->value);

    $invoice = Invoice::factory()->create([
        'total_amount' => 100000,
        'paid_amount' => 100000,
        'status' => 'paid',
    ]);
    $payment = Payment::factory()->create([
        'invoice_id' => $invoice->id,
        'amount' => 100000,
    ]);

    $response = $this->actingAs($cashierUser)->post(
        route('cashier.invoices.refunds.store', $invoice->id),
        [
            'amount' => 30000,
            'reason' => 'Pengembalian kelebihan bayar tindakan.',
            'payment_id' => $payment->id,
        ]
    );

    $response->assertSessionHasNoErrors();
    $invoice->refresh();

    expect((float) $invoice->paid_amount)->toBe(70000.0)
        ->and($invoice->status)->toBe('partially_paid');

    $this->assertDatabaseHas('refunds', [
        'invoice_id' => $invoice->id,
        'amount' => 30000,
        'reason' => 'Pengembalian kelebihan bayar tindakan.',
        'approved_by' => $cashierUser->id,
    ]);
});
