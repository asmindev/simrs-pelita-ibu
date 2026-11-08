<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Activity::class);

        $search = (string) $request->query('search', '');
        $logName = (string) $request->query('log_name', 'all');
        $date = (string) $request->query('date', '');

        $query = Activity::query()->with(['causer', 'subject']);

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHasMorph('causer', ['App\Models\User'], function ($uq) use ($search): void {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($logName !== '' && $logName !== 'all') {
            $query->where('log_name', $logName);
        }

        if ($date !== '') {
            $query->whereDate('created_at', $date);
        }

        $logs = $query->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $today = now()->toDateString();
        $statistics = [
            'total_logs' => Activity::count(),
            'total_today' => Activity::whereDate('created_at', $today)->count(),
        ];

        $availableLogNames = Activity::distinct()->pluck('log_name')->filter()->values();

        return Inertia::render('audit/log/list/index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'log_name' => $logName,
                'date' => $date,
            ],
            'statistics' => $statistics,
            'availableLogNames' => $availableLogNames,
        ]);
    }
}
