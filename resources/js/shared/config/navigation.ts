import {
    BedDouble,
    Building2,
    ClipboardList,
    Database,
    FileText,
    FlaskConical,
    Key,
    LayoutDashboard,
    Pill,
    Receipt,
    Settings,
    ShieldAlert,
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
            'master-data.drug.view',
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
            {
                title: 'Obat',
                routeName: 'master-data.drugs.index',
                icon: Pill,
                permission: 'master-data.drug.view',
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
                items: [
                    {
                        title: 'Pendaftaran Baru',
                        routeName: 'registration.visits.create',
                        permission: 'registration.visit.create',
                    },
                    {
                        title: 'Riwayat Kunjungan',
                        routeName: 'registration.visits.index',
                        permission: 'registration.visit.view',
                    },
                    {
                        title: 'Papan Antrean',
                        routeName: 'registration.queues.board',
                        permission: 'registration.queue.view',
                    },
                ],
            },
            {
                title: 'Rekam Medis',
                routeName: 'medical-record.index',
                icon: Stethoscope,
                permission: 'medical-record.encounter.view',
                items: [
                    {
                        title: 'Pemeriksaan EMR',
                        routeName: 'medical-record.index',
                        permission: 'medical-record.encounter.view',
                    },
                    {
                        title: 'Laporan Khusus',
                        routeName: 'medical-record.reports.index',
                        permission: 'medical-record.report.view',
                    },
                ],
            },
            {
                title: 'Rawat Inap',
                routeName: 'inpatient.index',
                icon: BedDouble,
                permission: 'inpatient.admission.view',
                items: [
                    {
                        title: 'Admisi Pasien',
                        routeName: 'inpatient.admissions.index',
                        permission: 'inpatient.admission.view',
                    },
                    {
                        title: 'Ketersediaan Bed',
                        routeName: 'inpatient.beds.index',
                        permission: 'inpatient.bed.view',
                    },
                ],
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
                items: [
                    {
                        title: 'Resep Obat',
                        routeName: 'pharmacy.prescriptions.index',
                        permission: 'pharmacy.prescription.view',
                    },
                    {
                        title: 'Inventaris & Stok',
                        routeName: 'pharmacy.stock.index',
                        permission: 'pharmacy.stock.view',
                    },
                ],
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
                title: 'Pengguna & Staf',
                routeName: 'rbac.users.index',
                icon: Users,
                permission: 'rbac.user.view',
            },
            {
                title: 'Peran & Hak Akses',
                routeName: 'rbac.roles.index',
                icon: Key,
                permission: 'rbac.role.view',
            },
            {
                title: 'Break-Glass',
                routeName: 'rbac.break-glass.index',
                icon: ShieldAlert,
                permission: 'rbac.break-glass.review',
            },
            {
                title: 'Audit Trail',
                routeName: 'audit.index',
                icon: FileText,
                permission: [
                    'audit.log.view',
                    'audit.patient-access.view',
                ] as const,
                items: [
                    {
                        title: 'Log Aktivitas',
                        routeName: 'audit.logs.index',
                        permission: 'audit.log.view',
                    },
                    {
                        title: 'Akses Rekam Medis',
                        routeName: 'audit.patient-access.index',
                        permission: 'audit.patient-access.view',
                    },
                ],
            },
            {
                title: 'Pengaturan Sistem',
                routeName: 'settings.edit',
                icon: Settings,
                permission: 'rbac.setting.manage',
            },
        ],
    },
];
