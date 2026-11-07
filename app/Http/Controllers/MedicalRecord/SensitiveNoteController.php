<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\StoreSensitiveNoteRequest;
use App\Models\Encounter;
use App\Services\MedicalRecordService;
use Illuminate\Http\RedirectResponse;

class SensitiveNoteController extends Controller
{
    public function store(StoreSensitiveNoteRequest $request, Encounter $encounter, MedicalRecordService $service): RedirectResponse
    {
        $service->addSensitiveNote($encounter, $request->validated(), $request->user());

        return back()->with('success', 'Catatan medis khusus/sensitif berhasil disimpan.');
    }
}
