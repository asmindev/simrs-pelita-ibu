<?php

use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\DrugCategoryController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\GuarantorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome/home/index')->name('home');

Route::inertia('/dashboard', 'dashboard/index')
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

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

        Route::prefix('guarantors')->name('guarantors.')->group(function (): void {
            Route::get('/', [GuarantorController::class, 'index'])
                ->middleware('permission:master-data.guarantor.view')
                ->name('index');
            Route::get('create', [GuarantorController::class, 'create'])
                ->middleware('permission:master-data.guarantor.manage')
                ->name('create');
            Route::post('/', [GuarantorController::class, 'store'])
                ->middleware('permission:master-data.guarantor.manage')
                ->name('store');
            Route::get('{guarantor}/edit', [GuarantorController::class, 'edit'])
                ->middleware('permission:master-data.guarantor.manage')
                ->name('edit');
            Route::put('{guarantor}', [GuarantorController::class, 'update'])
                ->middleware('permission:master-data.guarantor.manage')
                ->name('update');
            Route::delete('{guarantor}', [GuarantorController::class, 'destroy'])
                ->middleware('permission:master-data.guarantor.manage')
                ->name('destroy');
        });

        Route::prefix('tariffs')->name('tariffs.')->group(function (): void {
            Route::get('/', [TariffController::class, 'index'])
                ->middleware('permission:master-data.tariff.view')
                ->name('index');
            Route::get('create', [TariffController::class, 'create'])
                ->middleware('permission:master-data.tariff.manage')
                ->name('create');
            Route::post('/', [TariffController::class, 'store'])
                ->middleware('permission:master-data.tariff.manage')
                ->name('store');
            Route::get('{tariff}/edit', [TariffController::class, 'edit'])
                ->middleware('permission:master-data.tariff.manage')
                ->name('edit');
            Route::put('{tariff}', [TariffController::class, 'update'])
                ->middleware('permission:master-data.tariff.manage')
                ->name('update');
            Route::delete('{tariff}', [TariffController::class, 'destroy'])
                ->middleware('permission:master-data.tariff.manage')
                ->name('destroy');
        });

        Route::prefix('drugs')->name('drugs.')->group(function (): void {
            Route::get('/', [DrugController::class, 'index'])
                ->middleware('permission:master-data.drug.view')
                ->name('index');
            Route::get('create', [DrugController::class, 'create'])
                ->middleware('permission:master-data.drug.manage')
                ->name('create');
            Route::post('/', [DrugController::class, 'store'])
                ->middleware('permission:master-data.drug.manage')
                ->name('store');
            Route::get('{drug}/edit', [DrugController::class, 'edit'])
                ->middleware('permission:master-data.drug.manage')
                ->name('edit');
            Route::put('{drug}', [DrugController::class, 'update'])
                ->middleware('permission:master-data.drug.manage')
                ->name('update');
            Route::delete('{drug}', [DrugController::class, 'destroy'])
                ->middleware('permission:master-data.drug.manage')
                ->name('destroy');
        });

        Route::prefix('drug-categories')->name('drug-categories.')->group(function (): void {
            Route::post('/', [DrugCategoryController::class, 'store'])
                ->middleware('permission:master-data.drug.manage')
                ->name('store');
            Route::put('{drugCategory}', [DrugCategoryController::class, 'update'])
                ->middleware('permission:master-data.drug.manage')
                ->name('update');
            Route::delete('{drugCategory}', [DrugCategoryController::class, 'destroy'])
                ->middleware('permission:master-data.drug.manage')
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
