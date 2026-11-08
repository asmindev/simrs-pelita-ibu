<?php

use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\Audit\ActivityLogController;
use App\Http\Controllers\Audit\PatientAccessLogController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiagnosticOrderController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\DrugCategoryController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\GuarantorController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MedicalRecord\AssessmentController;
use App\Http\Controllers\MedicalRecord\ClinicalReportController;
use App\Http\Controllers\MedicalRecord\DiagnosisController;
use App\Http\Controllers\MedicalRecord\DraftController;
use App\Http\Controllers\MedicalRecord\EncounterRecordController;
use App\Http\Controllers\MedicalRecord\MedicalRecordController;
use App\Http\Controllers\MedicalRecord\ProcedureController;
use App\Http\Controllers\MedicalRecord\SensitiveNoteController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PharmacyStockController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\Rbac\BreakGlassController;
use App\Http\Controllers\Rbac\RoleController;
use App\Http\Controllers\Rbac\UserController;
use App\Http\Controllers\Registration\EncounterController;
use App\Http\Controllers\Registration\QueueController;
use App\Http\Controllers\Registration\RegistrationController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome/home/index')->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])
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
            Route::get('search', [PatientController::class, 'search'])
                ->middleware('permission:master-data.patient.view')
                ->name('search');
            Route::get('create', [PatientController::class, 'create'])
                ->middleware('permission:master-data.patient.create')
                ->name('create');
            Route::post('/', [PatientController::class, 'store'])
                ->middleware('permission:master-data.patient.create')
                ->name('store');
            Route::post('{patient}/merge', [PatientController::class, 'merge'])
                ->middleware('permission:master-data.patient.merge')
                ->name('merge');
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

Route::middleware(['auth', 'verified'])
    ->prefix('registration')
    ->name('registration.')
    ->group(function (): void {
        Route::get('/', [RegistrationController::class, 'index'])
            ->middleware('permission:registration.visit.view')
            ->name('index');

        Route::prefix('visits')->name('visits.')->group(function (): void {
            Route::get('/', [EncounterController::class, 'index'])
                ->middleware('permission:registration.visit.view')
                ->name('index');
            Route::get('create', [EncounterController::class, 'create'])
                ->middleware('permission:registration.visit.create')
                ->name('create');
            Route::post('/', [EncounterController::class, 'store'])
                ->middleware('permission:registration.visit.create')
                ->name('store');
            Route::get('{encounter}', [EncounterController::class, 'show'])
                ->middleware('permission:registration.visit.view')
                ->name('show');
            Route::post('{encounter}/cancel', [EncounterController::class, 'cancel'])
                ->middleware('permission:registration.visit.cancel')
                ->name('cancel');
        });

        Route::prefix('queues')->name('queues.')->group(function (): void {
            Route::get('board', [QueueController::class, 'board'])
                ->middleware('permission:registration.queue.view')
                ->name('board');
            Route::get('data', [QueueController::class, 'data'])
                ->middleware('permission:registration.queue.view')
                ->name('data');
            Route::post('{queue}/call', [QueueController::class, 'call'])
                ->middleware('permission:registration.queue.call')
                ->name('call');
            Route::post('{queue}/serve', [QueueController::class, 'serve'])
                ->middleware('permission:registration.queue.call')
                ->name('serve');
            Route::post('{queue}/complete', [QueueController::class, 'complete'])
                ->middleware('permission:registration.queue.call')
                ->name('complete');
            Route::post('{queue}/skip', [QueueController::class, 'skip'])
                ->middleware('permission:registration.queue.call')
                ->name('skip');
        });
    });

Route::middleware(['auth', 'verified'])
    ->prefix('medical-record')
    ->name('medical-record.')
    ->group(function (): void {
        Route::get('/', [MedicalRecordController::class, 'index'])
            ->middleware('permission:medical-record.encounter.view')
            ->name('index');

        Route::get('patients/{patient}/history', [MedicalRecordController::class, 'patientHistory'])
            ->middleware('permission:medical-record.encounter.view')
            ->name('patient.history');

        Route::prefix('encounters/{encounter}')->name('encounters.')->group(function (): void {
            Route::get('/', [EncounterRecordController::class, 'show'])
                ->middleware('permission:medical-record.encounter.view')
                ->name('show');

            Route::post('assessments', [AssessmentController::class, 'store'])
                ->middleware('permission:medical-record.assessment.update')
                ->name('assessments.store');

            Route::post('diagnoses', [DiagnosisController::class, 'store'])
                ->middleware('permission:medical-record.diagnosis.manage')
                ->name('diagnoses.store');

            Route::post('procedures', [ProcedureController::class, 'store'])
                ->middleware('permission:medical-record.procedure.manage')
                ->name('procedures.store');

            Route::post('sensitive-notes', [SensitiveNoteController::class, 'store'])
                ->middleware('permission:medical-record.sensitive-note.update')
                ->name('sensitive-notes.store');

            Route::get('reports/create', [ClinicalReportController::class, 'create'])
                ->middleware('permission:medical-record.report.manage')
                ->name('reports.create');

            Route::post('reports', [ClinicalReportController::class, 'store'])
                ->middleware('permission:medical-record.report.manage')
                ->name('reports.store');

            Route::get('drafts', [DraftController::class, 'show'])
                ->middleware('permission:medical-record.assessment.update')
                ->name('drafts.show');

            Route::post('drafts', [DraftController::class, 'store'])
                ->middleware('permission:medical-record.assessment.update')
                ->name('drafts.store');
        });

        Route::prefix('assessments/{assessment}')->name('assessments.')->group(function (): void {
            Route::put('/', [AssessmentController::class, 'update'])
                ->middleware('permission:medical-record.assessment.update')
                ->name('update');

            Route::post('finalize', [AssessmentController::class, 'finalize'])
                ->middleware('permission:medical-record.assessment.update')
                ->name('finalize');

            Route::post('addenda', [AssessmentController::class, 'addendum'])
                ->middleware('permission:medical-record.assessment.update')
                ->name('addenda.store');
        });

        Route::delete('diagnoses/{diagnosis}', [DiagnosisController::class, 'destroy'])
            ->middleware('permission:medical-record.diagnosis.manage')
            ->name('diagnoses.destroy');

        Route::delete('procedures/{procedure}', [ProcedureController::class, 'destroy'])
            ->middleware('permission:medical-record.procedure.manage')
            ->name('procedures.destroy');

        Route::prefix('reports')->name('reports.')->group(function (): void {
            Route::get('/', [ClinicalReportController::class, 'index'])
                ->middleware('permission:medical-record.report.view')
                ->name('index');

            Route::get('{clinicalReport}', [ClinicalReportController::class, 'show'])
                ->middleware('permission:medical-record.report.view')
                ->name('show');
        });
    });

Route::middleware(['auth', 'verified'])
    ->prefix('pharmacy')
    ->name('pharmacy.')
    ->group(function (): void {
        Route::redirect('/', '/pharmacy/prescriptions')->name('index');

        Route::prefix('prescriptions')->name('prescriptions.')->group(function (): void {
            Route::get('/', [PrescriptionController::class, 'index'])
                ->middleware('permission:pharmacy.prescription.view')
                ->name('index');

            Route::post('/', [PrescriptionController::class, 'store'])
                ->middleware('permission:pharmacy.prescription.create')
                ->name('store');

            Route::get('{prescription}', [PrescriptionController::class, 'show'])
                ->middleware('permission:pharmacy.prescription.view')
                ->name('show');

            Route::post('{prescription}/verify', [PrescriptionController::class, 'verify'])
                ->middleware('permission:pharmacy.prescription.verify')
                ->name('verify');

            Route::post('{prescription}/dispense', [PrescriptionController::class, 'dispense'])
                ->middleware('permission:pharmacy.dispensing.create')
                ->name('dispense');

            Route::post('{prescription}/cancel', [PrescriptionController::class, 'cancel'])
                ->middleware('permission:pharmacy.prescription.verify')
                ->name('cancel');

            Route::post('{prescription}/return', [PrescriptionController::class, 'returnItem'])
                ->middleware('permission:pharmacy.return.create')
                ->name('return');
        });

        Route::prefix('stock')->name('stock.')->group(function (): void {
            Route::get('/', [PharmacyStockController::class, 'index'])
                ->middleware('permission:pharmacy.stock.view')
                ->name('index');

            Route::post('batches', [PharmacyStockController::class, 'storeBatch'])
                ->middleware('permission:pharmacy.stock.adjust')
                ->name('batches.store');

            Route::post('batches/{batch}/adjust', [PharmacyStockController::class, 'adjust'])
                ->middleware('permission:pharmacy.stock.adjust')
                ->name('batches.adjust');
        });
    });

Route::middleware(['auth', 'verified'])
    ->prefix('cashier')
    ->name('cashier.')
    ->group(function (): void {
        Route::redirect('/', '/cashier/invoices')->name('index');

        Route::prefix('invoices')->name('invoices.')->group(function (): void {
            Route::get('/', [InvoiceController::class, 'index'])
                ->middleware('permission:cashier.invoice.view')
                ->name('index');

            Route::post('/', [InvoiceController::class, 'store'])
                ->middleware('permission:cashier.invoice.create')
                ->name('store');

            Route::get('{invoice}', [InvoiceController::class, 'show'])
                ->middleware('permission:cashier.invoice.view')
                ->name('show');

            Route::post('{invoice}/finalize', [InvoiceController::class, 'finalize'])
                ->middleware('permission:cashier.invoice.finalize')
                ->name('finalize');

            Route::post('{invoice}/void', [InvoiceController::class, 'void'])
                ->middleware('permission:cashier.invoice.void')
                ->name('void');

            Route::post('{invoice}/payments', [PaymentController::class, 'store'])
                ->middleware('permission:cashier.payment.create')
                ->name('payments.store');

            Route::post('{invoice}/refunds', [PaymentController::class, 'refund'])
                ->middleware('permission:cashier.refund.create')
                ->name('refunds.store');
        });
    });

Route::middleware(['auth', 'verified'])
    ->prefix('diagnostics')
    ->name('diagnostics.')
    ->group(function (): void {
        Route::redirect('/', '/diagnostics/orders')->name('index');

        Route::prefix('orders')->name('orders.')->group(function (): void {
            Route::get('/', [DiagnosticOrderController::class, 'index'])
                ->middleware('permission:diagnostics.order.view')
                ->name('index');

            Route::post('/', [DiagnosticOrderController::class, 'store'])
                ->middleware('permission:diagnostics.order.create')
                ->name('store');

            Route::get('{order}', [DiagnosticOrderController::class, 'show'])
                ->middleware('permission:diagnostics.order.view')
                ->name('show');

            Route::post('{order}/results', [DiagnosticOrderController::class, 'inputResult'])
                ->middleware('permission:diagnostics.result.input')
                ->name('results.store');

            Route::post('{order}/complete', [DiagnosticOrderController::class, 'complete'])
                ->middleware('permission:diagnostics.result.verify')
                ->name('complete');
        });
    });

Route::middleware(['auth', 'verified'])
    ->prefix('inpatient')
    ->name('inpatient.')
    ->group(function (): void {
        Route::redirect('/', '/inpatient/admissions')->name('index');

        Route::prefix('beds')->name('beds.')->group(function (): void {
            Route::get('/', [BedController::class, 'index'])
                ->middleware('permission:inpatient.bed.view')
                ->name('index');

            Route::post('/', [BedController::class, 'store'])
                ->middleware('permission:inpatient.bed.view')
                ->name('store');
        });

        Route::prefix('admissions')->name('admissions.')->group(function (): void {
            Route::get('/', [AdmissionController::class, 'index'])
                ->middleware('permission:inpatient.admission.view')
                ->name('index');

            Route::post('/', [AdmissionController::class, 'store'])
                ->middleware('permission:inpatient.admission.create')
                ->name('store');

            Route::get('{admission}', [AdmissionController::class, 'show'])
                ->middleware('permission:inpatient.admission.view')
                ->name('show');

            Route::post('{admission}/transfer', [AdmissionController::class, 'transferBed'])
                ->middleware('permission:inpatient.transfer.create')
                ->name('transfer');

            Route::post('{admission}/discharge', [AdmissionController::class, 'discharge'])
                ->middleware('permission:inpatient.discharge.create')
                ->name('discharge');

            Route::post('{admission}/daily-notes', [AdmissionController::class, 'addDailyNote'])
                ->middleware('permission:inpatient.daily-note.update')
                ->name('daily-notes.store');
        });
    });

Route::middleware(['auth', 'verified'])
    ->prefix('rbac')
    ->name('rbac.')
    ->group(function (): void {
        Route::redirect('/', '/rbac/users')->name('index');

        Route::prefix('users')->name('users.')->group(function (): void {
            Route::get('/', [UserController::class, 'index'])
                ->middleware('permission:rbac.user.view')
                ->name('index');

            Route::post('/', [UserController::class, 'store'])
                ->middleware('permission:rbac.user.manage')
                ->name('store');

            Route::put('{user}', [UserController::class, 'update'])
                ->middleware('permission:rbac.user.manage')
                ->name('update');

            Route::delete('{user}', [UserController::class, 'destroy'])
                ->middleware('permission:rbac.user.manage')
                ->name('destroy');
        });

        Route::prefix('roles')->name('roles.')->group(function (): void {
            Route::get('/', [RoleController::class, 'index'])
                ->middleware('permission:rbac.role.view')
                ->name('index');

            Route::post('/', [RoleController::class, 'store'])
                ->middleware('permission:rbac.role.assign')
                ->name('store');

            Route::put('{role}', [RoleController::class, 'update'])
                ->middleware('permission:rbac.role.assign')
                ->name('update');

            Route::put('{role}/permissions', [RoleController::class, 'updatePermissions'])
                ->middleware('permission:rbac.role.assign')
                ->name('permissions.update');
        });

        Route::prefix('break-glass')->name('break-glass.')->group(function (): void {
            Route::get('/', [BreakGlassController::class, 'index'])
                ->middleware('permission:rbac.break-glass.review')
                ->name('index');

            Route::post('{grant}/review', [BreakGlassController::class, 'review'])
                ->middleware('permission:rbac.break-glass.review')
                ->name('review');

            Route::post('{grant}/revoke', [BreakGlassController::class, 'revoke'])
                ->middleware('permission:rbac.break-glass.review')
                ->name('revoke');
        });
    });

Route::middleware(['auth', 'verified'])
    ->prefix('audit')
    ->name('audit.')
    ->group(function (): void {
        Route::redirect('/', '/audit/logs')->name('index');

        Route::prefix('logs')->name('logs.')->group(function (): void {
            Route::get('/', [ActivityLogController::class, 'index'])
                ->middleware('permission:audit.log.view')
                ->name('index');
        });

        Route::prefix('patient-access')->name('patient-access.')->group(function (): void {
            Route::get('/', [PatientAccessLogController::class, 'index'])
                ->middleware('permission:audit.patient-access.view')
                ->name('index');
        });
    });
