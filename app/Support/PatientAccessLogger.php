<?php

namespace App\Support;

use App\Models\PatientAccessLog;
use App\Models\Unit;
use App\Models\User;

final class PatientAccessLogger
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function record(
        User $user,
        int $patientId,
        string $action,
        ?Unit $unit = null,
        array $context = [],
    ): PatientAccessLog {
        return PatientAccessLog::create([
            'user_id' => $user->id,
            'patient_id' => $patientId,
            'unit_id' => $unit?->id,
            'action' => $action,
            'context' => $context === [] ? null : $context,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'accessed_at' => now(),
        ]);
    }
}
