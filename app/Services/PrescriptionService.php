<?php

namespace App\Services;

use App\Models\Encounter;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PrescriptionService
{
    public function __construct(
        protected PharmacyStockService $stockService
    ) {}

    /**
     * Create a new prescription from consultation/EMR.
     *
     * @param  array{
     *     encounter_id: int,
     *     notes?: string|null,
     *     items: array<int, array{
     *         drug_id: int,
     *         dosage: string,
     *         frequency: string,
     *         route?: string|null,
     *         duration_days?: int|null,
     *         quantity: int,
     *         instructions?: string|null
     *     }>
     * }  $data
     *
     * @throws ValidationException
     */
    public function createPrescription(array $data, User $creator): Prescription
    {
        return DB::transaction(function () use ($data) {
            /** @var Encounter $encounter */
            $encounter = Encounter::query()->with(['patient', 'doctor', 'unit'])->findOrFail($data['encounter_id']);

            $prescriptionNumber = $this->generatePrescriptionNumber();

            $prescription = Prescription::create([
                'prescription_number' => $prescriptionNumber,
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'doctor_id' => $encounter->doctor_id ?? 1,
                'unit_id' => $encounter->unit_id,
                'status' => 'submitted',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $itemData) {
                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'drug_id' => $itemData['drug_id'],
                    'dosage' => $itemData['dosage'],
                    'frequency' => $itemData['frequency'],
                    'route' => $itemData['route'] ?? 'Oral',
                    'duration_days' => $itemData['duration_days'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'dispensed_quantity' => 0,
                    'instructions' => $itemData['instructions'] ?? null,
                    'status' => 'pending',
                ]);
            }

            return $prescription->load(['items.drug', 'patient', 'doctor', 'unit']);
        });
    }

    /**
     * Verify a prescription by pharmacist.
     *
     * @throws ValidationException
     */
    public function verifyPrescription(Prescription $prescription, User $pharmacist, ?string $notes = null): Prescription
    {
        if ($prescription->status === 'cancelled') {
            throw ValidationException::withMessages([
                'status' => 'Resep yang telah dibatalkan tidak dapat diverifikasi.',
            ]);
        }

        if ($prescription->status === 'dispensed') {
            throw ValidationException::withMessages([
                'status' => 'Resep sudah selesai diserahkan (dispensed).',
            ]);
        }

        $prescription->update([
            'status' => 'verified',
            'pharmacist_id' => $pharmacist->id,
            'verified_at' => now(),
            'verification_notes' => $notes ?? 'Resep telah ditelaah apoteker.',
        ]);

        return $prescription->fresh(['items.drug', 'patient', 'doctor', 'pharmacist']);
    }

    /**
     * Dispense all pending items of a prescription using FEFO stock allocation.
     *
     * @throws ValidationException
     */
    public function dispensePrescription(Prescription $prescription, User $pharmacist, ?string $dispensingNotes = null): Prescription
    {
        if ($prescription->status === 'cancelled') {
            throw ValidationException::withMessages([
                'status' => 'Resep yang dibatalkan tidak dapat diproses dispensing.',
            ]);
        }

        if ($prescription->status === 'dispensed') {
            throw ValidationException::withMessages([
                'status' => 'Resep ini sudah selesai di-dispense sebelumnya.',
            ]);
        }

        return DB::transaction(function () use ($prescription, $pharmacist, $dispensingNotes) {
            $prescription->loadMissing('items.drug');

            foreach ($prescription->items as $item) {
                if ($item->status !== 'dispensed') {
                    $this->stockService->dispenseItem($item, $pharmacist, $dispensingNotes);
                }
            }

            $prescription->update([
                'status' => 'dispensed',
                'pharmacist_id' => $pharmacist->id,
                'dispensed_at' => now(),
            ]);

            // Sinkronkan draft invoice kunjungan agar otomatis memuat obat yang diserahkan
            $encounter = $prescription->encounter;
            if ($encounter) {
                $draftInvoice = $encounter->invoices()->where('status', 'draft')->first();
                if ($draftInvoice) {
                    app(BillingCalculationService::class)->syncInvoiceItems($draftInvoice, $encounter);
                }
            }

            return $prescription->fresh(['items.drug', 'items.dispensings.drugBatch', 'patient', 'doctor', 'pharmacist']);
        });
    }

    /**
     * Cancel prescription (cannot cancel if already dispensed).
     *
     * @throws ValidationException
     */
    public function cancelPrescription(Prescription $prescription, string $reason, User $user): Prescription
    {
        if ($prescription->status === 'dispensed') {
            throw ValidationException::withMessages([
                'status' => 'Resep yang telah diserahkan (dispensed) tidak dapat dibatalkan langsung. Gunakan alur retur obat.',
            ]);
        }

        if (trim($reason) === '') {
            throw ValidationException::withMessages([
                'cancel_reason' => 'Alasan pembatalan resep wajib disertakan.',
            ]);
        }

        $prescription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $reason,
        ]);

        $prescription->items()->update(['status' => 'cancelled']);

        return $prescription->fresh();
    }

    private function generatePrescriptionNumber(): string
    {
        $today = Carbon::today()->format('Ymd');
        $count = Prescription::query()
            ->whereDate('created_at', Carbon::today())
            ->count() + 1;

        return sprintf('RX-%s-%04d', $today, $count);
    }
}
