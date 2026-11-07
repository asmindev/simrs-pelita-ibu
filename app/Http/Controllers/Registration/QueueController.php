<?php

namespace App\Http\Controllers\Registration;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use App\Models\Unit;
use App\Services\RegistrationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QueueController extends Controller
{
    public function board(Request $request): Response
    {
        Gate::authorize('viewAny', Queue::class);

        $user = $request->user();
        $assignedUnitIds = $user?->unitIds() ?? [];

        $units = Unit::query()
            ->active()
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('id', $assignedUnitIds))
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'type']);

        $selectedUnitId = $request->integer('unit_id');
        if ($selectedUnitId === 0 && $units->isNotEmpty()) {
            $selectedUnitId = $units->first()->id;
        }

        $queues = Queue::query()
            ->with([
                'encounter.patient:id,name,medical_record_number',
                'encounter.doctor:id,name',
                'calledBy:id,name',
            ])
            ->where('unit_id', $selectedUnitId)
            ->today()
            ->orderBy('queue_number')
            ->get();

        return Inertia::render('registration/queue/board/index', [
            'units' => $units,
            'selectedUnitId' => $selectedUnitId,
            'queues' => $queues,
        ]);
    }

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
