<?php

namespace App\Http\Controllers\Rbac;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rbac\ReviewBreakGlassRequest;
use App\Models\BreakGlassGrant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BreakGlassController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', BreakGlassGrant::class);

        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', 'all');

        $query = BreakGlassGrant::query()
            ->with(['user', 'patient', 'reviewedBy']);

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->whereHas('user', function ($uq) use ($search): void {
                    $uq->where('name', 'like', "%{$search}%");
                })->orWhereHas('patient', function ($pq) use ($search): void {
                    $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('medical_record_number', 'like', "%{$search}%");
                })->orWhere('reason', 'like', "%{$search}%");
            });
        }

        $now = now();

        if ($status === 'active') {
            $query->whereNull('revoked_at')
                ->where('expires_at', '>', $now);
        } elseif ($status === 'pending_review') {
            $query->whereNull('reviewed_at');
        } elseif ($status === 'reviewed') {
            $query->whereNotNull('reviewed_at');
        } elseif ($status === 'revoked') {
            $query->whereNotNull('revoked_at');
        }

        $grants = $query->orderByDesc('granted_at')
            ->paginate(15)
            ->withQueryString();

        $statistics = [
            'total_grants' => BreakGlassGrant::count(),
            'active_grants' => BreakGlassGrant::query()
                ->whereNull('revoked_at')
                ->where('expires_at', '>', $now)
                ->count(),
            'pending_review' => BreakGlassGrant::query()
                ->whereNull('reviewed_at')
                ->count(),
            'reviewed_grants' => BreakGlassGrant::query()
                ->whereNotNull('reviewed_at')
                ->count(),
        ];

        return Inertia::render('rbac/break-glass/list/index', [
            'grants' => $grants,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statistics' => $statistics,
        ]);
    }

    public function review(ReviewBreakGlassRequest $request, BreakGlassGrant $grant): RedirectResponse
    {
        $validated = $request->validated();

        $grant->update([
            'reviewed_by_id' => $request->user()?->id,
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        activity()
            ->causedBy($request->user())
            ->performedOn($grant)
            ->log("Meninjau akses darurat break-glass #{$grant->id}");

        return redirect()->route('rbac.break-glass.index')->with('success', 'Review akses darurat berhasil disimpan.');
    }

    public function revoke(Request $request, BreakGlassGrant $grant): RedirectResponse
    {
        Gate::authorize('review', $grant);

        $grant->update([
            'revoked_at' => now(),
        ]);

        activity()
            ->causedBy($request->user())
            ->performedOn($grant)
            ->log("Mencabut akses darurat break-glass #{$grant->id}");

        return redirect()->route('rbac.break-glass.index')->with('success', 'Akses darurat break-glass berhasil dicabut.');
    }
}
