<?php

namespace App\Enums\Permissions;

enum InpatientPermission: string
{
    case AdmissionView = 'inpatient.admission.view';
    case AdmissionCreate = 'inpatient.admission.create';
    case BedView = 'inpatient.bed.view';
    case BedAssign = 'inpatient.bed.assign';
    case DailyNoteUpdate = 'inpatient.daily-note.update';
    case DischargeCreate = 'inpatient.discharge.create';
    case TransferCreate = 'inpatient.transfer.create';
}
