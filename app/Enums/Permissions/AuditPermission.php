<?php

namespace App\Enums\Permissions;

enum AuditPermission: string
{
    case LogView = 'audit.log.view';
    case PatientAccessView = 'audit.patient-access.view';
}
