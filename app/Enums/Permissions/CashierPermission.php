<?php

namespace App\Enums\Permissions;

enum CashierPermission: string
{
    case InvoiceView = 'cashier.invoice.view';
    case InvoiceCreate = 'cashier.invoice.create';
    case InvoiceFinalize = 'cashier.invoice.finalize';
    case InvoiceVoid = 'cashier.invoice.void';
    case ClaimManage = 'cashier.claim.manage';
    case ReportView = 'cashier.report.view';
    case PaymentCreate = 'cashier.payment.create';
    case RefundCreate = 'cashier.refund.create';
}
