<?php

use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome/home/index')->name('home');

Route::middleware(['auth', 'verified'])
    ->prefix('master-data')
    ->name('master-data.')
    ->group(function (): void {
        Route::inertia('/', 'master-data/home/index')->name('index');

        Route::prefix('units')->name('units.')->group(function (): void {
            Route::get('/', [UnitController::class, 'index'])
                ->middleware('permission:master-data.unit.view')
                ->name('index');
            Route::get('create', [UnitController::class, 'create'])
                ->middleware('permission:master-data.unit.manage')
                ->name('create');
            Route::post('/', [UnitController::class, 'store'])
                ->middleware('permission:master-data.unit.manage')
                ->name('store');
            Route::get('{unit}/edit', [UnitController::class, 'edit'])
                ->middleware('permission:master-data.unit.manage')
                ->name('edit');
            Route::put('{unit}', [UnitController::class, 'update'])
                ->middleware('permission:master-data.unit.manage')
                ->name('update');
            Route::delete('{unit}', [UnitController::class, 'destroy'])
                ->middleware('permission:master-data.unit.manage')
                ->name('destroy');
        });

        Route::prefix('doctors')->name('doctors.')->group(function (): void {
            Route::get('/', [DoctorController::class, 'index'])
                ->middleware('permission:master-data.doctor.view')
                ->name('index');
            Route::get('create', [DoctorController::class, 'create'])
                ->middleware('permission:master-data.doctor.manage')
                ->name('create');
            Route::post('/', [DoctorController::class, 'store'])
                ->middleware('permission:master-data.doctor.manage')
                ->name('store');
            Route::get('{doctor}/edit', [DoctorController::class, 'edit'])
                ->middleware('permission:master-data.doctor.manage')
                ->name('edit');
            Route::put('{doctor}', [DoctorController::class, 'update'])
                ->middleware('permission:master-data.doctor.manage')
                ->name('update');
            Route::delete('{doctor}', [DoctorController::class, 'destroy'])
                ->middleware('permission:master-data.doctor.manage')
                ->name('destroy');
            Route::post('{doctor}/schedules', [DoctorScheduleController::class, 'store'])
                ->middleware('permission:master-data.doctor.manage')
                ->name('schedules.store');
            Route::delete('{doctor}/schedules/{schedule}', [DoctorScheduleController::class, 'destroy'])
                ->middleware('permission:master-data.doctor.manage')
                ->name('schedules.destroy');
        });

        Route::prefix('patients')->name('patients.')->group(function (): void {
            Route::get('/', [PatientController::class, 'index'])
                ->middleware('permission:master-data.patient.view')
                ->name('index');
            Route::get('duplicates', [PatientController::class, 'duplicates'])
                ->middleware('permission:master-data.patient.view')
                ->name('duplicates');
            Route::get('create', [PatientController::class, 'create'])
                ->middleware('permission:master-data.patient.create')
                ->name('create');
            Route::post('/', [PatientController::class, 'store'])
                ->middleware('permission:master-data.patient.create')
                ->name('store');
            Route::get('{patient}/edit', [PatientController::class, 'edit'])
                ->middleware('permission:master-data.patient.update')
                ->name('edit');
            Route::put('{patient}', [PatientController::class, 'update'])
                ->middleware('permission:master-data.patient.update')
                ->name('update');
            Route::delete('{patient}', [PatientController::class, 'destroy'])
                ->middleware('permission:master-data.patient.delete')
                ->name('destroy');
        });
    });
