<?php

namespace App\Services;

use App\Enums\TariffCategory;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Tariff;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillingCalculationService
{
    /**
     * Generate or sync an invoice from an encounter's services and dispensed drugs.
     */
    public function createFromEncounter(Encounter $encounter, ?User $creator = null): Invoice
    {
        return DB::transaction(function () use ($encounter) {
            // Check if active invoice already exists for this encounter
            $existing = Invoice::where('encounter_id', $encounter->id)
                ->where('status', '!=', 'voided')
                ->first();

            if ($existing) {
                return $existing;
            }

            $datePrefix = 'INV-'.now()->format('Ymd');
            $countToday = Invoice::where('invoice_number', 'like', "{$datePrefix}%")->count() + 1;
            $invoiceNumber = sprintf('%s-%04d', $datePrefix, $countToday);

            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'guarantor_id' => $encounter->guarantor_id,
                'status' => 'draft',
                'subtotal' => 0,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => 0,
                'paid_amount' => 0,
                'notes' => 'Tagihan pelayanan kunjungan '.$encounter->encounter_number,
            ]);

            $subtotal = 0;

            // 1. Biaya Administrasi / Pendaftaran (jika ada tarif registrasi default)
            $regTariff = Tariff::where('category', TariffCategory::Administration->value)->where('is_active', true)->first();
            if ($regTariff) {
                $itemSubtotal = (float) $regTariff->price;
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'registration',
                    'reference_id' => $regTariff->id,
                    'name' => $regTariff->name,
                    'unit_price' => $regTariff->price,
                    'quantity' => 1,
                    'subtotal' => $itemSubtotal,
                    'discount_amount' => 0,
                    'total' => $itemSubtotal,
                ]);
                $subtotal += $itemSubtotal;
            }

            // 2. Biaya Konsultasi Dokter / Poliklinik
            $consultationTariff = Tariff::where('category', TariffCategory::Consultation->value)->where('is_active', true)->first();
            if ($consultationTariff) {
                $itemSubtotal = (float) $consultationTariff->price;
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'consultation',
                    'reference_id' => $consultationTariff->id,
                    'name' => 'Konsultasi '.$encounter->unit->name,
                    'unit_price' => $consultationTariff->price,
                    'quantity' => 1,
                    'subtotal' => $itemSubtotal,
                    'discount_amount' => 0,
                    'total' => $itemSubtotal,
                ]);
                $subtotal += $itemSubtotal;
            }

            // 3. Obat-obatan yang telah di-dispensing oleh Farmasi
            $dispensedPrescriptions = $encounter->prescriptions()
                ->where('status', 'dispensed')
                ->with(['items.drug'])
                ->get();

            foreach ($dispensedPrescriptions as $prescription) {
                foreach ($prescription->items as $pItem) {
                    if ($pItem->dispensed_quantity > 0 && $pItem->drug) {
                        $price = (float) ($pItem->drug->price ?? 0);
                        $itemSubtotal = $price * $pItem->dispensed_quantity;

                        InvoiceItem::create([
                            'invoice_id' => $invoice->id,
                            'item_type' => 'drug',
                            'reference_id' => $pItem->drug_id,
                            'name' => "{$pItem->drug->name} ({$pItem->dosage})",
                            'unit_price' => $price,
                            'quantity' => $pItem->dispensed_quantity,
                            'subtotal' => $itemSubtotal,
                            'discount_amount' => 0,
                            'total' => $itemSubtotal,
                            'notes' => "Resep {$prescription->prescription_number}",
                        ]);

                        $subtotal += $itemSubtotal;
                    }
                }
            }

            $invoice->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            return $invoice;
        });
    }

    /**
     * Finalize an invoice so that line items become immutable and payments can be received.
     */
    public function finalize(Invoice $invoice, User $user): Invoice
    {
        if ($invoice->status === 'voided') {
            throw ValidationException::withMessages([
                'invoice' => 'Invoice yang telah dibatalkan (void) tidak dapat difinalisasi.',
            ]);
        }

        if ($invoice->status !== 'draft') {
            return $invoice;
        }

        $invoice->update([
            'status' => 'finalized',
            'finalized_at' => now(),
            'finalized_by' => $user->id,
        ]);

        return $invoice;
    }

    /**
     * Void an invoice with required explanation and audit trail.
     */
    public function voidInvoice(Invoice $invoice, string $reason, User $user): Invoice
    {
        if ($invoice->status === 'voided') {
            return $invoice;
        }

        if ($invoice->paid_amount > 0) {
            throw ValidationException::withMessages([
                'invoice' => 'Invoice dengan pembayaran tercatat harus di-refund terlebih dahulu sebelum di-void.',
            ]);
        }

        $invoice->update([
            'status' => 'voided',
            'voided_at' => now(),
            'voided_by' => $user->id,
            'void_reason' => $reason,
        ]);

        return $invoice;
    }
}
