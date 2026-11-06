<?php

namespace App\Enums\Permissions;

enum RbacPermission: string
{
    case BreakGlassRequest = 'rbac.break-glass.request';
    case BreakGlassReview = 'rbac.break-glass.review';
    case PermissionView = 'rbac.permission.view';
    case RoleView = 'rbac.role.view';
    case RoleAssign = 'rbac.role.assign';
    case UserView = 'rbac.user.view';
    case UserManage = 'rbac.user.manage';
}
