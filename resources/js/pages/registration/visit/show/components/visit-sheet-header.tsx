import {
    Building2,
    MapPin,
    Phone,
    Pill,
    Receipt,
    Shield,
    Stethoscope,
    Ticket,
} from 'lucide-react';

import { usePermissions } from '@/shared/hooks/use-permissions';
import { formatCurrency } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';

import type { Encounter } from '../../../types/registration';

export type VisitShowTab = 'overview' | 'prescriptions' | 'billing';

type Props = {
    encounter: Encounter;
    activeTab: VisitShowTab;
    onSelectTab: (tab: VisitShowTab) => void;
};

function getInitials(name?: string): string {
    if (!name) return 'PS';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

function getAgeYears(birthDate?: string): string {
    if (!birthDate) return '-';
    const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) return '-';
    const diff = Date.now() - dob.getTime();
    return `${Math.abs(new Date(diff).getUTCFullYear() - 1970)} thn`;
}

function getQueueLabel(status?: string): string {
    switch (status) {
        case 'waiting':
            return 'Menunggu';
        case 'calling':
            return 'Dipanggil';
        case 'serving':
            return 'Dilayani';
        case 'completed':
            return 'Selesai';
        case 'skipped':
            return 'Dilewati';
        case 'cancelled':
            return 'Dibatalkan';
        default:
            return 'Tanpa Antrean';
    }
}

function getInvoiceStatusLabel(status?: string): string {
    switch (status) {
        case 'paid':
            return 'Lunas';
        case 'partially_paid':
            return 'Sebagian';
        case 'finalized':
            return 'Menunggu Bayar';
        case 'void':
            return 'Dibatalkan';
        default:
            return 'Draft Tagihan';
    }
}

export function VisitSheetHeader({ encounter, activeTab, onSelectTab }: Props) {
    const { can } = usePermissions();
    const canViewPrescriptions = can('pharmacy.prescription.view');

    const patient = encounter.patient;
    const isMale = patient?.gender === 'male';
    const activeInvoice = encounter.invoices?.[0];
    const prescriptions = encounter.prescriptions ?? [];

    return (
        <Card className="gap-0 border-border bg-card py-0 shadow-xs">
            <CardContent className="space-y-3 p-3.5">
                {/* Identity & Clinical Assignment Row */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {getInitials(patient?.name)}
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <h1 className="text-base font-bold tracking-tight text-foreground">
                                    {patient?.name ?? 'Pasien'}
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-[11px] font-semibold"
                                >
                                    {patient?.medical_record_number ?? '-'}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="text-[11px]"
                                >
                                    {isMale ? 'Laki-laki' : 'Perempuan'} ·{' '}
                                    {getAgeYears(patient?.birth_date)}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                <span className="font-mono">
                                    NIK: {patient?.nik ?? '-'}
                                </span>
                                {patient?.phone && (
                                    <span className="inline-flex items-center gap-1">
                                        <Phone className="size-3" />
                                        {patient.phone}
                                    </span>
                                )}
                                {patient?.address && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="size-3" />
                                        {patient.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs lg:justify-end">
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-foreground">
                            <Building2 className="size-3 text-primary" />
                            <span>{encounter.unit?.name ?? '-'}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-foreground">
                            <Stethoscope className="size-3 text-primary" />
                            <span>
                                {encounter.doctor?.name ?? 'Dokter Jaga'}
                            </span>
                        </div>
                        <Badge
                            variant={
                                encounter.type === 'emergency'
                                    ? 'destructive'
                                    : 'outline'
                            }
                            className="text-[11px]"
                        >
                            {encounter.type === 'emergency'
                                ? 'IGD'
                                : 'Rawat Jalan'}
                        </Badge>
                    </div>
                </div>

                {/* 4 Interactive Smart Summary Tiles */}
                <div
                    className={cn(
                        'grid grid-cols-2 gap-2 border-t border-border pt-3',
                        canViewPrescriptions
                            ? 'lg:grid-cols-4'
                            : 'lg:grid-cols-3',
                    )}
                >
                    <button
                        type="button"
                        onClick={() => onSelectTab('overview')}
                        className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            activeTab === 'overview'
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border bg-background hover:bg-muted/40',
                        )}
                    >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Ticket className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] font-medium text-muted-foreground">
                                Antrean
                            </div>
                            <div className="truncate font-mono text-xs font-bold text-foreground tabular-nums">
                                {encounter.queue?.queue_code ?? '-'}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                                {getQueueLabel(encounter.queue?.status)}
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('overview')}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background px-2.5 py-2 text-left transition-colors duration-200 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                            <Shield className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] font-medium text-muted-foreground">
                                Penjamin
                            </div>
                            <div className="truncate text-xs font-semibold text-foreground">
                                {encounter.guarantor?.name ?? 'Umum'}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground uppercase">
                                {encounter.guarantor?.type ?? 'General'}
                            </div>
                        </div>
                    </button>

                    {canViewPrescriptions && (
                        <button
                            type="button"
                            onClick={() => onSelectTab('prescriptions')}
                            className={cn(
                                'flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                activeTab === 'prescriptions'
                                    ? 'border-primary/40 bg-primary/5'
                                    : 'border-border bg-background hover:bg-muted/40',
                            )}
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Pill className="size-3.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-medium text-muted-foreground">
                                    Resep Obat
                                </div>
                                <div className="truncate text-xs font-bold text-foreground tabular-nums">
                                    {prescriptions.length} E-Resep
                                </div>
                                <div className="truncate text-[10px] text-muted-foreground">
                                    {prescriptions[0]?.prescription_number ??
                                        'Belum ada resep'}
                                </div>
                            </div>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onSelectTab('billing')}
                        className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            activeTab === 'billing'
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border bg-background hover:bg-muted/40',
                        )}
                    >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                            <Receipt className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] font-medium text-muted-foreground">
                                Tagihan Kasir
                            </div>
                            <div className="truncate font-mono text-xs font-bold text-foreground tabular-nums">
                                {activeInvoice
                                    ? formatCurrency(
                                          Number(activeInvoice.total_amount),
                                      )
                                    : 'Rp 0'}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                                {activeInvoice
                                    ? getInvoiceStatusLabel(
                                          activeInvoice.status,
                                      )
                                    : 'Belum ada tagihan'}
                            </div>
                        </div>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
