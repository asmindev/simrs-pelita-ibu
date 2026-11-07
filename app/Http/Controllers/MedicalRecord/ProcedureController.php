<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\StoreProcedureRequest;
use App\Models\Encounter;
use App\Models\Procedure;
use App\Services\MedicalRecordService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProcedureController extends Controller
{
    public function store(StoreProcedureRequest $request, Encounter $encounter, MedicalRecordService $service): RedirectResponse
    {
        $service->addProcedure($encounter, $request->validated(), $request->user());

        return back()->with('success', 'Tindakan medis berhasil dicatat.');
    }

    public function destroy(Request $request, Procedure $procedure, MedicalRecordService $service): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->can(MedicalRecordPermission::ProcedureManage->value)) {
            abort(403, 'Anda tidak berwenang mengelola data tindakan medis.');
        }

        $assignedUnits = $user->unitIds();
        if (! empty($assignedUnits) && ! in_array($procedure->encounter->unit_id, $assignedUnits, true)) {
            abort(403, 'Akses unit dibatasi.');
        }

        $service->deleteProcedure($procedure, $user);

        return back()->with('success', 'Tindakan medis berhasil dihapus.');
    }
}
