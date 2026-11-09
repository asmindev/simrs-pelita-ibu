import { ChevronsUpDown, Loader2, Search, UserCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { route } from '@/shared/lib/route';
import { cn } from '@/shared/lib/utils';
import type { PatientSearchResult } from '@/shared/types/patient';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

type Props = {
    value?: PatientSearchResult | null;
    onChange?: (patient: PatientSearchResult | null) => void;
    excludeId?: number;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
    className?: string;
};

export function PatientPicker({
    value = null,
    onChange,
    excludeId,
    placeholder = 'Pilih atau cari pasien (Nama / NIK / No. RM)...',
    disabled = false,
    error,
    label,
    className,
}: Props) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<PatientSearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial load: fetch recent patients if opened with empty search
    useEffect(() => {
        if (!open) return;

        const trimmed = searchQuery.trim();
        setLoading(true);

        const timer = setTimeout(
            () => {
                const params: Record<string, string | number> = {};
                if (trimmed.length > 0) {
                    params.q = trimmed;
                }
                if (excludeId) {
                    params.exclude = excludeId;
                }

                fetch(route('master-data.patients.search', params), {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                })
                    .then((res) => res.json())
                    .then((json: { data?: PatientSearchResult[] }) => {
                        setResults(json.data ?? []);
                    })
                    .catch(() => {
                        setResults([]);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            },
            trimmed.length > 0 ? 300 : 0,
        );

        return () => clearTimeout(timer);
    }, [open, searchQuery, excludeId]);

    function selectPatient(patient: PatientSearchResult) {
        onChange?.(patient);
        setOpen(false);
        setSearchQuery('');
    }

    function clearSelection() {
        onChange?.(null);
        setSearchQuery('');
    }

    return (
        <div className="relative space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-foreground">
                    {label}
                </label>
            )}

            {value ? (
                <Card className="flex items-center justify-between border-border bg-card p-3 shadow-xs">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserCheck className="size-4" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                                    {value.medical_record_number}
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {value.name}
                                </span>
                                <Badge
                                    variant={
                                        value.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-[10px]"
                                >
                                    {value.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                                {value.merged_to_patient_id && (
                                    <Badge
                                        variant="outline"
                                        className="border-destructive text-[10px] text-destructive"
                                    >
                                        Tergabung
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                                <span>NIK: {value.nik ?? '-'}</span>
                                <span>
                                    {value.gender === 'male'
                                        ? 'Laki-laki'
                                        : 'Perempuan'}
                                </span>
                                <span>Tgl Lahir: {value.birth_date}</span>
                                {value.phone && (
                                    <span>Telp: {value.phone}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {!disabled && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearSelection}
                            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-3.5" />
                            Ganti Pasien
                        </Button>
                    )}
                </Card>
            ) : (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            disabled={disabled}
                            className={cn(
                                'h-10 w-full justify-between bg-background px-3 text-xs font-normal',
                                error &&
                                    'border-destructive ring-1 ring-destructive/20',
                                className,
                            )}
                        >
                            <span className="truncate text-muted-foreground">
                                {placeholder}
                            </span>
                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] min-w-[340px] p-2 sm:min-w-[420px]"
                        align="start"
                    >
                        <div className="relative mb-2 flex items-center">
                            <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Ketik nama pasien, NIK, atau nomor RM..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 bg-background pr-8 pl-8 text-xs"
                                autoFocus
                            />
                            {loading ? (
                                <Loader2 className="absolute right-2.5 size-3.5 animate-spin text-muted-foreground" />
                            ) : searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3.5" />
                                </button>
                            ) : null}
                        </div>

                        <div className="max-h-72 space-y-1 overflow-y-auto">
                            {loading && results.length === 0 ? (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                    Memuat daftar pasien...
                                </div>
                            ) : results.length === 0 ? (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                    {searchQuery
                                        ? `Tidak ada pasien yang cocok dengan "${searchQuery}".`
                                        : 'Belum ada data pasien terdaftar.'}
                                </div>
                            ) : (
                                results.map((patient) => (
                                    <button
                                        key={patient.id}
                                        type="button"
                                        onClick={() => selectPatient(patient)}
                                        className="flex w-full items-start justify-between rounded-lg p-2.5 text-left text-xs transition-colors hover:bg-muted"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-primary">
                                                    {
                                                        patient.medical_record_number
                                                    }
                                                </span>
                                                <span className="font-semibold text-foreground">
                                                    {patient.name}
                                                </span>
                                                <Badge
                                                    variant={
                                                        patient.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="h-4 px-1 text-[9px]"
                                                >
                                                    {patient.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-2.5 text-[11px] text-muted-foreground">
                                                <span>
                                                    NIK: {patient.nik || '-'}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {patient.gender === 'male'
                                                        ? 'L'
                                                        : 'P'}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    Lahir: {patient.birth_date}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
