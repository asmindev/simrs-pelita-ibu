<?php

namespace App\Http\Controllers\Registration;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class QueueController extends Controller
{
    public function call(Queue $queue, RegistrationService $service): RedirectResponse
    {
        Gate::authorize('call', $queue);

        $service->callQueue($queue, request()->user());

        return redirect()->back()->with('success', "Nomor antrean {$queue->queue_code} dipanggil.");
    }

    public function serve(Queue $queue, RegistrationService $service): RedirectResponse
    {
        Gate::authorize('serve', $queue);

        $service->serveQueue($queue, request()->user());

        return redirect()->back()->with('success', "Pelayanan dimulai untuk antrean {$queue->queue_code}.");
    }

    public function complete(Queue $queue, RegistrationService $service): RedirectResponse
    {
        Gate::authorize('complete', $queue);

        $service->completeQueue($queue, request()->user());

        return redirect()->back()->with('success', "Pelayanan antrean {$queue->queue_code} telah selesai.");
    }

    public function skip(Queue $queue, RegistrationService $service): RedirectResponse
    {
        Gate::authorize('skip', $queue);

        $service->skipQueue($queue, request()->user());

        return redirect()->back()->with('success', "Antrean {$queue->queue_code} dilewati.");
    }

    public function data(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Queue::class);

        $unitId = $request->integer('unit_id');

        $queues = Queue::query()
            ->with([
                'encounter.patient:id,name,medical_record_number',
                'encounter.doctor:id,name',
                'calledBy:id,name',
            ])
            ->where('unit_id', $unitId)
            ->today()
            ->orderBy('queue_number')
            ->get();

        return response()->json(['data' => $queues]);
    }
}
