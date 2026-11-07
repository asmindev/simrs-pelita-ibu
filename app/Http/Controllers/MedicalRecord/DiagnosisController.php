<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\StoreDiagnosisRequest;
use App\Models\Diagnosis;
use App\Models\Encounter;
use App\Services\MedicalRecordService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DiagnosisController extends Controller
{
    public function store(StoreDiagnosisRequest $request, Encounter $encounter, MedicalRecordService $service): RedirectResponse
    {
        $service->addDiagnosis($encounter, $request->validated(), $request->user());

        return back()->with('success', 'Diagnosis ICD-10 berhasil dicatat.');
    }

    public function destroy(Request $request, Diagnosis $diagnosis, MedicalRecordService $service): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->can(MedicalRecordPermission::DiagnosisManage->value)) {
            abort(403, 'Anda tidak berwenang mengelola data diagnosis.');
        }

        $assignedUnits = $user->unitIds();
        if (! empty($assignedUnits) && ! in_array($diagnosis->encounter->unit_id, $assignedUnits, true)) {
            abort(403, 'Akses unit dibatasi.');
        }

        $service->deleteDiagnosis($diagnosis, $user);

        return back()->with('success', 'Diagnosis berhasil dihapus.');
    }
}
