<?php

namespace App\Enums\Permissions;

enum DiagnosticsPermission: string
{
    case CriticalValueReport = 'diagnostics.critical-value.report';
    case ResultView = 'diagnostics.result.view';
    case ResultInput = 'diagnostics.result.input';
    case ResultVerify = 'diagnostics.result.verify';
    case ResultRelease = 'diagnostics.result.release';
    case ResultPrint = 'diagnostics.result.print';
    case OrderView = 'diagnostics.order.view';
    case OrderCreate = 'diagnostics.order.create';
}
