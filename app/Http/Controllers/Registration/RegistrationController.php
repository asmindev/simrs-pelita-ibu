<?php

namespace App\Http\Controllers\Registration;

use App\Enums\QueueStatus;
use App\Http\Controllers\Controller;
use App\Models\Encounter;
use App\Models\Queue;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Encounter::class);

        $user = $request->user();
        $assignedUnitIds = $user?->unitIds() ?? [];

        $unitsQuery = Unit::query()
            ->active()
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('id', $assignedUnitIds))
            ->orderBy('name');

        $units = $unitsQuery->get()->map(function (Unit $unit): array {
            $todayQueues = Queue::query()
                ->where('unit_id', $unit->id)
                ->today()
                ->get();

            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'type' => $unit->type->value,
                'total_today' => $todayQueues->count(),
                'waiting_count' => $todayQueues->where('status', QueueStatus::Waiting)->count(),
                'calling_count' => $todayQueues->where('status', QueueStatus::Calling)->count(),
                'serving_count' => $todayQueues->where('status', QueueStatus::Serving)->count(),
                'completed_count' => $todayQueues->where('status', QueueStatus::Completed)->count(),
            ];
        });

        $encountersQuery = Encounter::query()
            ->today()
            ->when(! empty($assignedUnitIds), fn (Builder $query) => $query->whereIn('unit_id', $assignedUnitIds));

        $todayTotal = (clone $encountersQuery)->count();
        $todayActive = (clone $encountersQuery)->active()->count();

        return Inertia::render('registration/home/index', [
            'metrics' => [
                'total_encounters_today' => $todayTotal,
                'active_encounters_today' => $todayActive,
                'completed_today' => $todayTotal - $todayActive,
            ],
            'units' => $units,
        ]);
    }
}
