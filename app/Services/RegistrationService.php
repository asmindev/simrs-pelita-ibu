<?php

namespace App\Services;

use App\Enums\EncounterStatus;
use App\Enums\QueueStatus;
use App\Models\Encounter;
use App\Models\InsuranceCoverage;
use App\Models\PatientAccessLog;
use App\Models\Queue;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function createEncounter(array $data, User $actor): Encounter
    {
        return DB::transaction(function () use ($data, $actor): Encounter {
            $unit = Unit::findOrFail($data['unit_id']);
            $encounterNumber = $this->generateEncounterNumber();
            $queueData = $this->generateQueueNumber($unit, now());

            $encounter = Encounter::create([
                'encounter_number' => $encounterNumber,
                'patient_id' => $data['patient_id'],
                'unit_id' => $unit->id,
                'doctor_id' => $data['doctor_id'] ?? null,
                'type' => $data['type'],
                'status' => EncounterStatus::Arrived,
                'guarantor_id' => $data['guarantor_id'],
                'arrived_at' => now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor->id,
            ]);

            $queue = Queue::create([
                'encounter_id' => $encounter->id,
                'unit_id' => $unit->id,
                'queue_date' => today(),
                'queue_number' => $queueData['number'],
                'queue_code' => $queueData['code'],
                'status' => QueueStatus::Waiting,
            ]);

            if (! empty($data['card_number']) || ! empty($data['claim_number'])) {
                InsuranceCoverage::create([
                    'encounter_id' => $encounter->id,
                    'guarantor_id' => $data['guarantor_id'],
                    'card_number' => $data['card_number'] ?? null,
                    'claim_number' => $data['claim_number'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]);
            }

            activity('registration')
                ->causedBy($actor)
                ->performedOn($encounter)
                ->event('encounter_created')
                ->withProperties([
                    'encounter_number' => $encounter->encounter_number,
                    'queue_code' => $queue->queue_code,
                    'patient_id' => $encounter->patient_id,
                    'unit_id' => $encounter->unit_id,
                ])
                ->log("Pendaftaran kunjungan {$encounter->encounter_number} dengan antrean {$queue->queue_code}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $encounter->patient_id,
                'unit_id' => $encounter->unit_id,
                'action' => 'registration',
                'context' => [
                    'encounter_number' => $encounter->encounter_number,
                    'queue_code' => $queue->queue_code,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'accessed_at' => now(),
            ]);

            return $encounter->load(['patient', 'unit', 'doctor', 'guarantor', 'queue', 'insuranceCoverage']);
        });
    }

    public function cancelEncounter(Encounter $encounter, string $reason, User $actor): Encounter
    {
        return DB::transaction(function () use ($encounter, $reason, $actor): Encounter {
            $encounter->update([
                'status' => EncounterStatus::Cancelled,
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
                'cancelled_by' => $actor->id,
            ]);

            if ($encounter->queue) {
                $encounter->queue->update([
                    'status' => QueueStatus::Cancelled,
                ]);
            }

            activity('registration')
                ->causedBy($actor)
                ->performedOn($encounter)
                ->event('encounter_cancelled')
                ->withProperties([
                    'encounter_number' => $encounter->encounter_number,
                    'reason' => $reason,
                ])
                ->log("Pembatalan kunjungan {$encounter->encounter_number}: {$reason}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $encounter->patient_id,
                'unit_id' => $encounter->unit_id,
                'action' => 'cancel_encounter',
                'context' => [
                    'encounter_number' => $encounter->encounter_number,
                    'reason' => $reason,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'accessed_at' => now(),
            ]);

            return $encounter;
        });
    }

    public function callQueue(Queue $queue, User $actor): Queue
    {
        $queue->update([
            'status' => QueueStatus::Calling,
            'called_at' => now(),
            'called_by' => $actor->id,
        ]);

        activity('registration')
            ->causedBy($actor)
            ->performedOn($queue)
            ->event('queue_called')
            ->withProperties([
                'queue_code' => $queue->queue_code,
                'unit_id' => $queue->unit_id,
            ])
            ->log("Pemanggilan antrean {$queue->queue_code}");

        return $queue;
    }

    public function serveQueue(Queue $queue, User $actor): Queue
    {
        return DB::transaction(function () use ($queue, $actor): Queue {
            $queue->update([
                'status' => QueueStatus::Serving,
                'served_at' => now(),
            ]);

            $queue->encounter->update([
                'status' => EncounterStatus::InConsultation,
                'consultation_started_at' => now(),
            ]);

            activity('registration')
                ->causedBy($actor)
                ->performedOn($queue)
                ->event('queue_served')
                ->withProperties([
                    'queue_code' => $queue->queue_code,
                    'encounter_number' => $queue->encounter->encounter_number,
                ])
                ->log("Pelayanan dimulai untuk antrean {$queue->queue_code}");

            return $queue;
        });
    }

    public function completeQueue(Queue $queue, User $actor): Queue
    {
        return DB::transaction(function () use ($queue, $actor): Queue {
            $queue->update([
                'status' => QueueStatus::Completed,
                'completed_at' => now(),
            ]);

            $queue->encounter->update([
                'status' => EncounterStatus::Finished,
                'consultation_ended_at' => now(),
            ]);

            activity('registration')
                ->causedBy($actor)
                ->performedOn($queue)
                ->event('queue_completed')
                ->withProperties([
                    'queue_code' => $queue->queue_code,
                    'encounter_number' => $queue->encounter->encounter_number,
                ])
                ->log("Pelayanan selesai untuk antrean {$queue->queue_code}");

            return $queue;
        });
    }

    public function skipQueue(Queue $queue, User $actor): Queue
    {
        $queue->update([
            'status' => QueueStatus::Skipped,
        ]);

        activity('registration')
            ->causedBy($actor)
            ->performedOn($queue)
            ->event('queue_skipped')
            ->withProperties([
                'queue_code' => $queue->queue_code,
            ])
            ->log("Antrean {$queue->queue_code} dilewati");

        return $queue;
    }

    public function generateEncounterNumber(): string
    {
        $date = now()->format('Ymd');
        $lastEncounter = Encounter::query()
            ->where('encounter_number', 'like', "ENC-{$date}-%")
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        $sequence = 1;
        if ($lastEncounter) {
            $parts = explode('-', $lastEncounter->encounter_number);
            $sequence = ((int) end($parts)) + 1;
        }

        return sprintf('ENC-%s-%05d', $date, $sequence);
    }

    /**
     * @return array{number: int, code: string}
     */
    public function generateQueueNumber(Unit $unit, Carbon|string $date): array
    {
        $parsedDate = Carbon::parse($date)->toDateString();
        $lastQueue = Queue::query()
            ->where('unit_id', $unit->id)
            ->whereDate('queue_date', $parsedDate)
            ->orderByDesc('queue_number')
            ->lockForUpdate()
            ->first();

        $nextNumber = $lastQueue ? $lastQueue->queue_number + 1 : 1;
        $prefix = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', $unit->code));
        $prefix = $prefix !== '' ? substr($prefix, 0, 4) : 'Q';
        $code = sprintf('%s-%03d', $prefix, $nextNumber);

        return [
            'number' => $nextNumber,
            'code' => $code,
        ];
    }
}
