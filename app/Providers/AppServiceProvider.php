<?php

namespace App\Providers;

use App\Enums\RoleName;
use App\Models\BreakGlassGrant;
use App\Models\Patient;
use App\Models\PatientAccessLog;
use App\Models\Unit;
use App\Models\User;
use App\Policies\BreakGlassGrantPolicy;
use App\Policies\PatientAccessLogPolicy;
use App\Policies\PatientPolicy;
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
        Gate::policy(Patient::class, PatientPolicy::class);
        Gate::policy(PatientAccessLog::class, PatientAccessLogPolicy::class);
        Gate::policy(BreakGlassGrant::class, BreakGlassGrantPolicy::class);

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
