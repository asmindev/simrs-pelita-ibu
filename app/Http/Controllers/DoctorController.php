<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Doctor;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Doctor::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();

        $doctors = Doctor::query()
            ->when($search !== '', fn (Builder $query) => $query->search($search))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('master-data/doctor/index', [
            'doctors' => $doctors,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Doctor::class);

        return Inertia::render('master-data/doctor/create');
    }

    public function store(StoreDoctorRequest $request): RedirectResponse
    {
        Doctor::create($request->validated());

        return redirect()
            ->route('master-data.doctors.index')
            ->with('success', 'Dokter berhasil ditambahkan.');
    }

    public function edit(Doctor $doctor): Response
    {
        Gate::authorize('update', $doctor);

        $schedules = $doctor->schedules()
            ->with('unit')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        $units = Unit::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('master-data/doctor/edit', [
            'doctor' => $doctor,
            'schedules' => $schedules,
            'units' => $units,
        ]);
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): RedirectResponse
    {
        $doctor->update($request->validated());

        return redirect()
            ->route('master-data.doctors.index')
            ->with('success', 'Dokter berhasil diperbarui.');
    }

    public function destroy(Doctor $doctor): RedirectResponse
    {
        Gate::authorize('delete', $doctor);

        $doctor->update(['is_active' => false]);

        return redirect()
            ->route('master-data.doctors.index')
            ->with('success', 'Dokter dinonaktifkan.');
    }
}
