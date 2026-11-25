import { PrescriptionStatusBadge as SharedPrescriptionStatusBadge } from '@/shared/components/prescription-status-badge';

import type { PrescriptionStatus } from '../../types/pharmacy';

export function PrescriptionStatusBadge({
    status,
}: {
    status: PrescriptionStatus;
}) {
    return <SharedPrescriptionStatusBadge status={status} />;
}
