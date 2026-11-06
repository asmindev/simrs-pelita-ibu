<?php

namespace App\Enums\Permissions;

enum MasterDataPermission: string
{
    case DoctorView = 'master-data.doctor.view';
    case DoctorManage = 'master-data.doctor.manage';
    case DrugView = 'master-data.drug.view';
    case DrugManage = 'master-data.drug.manage';
    case PatientView = 'master-data.patient.view';
    case PatientCreate = 'master-data.patient.create';
    case PatientUpdate = 'master-data.patient.update';
    case PatientDelete = 'master-data.patient.delete';
    case PatientMerge = 'master-data.patient.merge';
    case GuarantorView = 'master-data.guarantor.view';
    case GuarantorManage = 'master-data.guarantor.manage';
    case TariffView = 'master-data.tariff.view';
    case TariffManage = 'master-data.tariff.manage';
    case UnitView = 'master-data.unit.view';
    case UnitManage = 'master-data.unit.manage';
}
