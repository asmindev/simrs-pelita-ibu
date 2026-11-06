<?php

namespace App\Enums\Permissions;

enum RegistrationPermission: string
{
    case QueueView = 'registration.queue.view';
    case QueueCall = 'registration.queue.call';
    case VisitView = 'registration.visit.view';
    case VisitCreate = 'registration.visit.create';
    case VisitUpdate = 'registration.visit.update';
    case VisitCancel = 'registration.visit.cancel';
    case GuarantorManage = 'registration.guarantor.manage';
}
