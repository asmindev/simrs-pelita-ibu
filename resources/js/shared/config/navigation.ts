import {
    BedDouble,
    Building2,
    ClipboardList,
    Database,
    FlaskConical,
    LayoutDashboard,
    Pill,
    Receipt,
    ShieldCheck,
    Stethoscope,
    Users,
} from 'lucide-react';

import type { NavItem, NavSection } from '@/shared/types/navigation';

export const navigation: NavItem[] = [
    {
        title: 'Dashboard',
        routeName: 'dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Master Data',
        routeName: 'master-data.index',
        icon: Database,
        permission: [
            'master-data.patient.view',
            'master-data.doctor.view',
            'master-data.unit.view',
            'master-data.guarantor.view',
            'master-data.tariff.view',
        ] as const,
    },
    {
        title: 'Pendaftaran',
        routeName: 'registration.index',
        icon: ClipboardList,
        permission: 'registration.visit.view',
    },
    {
        title: 'Rekam Medis',
        routeName: 'medical-record.index',
        icon: Stethoscope,
        permission: 'medical-record.encounter.view',
    },
    {
        title: 'Farmasi',
        routeName: 'pharmacy.index',
        icon: Pill,
        permission: 'pharmacy.prescription.view',
    },
    {
        title: 'Kasir',
        routeName: 'cashier.index',
        icon: Receipt,
        permission: 'cashier.invoice.view',
    },
    {
        title: 'Penunjang',
        routeName: 'diagnostics.index',
        icon: FlaskConical,
        permission: 'diagnostics.order.view',
    },
    {
        title: 'Rawat Inap',
        routeName: 'inpatient.index',
        icon: BedDouble,
        permission: 'inpatient.admission.view',
    },
    {
        title: 'RBAC',
        routeName: 'rbac.index',
        icon: ShieldCheck,
        permission: 'rbac.user.view',
    },
];

export const navigationSections: NavSection[] = [
    {
        label: 'Utama',
        items: [
            {
                title: 'Dashboard',
                routeName: 'dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: 'Master Data',
        items: [
            {
                title: 'Pasien',
                routeName: 'master-data.patients.index',
                icon: Users,
                permission: 'master-data.patient.view',
            },
            {
                title: 'Dokter',
                routeName: 'master-data.doctors.index',
                icon: Stethoscope,
                permission: 'master-data.doctor.view',
            },
            {
                title: 'Unit',
                routeName: 'master-data.units.index',
                icon: Building2,
                permission: 'master-data.unit.view',
            },
            {
                title: 'Penjamin',
                routeName: 'master-data.guarantors.index',
                icon: ShieldCheck,
                permission: 'master-data.guarantor.view',
            },
            {
                title: 'Tarif & Layanan',
                routeName: 'master-data.tariffs.index',
                icon: Receipt,
                permission: 'master-data.tariff.view',
            },
        ],
    },
    {
        label: 'Pelayanan',
        items: [
            {
                title: 'Pendaftaran',
                routeName: 'registration.index',
                icon: ClipboardList,
                permission: 'registration.visit.view',
            },
            {
                title: 'Rekam Medis',
                routeName: 'medical-record.index',
                icon: Stethoscope,
                permission: 'medical-record.encounter.view',
            },
            {
                title: 'Rawat Inap',
                routeName: 'inpatient.index',
                icon: BedDouble,
                permission: 'inpatient.admission.view',
            },
        ],
    },
    {
        label: 'Operasional',
        items: [
            {
                title: 'Farmasi',
                routeName: 'pharmacy.index',
                icon: Pill,
                permission: 'pharmacy.prescription.view',
            },
            {
                title: 'Kasir',
                routeName: 'cashier.index',
                icon: Receipt,
                permission: 'cashier.invoice.view',
            },
            {
                title: 'Penunjang',
                routeName: 'diagnostics.index',
                icon: FlaskConical,
                permission: 'diagnostics.order.view',
            },
        ],
    },
    {
        label: 'Administrasi',
        items: [
            {
                title: 'RBAC',
                routeName: 'rbac.index',
                icon: ShieldCheck,
                permission: 'rbac.user.view',
            },
        ],
    },
];
