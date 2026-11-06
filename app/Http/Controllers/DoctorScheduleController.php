<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorScheduleRequest;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class DoctorScheduleController extends Controller
{
    public function store(StoreDoctorScheduleRequest $request, Doctor $doctor): RedirectResponse
    {
        $doctor->schedules()->create($request->validated());

        return back()->with('success', 'Jadwal praktik berhasil ditambahkan.');
    }

    public function destroy(Doctor $doctor, DoctorSchedule $schedule): RedirectResponse
    {
        Gate::authorize('update', $doctor);

        abort_unless($schedule->doctor_id === $doctor->id, 404);

        $schedule->delete();

        return back()->with('success', 'Jadwal praktik dihapus.');
    }
}
