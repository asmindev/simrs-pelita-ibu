<?php

namespace App\Policies;

use App\Enums\Permissions\RegistrationPermission;
use App\Enums\QueueStatus;
use App\Models\Queue;
use App\Models\User;

class QueuePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(RegistrationPermission::QueueView->value);
    }

    public function view(User $user, Queue $queue): bool
    {
        if (! $user->can(RegistrationPermission::QueueView->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $queue->unit_id);
    }

    public function call(User $user, Queue $queue): bool
    {
        if (! $user->can(RegistrationPermission::QueueCall->value)) {
            return false;
        }

        if (in_array($queue->status, [QueueStatus::Completed, QueueStatus::Cancelled], true)) {
            return false;
        }

        return $this->canAccessUnit($user, $queue->unit_id);
    }

    public function serve(User $user, Queue $queue): bool
    {
        if (! $user->can(RegistrationPermission::QueueCall->value)) {
            return false;
        }

        if (! in_array($queue->status, [QueueStatus::Calling, QueueStatus::Waiting], true)) {
            return false;
        }

        return $this->canAccessUnit($user, $queue->unit_id);
    }

    public function complete(User $user, Queue $queue): bool
    {
        if (! $user->can(RegistrationPermission::QueueCall->value)) {
            return false;
        }

        if (! in_array($queue->status, [QueueStatus::Serving, QueueStatus::Calling], true)) {
            return false;
        }

        return $this->canAccessUnit($user, $queue->unit_id);
    }

    public function skip(User $user, Queue $queue): bool
    {
        if (! $user->can(RegistrationPermission::QueueCall->value)) {
            return false;
        }

        if (! in_array($queue->status, [QueueStatus::Calling, QueueStatus::Waiting], true)) {
            return false;
        }

        return $this->canAccessUnit($user, $queue->unit_id);
    }

    private function canAccessUnit(User $user, int $unitId): bool
    {
        $assignedUnits = $user->unitIds();

        if (empty($assignedUnits)) {
            return true;
        }

        return in_array($unitId, $assignedUnits, true);
    }
}
