<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Enums\EncounterStatus;
use App\Enums\Permissions\PharmacyPermission;
use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Services\MedicalRecordService;
use App\Services\PrescriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EncounterRecordController extends Controller
{
    public function show(
        Request $request,
        Encounter $encounter,
        MedicalRecordService $service,
        PrescriptionService $prescriptionService
    ): Response {
        Gate::authorize('view', $encounter);

        $user = $request->user();
        $emrData = $service->getEncounterWithEmr($encounter, $user, $request->ip(), $request->userAgent());

        $doctors = Doctor::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $isActiveEncounter = $encounter->status === EncounterStatus::InConsultation;

        $drugs = $isActiveEncounter && $user?->can(PharmacyPermission::PrescriptionCreate->value)
            ? $prescriptionService->getPrescribableDrugs()
            : [];

        return Inertia::render('medical-record/encounter/show/index', [
            'encounter' => $emrData,
            'doctors' => $doctors,
            'drugs' => $drugs,
        ]);
    }

    public function complete(
        Request $request,
        Encounter $encounter,
        MedicalRecordService $service
    ): RedirectResponse {
        Gate::authorize('view', $encounter);

        $service->completeEncounter($encounter, $request->user());

        return back()->with('success', "Konsultasi {$encounter->encounter_number} telah diselesaikan.");
    }
}
