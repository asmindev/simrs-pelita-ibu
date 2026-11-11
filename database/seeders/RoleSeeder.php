<?php

namespace Database\Seeders;

use App\Enums\Permissions\AuditPermission;
use App\Enums\Permissions\CashierPermission;
use App\Enums\Permissions\DiagnosticsPermission;
use App\Enums\Permissions\InpatientPermission;
use App\Enums\Permissions\MasterDataPermission;
use App\Enums\Permissions\MedicalRecordPermission;
use App\Enums\Permissions\PharmacyPermission;
use App\Enums\Permissions\RbacPermission;
use App\Enums\Permissions\RegistrationPermission;
use App\Enums\RoleName;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = $this->permissions();

        foreach (RoleName::cases() as $roleName) {
            $role = Role::findOrCreate($roleName->value, 'web');

            $role->syncPermissions($permissions[$roleName->value] ?? []);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function permissions(): array
    {
        $masterDataViews = [
            MasterDataPermission::DoctorView->value,
            MasterDataPermission::DrugView->value,
            MasterDataPermission::PatientView->value,
            MasterDataPermission::GuarantorView->value,
            MasterDataPermission::TariffView->value,
            MasterDataPermission::UnitView->value,
        ];

        return [
            RoleName::Admin->value => [
                ...$masterDataViews,
                MasterDataPermission::DoctorManage->value,
                MasterDataPermission::DrugManage->value,
                MasterDataPermission::PatientCreate->value,
                MasterDataPermission::PatientUpdate->value,
                MasterDataPermission::PatientDelete->value,
                MasterDataPermission::PatientMerge->value,
                MasterDataPermission::GuarantorManage->value,
                MasterDataPermission::TariffManage->value,
                MasterDataPermission::UnitManage->value,
                RbacPermission::UserView->value,
                RbacPermission::RoleView->value,
                RbacPermission::PermissionView->value,
                RbacPermission::SettingManage->value,
                AuditPermission::LogView->value,
            ],
            RoleName::Registration->value => [
                MasterDataPermission::DoctorView->value,
                MasterDataPermission::PatientView->value,
                MasterDataPermission::PatientCreate->value,
                MasterDataPermission::PatientUpdate->value,
                MasterDataPermission::PatientMerge->value,
                MasterDataPermission::GuarantorView->value,
                MasterDataPermission::TariffView->value,
                MasterDataPermission::UnitView->value,
                RegistrationPermission::QueueView->value,
                RegistrationPermission::QueueCall->value,
                RegistrationPermission::VisitView->value,
                RegistrationPermission::VisitCreate->value,
                RegistrationPermission::VisitUpdate->value,
                RegistrationPermission::VisitCancel->value,
                RegistrationPermission::GuarantorManage->value,
            ],
            RoleName::Doctor->value => [
                MasterDataPermission::DoctorView->value,
                MasterDataPermission::DrugView->value,
                MasterDataPermission::PatientView->value,
                MasterDataPermission::TariffView->value,
                MasterDataPermission::UnitView->value,
                RegistrationPermission::VisitView->value,
                MedicalRecordPermission::AssessmentUpdate->value,
                MedicalRecordPermission::DiagnosisManage->value,
                MedicalRecordPermission::EncounterView->value,
                MedicalRecordPermission::EncounterCreate->value,
                MedicalRecordPermission::EncounterUpdate->value,
                MedicalRecordPermission::ResumeExport->value,
                MedicalRecordPermission::ProcedureManage->value,
                MedicalRecordPermission::SensitiveNoteView->value,
                MedicalRecordPermission::SensitiveNoteUpdate->value,
                MedicalRecordPermission::ReportView->value,
                MedicalRecordPermission::ReportManage->value,
                PharmacyPermission::PrescriptionView->value,
                PharmacyPermission::PrescriptionCreate->value,
                DiagnosticsPermission::OrderView->value,
                DiagnosticsPermission::OrderCreate->value,
                DiagnosticsPermission::ResultView->value,
                InpatientPermission::AdmissionView->value,
                InpatientPermission::BedView->value,
                InpatientPermission::DailyNoteUpdate->value,
                InpatientPermission::DischargeCreate->value,
                RbacPermission::BreakGlassRequest->value,
            ],
            RoleName::Nurse->value => [
                MasterDataPermission::PatientView->value,
                MasterDataPermission::UnitView->value,
                RegistrationPermission::VisitView->value,
                RegistrationPermission::VisitUpdate->value,
                MedicalRecordPermission::AssessmentUpdate->value,
                MedicalRecordPermission::EncounterView->value,
                MedicalRecordPermission::EncounterUpdate->value,
                MedicalRecordPermission::ProcedureManage->value,
                MedicalRecordPermission::ReportView->value,
                MedicalRecordPermission::ReportManage->value,
                DiagnosticsPermission::OrderView->value,
                DiagnosticsPermission::OrderCreate->value,
                InpatientPermission::AdmissionView->value,
                InpatientPermission::AdmissionCreate->value,
                InpatientPermission::BedView->value,
                InpatientPermission::BedAssign->value,
                InpatientPermission::DailyNoteUpdate->value,
                InpatientPermission::TransferCreate->value,
                RbacPermission::BreakGlassRequest->value,
            ],
            RoleName::Pharmacist->value => [
                MasterDataPermission::DrugView->value,
                MasterDataPermission::DrugManage->value,
                MasterDataPermission::PatientView->value,
                PharmacyPermission::DispensingCreate->value,
                PharmacyPermission::DispensingVerify->value,
                PharmacyPermission::LabelPrint->value,
                PharmacyPermission::PrescriptionView->value,
                PharmacyPermission::PrescriptionCreate->value,
                PharmacyPermission::PrescriptionVerify->value,
                PharmacyPermission::ReturnCreate->value,
                PharmacyPermission::StockView->value,
                PharmacyPermission::StockAdjust->value,
                PharmacyPermission::StockOpname->value,
            ],
            RoleName::Cashier->value => [
                MasterDataPermission::PatientView->value,
                MasterDataPermission::GuarantorView->value,
                MasterDataPermission::TariffView->value,
                RegistrationPermission::VisitView->value,
                CashierPermission::InvoiceView->value,
                CashierPermission::InvoiceCreate->value,
                CashierPermission::InvoiceFinalize->value,
                CashierPermission::InvoiceVoid->value,
                CashierPermission::PaymentCreate->value,
                CashierPermission::RefundCreate->value,
                CashierPermission::ClaimManage->value,
                CashierPermission::ReportView->value,
            ],
            RoleName::LabAnalyst->value => [
                MasterDataPermission::PatientView->value,
                MasterDataPermission::UnitView->value,
                DiagnosticsPermission::OrderView->value,
                DiagnosticsPermission::ResultView->value,
                DiagnosticsPermission::ResultInput->value,
                DiagnosticsPermission::ResultVerify->value,
                DiagnosticsPermission::ResultRelease->value,
                DiagnosticsPermission::ResultPrint->value,
                DiagnosticsPermission::CriticalValueReport->value,
            ],
            RoleName::Radiographer->value => [
                MasterDataPermission::PatientView->value,
                MasterDataPermission::UnitView->value,
                DiagnosticsPermission::OrderView->value,
                DiagnosticsPermission::ResultView->value,
                DiagnosticsPermission::ResultInput->value,
                DiagnosticsPermission::ResultVerify->value,
                DiagnosticsPermission::ResultRelease->value,
                DiagnosticsPermission::ResultPrint->value,
                DiagnosticsPermission::CriticalValueReport->value,
            ],
            RoleName::Management->value => [
                ...$masterDataViews,
                AuditPermission::LogView->value,
                AuditPermission::PatientAccessView->value,
                RegistrationPermission::QueueView->value,
                RegistrationPermission::VisitView->value,
                MedicalRecordPermission::EncounterView->value,
                PharmacyPermission::StockView->value,
                DiagnosticsPermission::OrderView->value,
                DiagnosticsPermission::ResultView->value,
                InpatientPermission::AdmissionView->value,
                InpatientPermission::BedView->value,
                CashierPermission::ReportView->value,
            ],
            RoleName::Auditor->value => [
                RbacPermission::BreakGlassReview->value,
                RbacPermission::PermissionView->value,
                RbacPermission::RoleView->value,
                AuditPermission::LogView->value,
                AuditPermission::PatientAccessView->value,
            ],
        ];
    }
}
