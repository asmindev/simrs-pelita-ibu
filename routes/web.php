<?php

use App\Http\Controllers\PatientController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])
    ->prefix('master-data')
    ->name('master-data.')
    ->group(function (): void {
        Route::inertia('/', 'master-data/index')->name('index');

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
