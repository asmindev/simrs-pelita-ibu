<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\PatientAccessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientAccessLogController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', PatientAccessLog::class);

        $search = (string) $request->query('search', '');
        $action = (string) $request->query('action', 'all');
        $date = (string) $request->query('date', '');

        $query = PatientAccessLog::query()->with(['user', 'patient', 'unit']);

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->whereHas('patient', function ($pq) use ($search): void {
                    $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('medical_record_number', 'like', "%{$search}%");
                })->orWhereHas('user', function ($uq) use ($search): void {
                    $uq->where('name', 'like', "%{$search}%");
                });
            });
        }

        if ($action !== '' && $action !== 'all') {
            $query->where('action', $action);
        }

        if ($date !== '') {
            $query->whereDate('accessed_at', $date);
        }

        $logs = $query->orderByDesc('accessed_at')
            ->paginate(20)
            ->withQueryString();

        $today = now()->toDateString();
        $statistics = [
            'total_logs' => PatientAccessLog::count(),
            'total_today' => PatientAccessLog::whereDate('accessed_at', $today)->count(),
        ];

        return Inertia::render('audit/patient-access/list/index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'action' => $action,
                'date' => $date,
            ],
            'statistics' => $statistics,
        ]);
    }
}
