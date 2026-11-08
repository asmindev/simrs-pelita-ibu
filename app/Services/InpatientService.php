<?php

namespace App\Services;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\BedAssignment;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\InpatientDailyNote;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InpatientService
{
    /**
     * Admit a patient and assign an available bed with concurrency collision guard.
     *
     * @param  array{
     *     admitted_at?: string|null,
     *     initial_diagnosis?: string|null
     * }  $data
     */
    public function admitPatient(Encounter $encounter, Bed $bed, array $data, User $user): Admission
    {
        return DB::transaction(function () use ($encounter, $bed, $data, $user) {
            /** @var Bed $lockedBed */
            $lockedBed = Bed::where('id', $bed->id)->lockForUpdate()->firstOrFail();

            if ($lockedBed->status !== 'available') {
                throw ValidationException::withMessages([
                    'bed_id' => "Bed {$lockedBed->bed_number} sedang terisi atau tidak tersedia.",
                ]);
            }

            $datePrefix = 'ADM-'.now()->format('Ymd');
            $countToday = Admission::where('admission_number', 'like', "{$datePrefix}%")->count() + 1;
            $admissionNumber = sprintf('%s-%04d', $datePrefix, $countToday);

            $doctorId = $data['doctor_id'] ?? $encounter->doctor_id;
            if (! $doctorId) {
                $doctorId = Doctor::value('id') ?? 1;
            }

            $admission = Admission::create([
                'admission_number' => $admissionNumber,
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'doctor_id' => $doctorId,
                'admitted_at' => $data['admitted_at'] ?? now(),
                'initial_diagnosis' => $data['initial_diagnosis'] ?? null,
                'status' => 'active',
            ]);

            BedAssignment::create([
                'admission_id' => $admission->id,
                'bed_id' => $lockedBed->id,
                'assigned_at' => now(),
                'assigned_by' => $user->id,
                'reason' => 'Admisi awal pasien rawat inap',
            ]);

            $lockedBed->update(['status' => 'occupied']);

            return $admission;
        });
    }

    /**
     * Transfer an active patient to another available bed.
     */
    public function transferBed(Admission $admission, Bed $targetBed, string $reason, User $user): BedAssignment
    {
        return DB::transaction(function () use ($admission, $targetBed, $reason, $user) {
            if ($admission->status !== 'active') {
                throw ValidationException::withMessages([
                    'admission' => 'Hanya pasien rawat inap aktif yang dapat dipindahkan bed.',
                ]);
            }

            /** @var Bed $lockedTarget */
            $lockedTarget = Bed::where('id', $targetBed->id)->lockForUpdate()->firstOrFail();

            if ($lockedTarget->status !== 'available') {
                throw ValidationException::withMessages([
                    'target_bed_id' => "Bed tujuan {$lockedTarget->bed_number} tidak tersedia.",
                ]);
            }

            // Release current bed
            $currentAssignment = $admission->currentAssignment;
            if ($currentAssignment) {
                $currentAssignment->update(['released_at' => now()]);
                Bed::where('id', $currentAssignment->bed_id)->update(['status' => 'available']);
            }

            // Assign new bed
            $newAssignment = BedAssignment::create([
                'admission_id' => $admission->id,
                'bed_id' => $lockedTarget->id,
                'assigned_at' => now(),
                'assigned_by' => $user->id,
                'reason' => $reason,
            ]);

            $lockedTarget->update(['status' => 'occupied']);

            return $newAssignment;
        });
    }

    /**
     * Discharge a patient and free the occupied bed.
     *
     * @param  array{
     *     discharge_diagnosis: string,
     *     discharge_summary?: string|null
     * }  $data
     */
    public function dischargePatient(Admission $admission, array $data, User $user): Admission
    {
        return DB::transaction(function () use ($admission, $data) {
            if ($admission->status !== 'active') {
                throw ValidationException::withMessages([
                    'admission' => 'Pasien telah dipulangkan sebelumnya.',
                ]);
            }

            $currentAssignment = $admission->currentAssignment;
            if ($currentAssignment) {
                $currentAssignment->update(['released_at' => now()]);
                Bed::where('id', $currentAssignment->bed_id)->update(['status' => 'available']);
            }

            $admission->update([
                'status' => 'discharged',
                'discharged_at' => now(),
                'discharge_diagnosis' => $data['discharge_diagnosis'],
                'discharge_summary' => $data['discharge_summary'] ?? null,
            ]);

            return $admission;
        });
    }

    /**
     * Add a daily clinical progression note (CPPT/visite).
     *
     * @param  array{
     *     note_type: string,
     *     vital_signs?: array<string, mixed>|null,
     *     subjective?: string|null,
     *     objective?: string|null,
     *     assessment?: string|null,
     *     plan?: string|null
     * }  $data
     */
    public function addDailyNote(Admission $admission, array $data, User $user): InpatientDailyNote
    {
        return InpatientDailyNote::create([
            'admission_id' => $admission->id,
            'note_type' => $data['note_type'],
            'vital_signs' => $data['vital_signs'] ?? null,
            'subjective' => $data['subjective'] ?? null,
            'objective' => $data['objective'] ?? null,
            'assessment' => $data['assessment'] ?? null,
            'plan' => $data['plan'] ?? null,
            'author_id' => $user->id,
        ]);
    }
}
