import { DashboardAlerts } from './dashboard-alerts';
import { DashboardBedOccupancyCard } from './dashboard-bed-occupancy-card';
import { DashboardDoctorScheduleCard } from './dashboard-doctor-schedule-card';

import type { FacilitySnapshot } from '../types/dashboard';

interface Props {
    snapshot: FacilitySnapshot;
}

export function DashboardFacilitySnapshot({ snapshot }: Props) {
    return (
        <div className="flex flex-col gap-3">
            <DashboardAlerts alerts={snapshot.alerts} />
            <DashboardBedOccupancyCard beds={snapshot.beds} />
            <DashboardDoctorScheduleCard doctors={snapshot.active_doctors} />
        </div>
    );
}
