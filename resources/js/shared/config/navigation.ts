import type { NavItem } from '@/shared/types/navigation';

export const navigation: NavItem[] = [
    {
        title: 'Master Data',
        routeName: 'master-data.index',
        permission: 'master-data.patient.view',
    },
    {
        title: 'Pendaftaran',
        routeName: 'registration.index',
        permission: 'registration.visit.view',
    },
    {
        title: 'Rekam Medis',
        routeName: 'medical-record.index',
        permission: 'medical-record.encounter.view',
    },
    {
        title: 'Farmasi',
        routeName: 'pharmacy.index',
        permission: 'pharmacy.prescription.view',
    },
    {
        title: 'Kasir',
        routeName: 'cashier.index',
        permission: 'cashier.invoice.view',
    },
    {
        title: 'Penunjang',
        routeName: 'diagnostics.index',
        permission: 'diagnostics.order.view',
    },
    {
        title: 'Rawat Inap',
        routeName: 'inpatient.index',
        permission: 'inpatient.admission.view',
    },
    {
        title: 'RBAC',
        routeName: 'rbac.index',
        permission: 'rbac.user.view',
    },
];
