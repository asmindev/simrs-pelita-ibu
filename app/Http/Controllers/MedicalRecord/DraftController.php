<?php

namespace App\Http\Controllers\MedicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\SaveDraftRequest;
use App\Models\Encounter;
use App\Services\MedicalRecordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DraftController extends Controller
{
    public function store(SaveDraftRequest $request, Encounter $encounter, MedicalRecordService $service): JsonResponse
    {
        $draft = $service->saveDraft(
            $encounter,
            $request->input('form_type'),
            $request->input('content'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'updated_at' => $draft->updated_at?->toISOString(),
        ]);
    }

    public function show(Request $request, Encounter $encounter, MedicalRecordService $service): JsonResponse
    {
        $formType = $request->query('form_type', 'soap');
        $draft = $service->getDraft($encounter, $formType, $request->user());

        return response()->json([
            'draft' => $draft?->content,
            'updated_at' => $draft?->updated_at?->toISOString(),
        ]);
    }
}
