<?php

namespace App\Enums\Permissions;

enum PharmacyPermission: string
{
    case DispensingCreate = 'pharmacy.dispensing.create';
    case DispensingVerify = 'pharmacy.dispensing.verify';
    case LabelPrint = 'pharmacy.label.print';
    case PrescriptionView = 'pharmacy.prescription.view';
    case PrescriptionCreate = 'pharmacy.prescription.create';
    case PrescriptionVerify = 'pharmacy.prescription.verify';
    case ReturnCreate = 'pharmacy.return.create';
    case StockView = 'pharmacy.stock.view';
    case StockAdjust = 'pharmacy.stock.adjust';
    case StockOpname = 'pharmacy.stock.opname';
}
