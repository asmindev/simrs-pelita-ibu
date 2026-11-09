export interface DashboardPipeline {
    registration_count: number;
    waiting_consultations: number;
    in_consultations: number;
    pending_prescriptions: number;
    pending_invoices: number;
    pending_diagnostics: number;
    total_beds: number;
    occupied_beds: number;
    bor_percentage: number;
    today_revenue: number;
}

export interface ActionFeedItem {
    id: string;
    category:
        | 'clinical'
        | 'pharmacy'
        | 'cashier'
        | 'diagnostics'
        | 'registration'
        | 'nurse'
        | 'audit';
    badge: string;
    title: string;
    subtitle: string;
    status: string;
    status_label: string;
    time: string;
    timestamp: number;
    action_label: string;
    action_route: string;
    action_icon:
        | 'stethoscope'
        | 'pill'
        | 'wallet'
        | 'microscope'
        | 'ticket'
        | 'bed'
        | 'shield';
}

export interface BedClassSummary {
    class: string;
    class_label: string;
    total: number;
    occupied: number;
    available: number;
    percentage: number;
}

export interface ActiveDoctorItem {
    id: number;
    doctor_name: string;
    specialization: string;
    unit_name: string;
    time_range: string;
    quota: number | null;
}

export interface DashboardAlertItem {
    id: string;
    type: 'warning' | 'critical';
    message: string;
}

export interface FacilitySnapshot {
    beds: {
        total: number;
        occupied: number;
        available: number;
        bor_percentage: number;
        classes: BedClassSummary[];
    };
    active_doctors: ActiveDoctorItem[];
    alerts: DashboardAlertItem[];
}

export interface DashboardPageProps {
    assignedRoles: string[];
    isSuperAdmin: boolean;
    pipeline: DashboardPipeline;
    actionFeed: ActionFeedItem[];
    facilitySnapshot: FacilitySnapshot;
}
