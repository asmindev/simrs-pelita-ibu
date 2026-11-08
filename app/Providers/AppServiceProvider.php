<?php

namespace App\Providers;

use App\Enums\RoleName;
use App\Models\Admission;
use App\Models\Assessment;
use App\Models\Bed;
use App\Models\BreakGlassGrant;
use App\Models\ClinicalReport;
use App\Models\DiagnosticOrder;
use App\Models\Doctor;
use App\Models\DrugBatch;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\PatientAccessLog;
use App\Models\Prescription;
use App\Models\Queue;
use App\Models\SensitiveNote;
use App\Models\Unit;
use App\Models\User;
use App\Policies\AdmissionPolicy;
use App\Policies\AssessmentPolicy;
use App\Policies\BedPolicy;
use App\Policies\BreakGlassGrantPolicy;
use App\Policies\ClinicalReportPolicy;
use App\Policies\DiagnosticOrderPolicy;
use App\Policies\DoctorPolicy;
use App\Policies\DrugBatchPolicy;
use App\Policies\EncounterPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\PatientAccessLogPolicy;
use App\Policies\PatientPolicy;
use App\Policies\PrescriptionPolicy;
use App\Policies\QueuePolicy;
use App\Policies\SensitiveNotePolicy;
use App\Policies\UnitPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();
    }

    /**
     * Configure authorization bypasses.
     */
    protected function configureAuthorization(): void
    {
        Gate::policy(Unit::class, UnitPolicy::class);
        Gate::policy(Doctor::class, DoctorPolicy::class);
        Gate::policy(Patient::class, PatientPolicy::class);
        Gate::policy(PatientAccessLog::class, PatientAccessLogPolicy::class);
        Gate::policy(BreakGlassGrant::class, BreakGlassGrantPolicy::class);
        Gate::policy(Encounter::class, EncounterPolicy::class);
        Gate::policy(Queue::class, QueuePolicy::class);
        Gate::policy(Assessment::class, AssessmentPolicy::class);
        Gate::policy(SensitiveNote::class, SensitiveNotePolicy::class);
        Gate::policy(ClinicalReport::class, ClinicalReportPolicy::class);
        Gate::policy(Prescription::class, PrescriptionPolicy::class);
        Gate::policy(DrugBatch::class, DrugBatchPolicy::class);
        Gate::policy(Invoice::class, InvoicePolicy::class);
        Gate::policy(DiagnosticOrder::class, DiagnosticOrderPolicy::class);
        Gate::policy(Bed::class, BedPolicy::class);
        Gate::policy(Admission::class, AdmissionPolicy::class);

        Gate::before(function (?User $user): ?bool {
            return $user?->hasRole(RoleName::SuperAdmin->value) ? true : null;
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
