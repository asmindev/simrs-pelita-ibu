<?php

namespace App\Enums;

enum RoleName: string
{
    case SuperAdmin = 'super-admin';
    case Admin = 'admin';
    case Registration = 'registration';
    case Doctor = 'doctor';
    case Nurse = 'nurse';
    case Pharmacist = 'pharmacist';
    case Cashier = 'cashier';
    case LabAnalyst = 'lab-analyst';
    case Radiographer = 'radiographer';
    case Management = 'management';
    case Auditor = 'auditor';
}
