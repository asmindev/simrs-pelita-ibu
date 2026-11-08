<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBedRequest;
use App\Models\Bed;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BedController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Bed::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString(); // available, occupied, maintenance
        $class = $request->string('class')->toString();

        $beds = Bed::query()
            ->with(['currentAssignment.admission.patient'])
            ->when($search !== '', function (Builder $q) use ($search) {
                $q->where('bed_number', 'like', "%{$search}%")
                    ->orWhere('room_name', 'like', "%{$search}%");
            })
            ->when($status !== '' && $status !== 'all', fn (Builder $q) => $q->where('status', $status))
            ->when($class !== '' && $class !== 'all', fn (Builder $q) => $q->where('class', $class))
            ->orderBy('room_name')
            ->orderBy('bed_number')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('inpatient/bed/list/index', [
            'beds' => $beds,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'class' => $class,
            ],
            'statistics' => [
                'total_beds' => Bed::count(),
                'available_beds' => Bed::where('status', 'available')->count(),
                'occupied_beds' => Bed::where('status', 'occupied')->count(),
                'maintenance_beds' => Bed::where('status', 'maintenance')->count(),
            ],
        ]);
    }

    public function store(StoreBedRequest $request): RedirectResponse
    {
        Gate::authorize('create', Bed::class);

        $bed = Bed::create($request->validated());

        return back()->with('success', "Bed {$bed->bed_number} di {$bed->room_name} berhasil didaftarkan.");
    }
}
