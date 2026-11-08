<?php

namespace App\Services;

use App\Models\DiagnosticOrder;
use App\Models\DiagnosticOrderItem;
use App\Models\DiagnosticResult;
use App\Models\Encounter;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DiagnosticService
{
    /**
     * Create a diagnostic order from an encounter with order items.
     *
     * @param  array{
     *     type: string,
     *     unit_id?: int|null,
     *     clinical_notes?: string|null,
     *     items: array<int, array{test_name: string, tariff_id?: int|null, notes?: string|null}>
     * }  $data
     */
    public function createOrder(Encounter $encounter, array $data, User $user): DiagnosticOrder
    {
        return DB::transaction(function () use ($encounter, $data) {
            $datePrefix = 'ORD-'.now()->format('Ymd');
            $countToday = DiagnosticOrder::where('order_number', 'like', "{$datePrefix}%")->count() + 1;
            $orderNumber = sprintf('%s-%04d', $datePrefix, $countToday);

            $order = DiagnosticOrder::create([
                'order_number' => $orderNumber,
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'doctor_id' => $encounter->doctor_id ?? 1,
                'unit_id' => $data['unit_id'] ?? null,
                'type' => $data['type'],
                'status' => 'ordered',
                'clinical_notes' => $data['clinical_notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                DiagnosticOrderItem::create([
                    'diagnostic_order_id' => $order->id,
                    'tariff_id' => $item['tariff_id'] ?? null,
                    'test_name' => $item['test_name'],
                    'status' => 'pending',
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            return $order;
        });
    }

    /**
     * Record a test result with optional file attachment.
     *
     * @param  array{
     *     diagnostic_order_item_id?: int|null,
     *     parameter_name: string,
     *     result_value: string,
     *     reference_range?: string|null,
     *     unit?: string|null,
     *     is_critical?: bool|null,
     *     interpretation?: string|null
     * }  $data
     */
    public function recordResult(DiagnosticOrder $order, array $data, ?UploadedFile $attachment, User $user): DiagnosticResult
    {
        return DB::transaction(function () use ($order, $data, $attachment, $user) {
            if ($order->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'order' => 'Order pemeriksaan yang dibatalkan tidak dapat diisi hasil.',
                ]);
            }

            $attachmentPath = null;
            if ($attachment) {
                $attachmentPath = $attachment->store('diagnostics', 'public');
            }

            $result = DiagnosticResult::create([
                'diagnostic_order_id' => $order->id,
                'diagnostic_order_item_id' => $data['diagnostic_order_item_id'] ?? null,
                'parameter_name' => $data['parameter_name'],
                'result_value' => $data['result_value'],
                'reference_range' => $data['reference_range'] ?? null,
                'unit' => $data['unit'] ?? null,
                'is_critical' => (bool) ($data['is_critical'] ?? false),
                'interpretation' => $data['interpretation'] ?? null,
                'attachment_path' => $attachmentPath,
                'performed_by' => $user->id,
                'performed_at' => now(),
            ]);

            if (! empty($data['diagnostic_order_item_id'])) {
                DiagnosticOrderItem::where('id', $data['diagnostic_order_item_id'])
                    ->update(['status' => 'completed']);
            }

            if ($order->status === 'ordered') {
                $order->update(['status' => 'in_progress']);
            }

            return $result;
        });
    }

    /**
     * Mark diagnostic order as completed.
     */
    public function completeOrder(DiagnosticOrder $order, User $user): DiagnosticOrder
    {
        if ($order->status === 'cancelled') {
            throw ValidationException::withMessages([
                'order' => 'Order telah dibatalkan.',
            ]);
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => $user->id,
        ]);

        return $order;
    }
}
