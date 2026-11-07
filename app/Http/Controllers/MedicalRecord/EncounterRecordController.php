<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Services\MedicalRecordService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EncounterRecordController extends Controller
{
    public function show(Request $request, Encounter $encounter, MedicalRecordService $service): Response
    {
        Gate::authorize('view', $encounter);

        $user = $request->user();
        $emrData = $service->getEncounterWithEmr($encounter, $user, $request->ip(), $request->userAgent());

        $doctors = Doctor::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('medical-record/encounter/show/index', [
            'encounter' => $emrData,
            'doctors' => $doctors,
        ]);
    }
}
