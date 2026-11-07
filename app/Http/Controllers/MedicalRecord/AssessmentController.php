<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\FinalizeAssessmentRequest;
use App\Http\Requests\MedicalRecord\StoreAddendumRequest;
use App\Http\Requests\MedicalRecord\StoreAssessmentRequest;
use App\Http\Requests\MedicalRecord\UpdateAssessmentRequest;
use App\Models\Assessment;
use App\Models\Encounter;
use App\Services\MedicalRecordService;
use Illuminate\Http\RedirectResponse;

class AssessmentController extends Controller
{
    public function store(StoreAssessmentRequest $request, Encounter $encounter, MedicalRecordService $service): RedirectResponse
    {
        $service->createAssessment($encounter, $request->validated(), $request->user());

        return back()->with('success', 'Asesmen klinis berhasil disimpan.');
    }

    public function update(UpdateAssessmentRequest $request, Assessment $assessment, MedicalRecordService $service): RedirectResponse
    {
        $service->updateAssessment($assessment, $request->validated(), $request->user());

        return back()->with('success', 'Asesmen klinis berhasil diperbarui.');
    }

    public function finalize(FinalizeAssessmentRequest $request, Assessment $assessment, MedicalRecordService $service): RedirectResponse
    {
        $service->finalizeAssessment($assessment, $request->user());

        return back()->with('success', 'Asesmen klinis berhasil difinalisasi (kunci rekam medis aktif).');
    }

    public function addendum(StoreAddendumRequest $request, Assessment $assessment, MedicalRecordService $service): RedirectResponse
    {
        $service->createAddendum($assessment, $request->validated(), $request->user());

        return back()->with('success', 'Catatan addendum rekam medis berhasil ditambahkan.');
    }
}
