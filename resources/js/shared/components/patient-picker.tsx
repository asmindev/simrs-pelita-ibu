import { Loader2, Search, UserCheck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { route } from '@/shared/lib/route';
import type { PatientSearchResult } from '@/shared/types/patient';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

type Props = {
    value?: PatientSearchResult | null;
    onChange?: (patient: PatientSearchResult | null) => void;
    excludeId?: number;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
};

export function PatientPicker({
    value = null,
    onChange,
    excludeId,
    placeholder = 'Cari nama, NIK, atau No. Rekam Medis...',
    disabled = false,
    error,
    label,
}: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PatientSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounced search
    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            const params: Record<string, string | number> = { q: trimmed };
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
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [query, excludeId]);

    function selectPatient(patient: PatientSearchResult) {
        onChange?.(patient);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    }

    function clearSelection() {
        onChange?.(null);
        setQuery('');
        setResults([]);
    }

    return (
        <div ref={containerRef} className="relative space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-foreground">
                    {label}
                </label>
            )}

            {value ? (
                <Card className="flex items-center justify-between border-border bg-card p-3">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <UserCheck className="size-4" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                                    {value.medical_record_number}
                                </span>
                                <span className="font-medium text-foreground">
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
                                <span>Lahir: {value.birth_date}</span>
                            </div>
                        </div>
                    </div>
                    {!disabled && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="mr-1 size-4" />
                            Ganti
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (query.trim().length >= 2) {
                                setIsOpen(true);
                            }
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`pr-9 pl-9 ${error ? 'border-destructive' : ''}`}
                    />
                    {loading && (
                        <Loader2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}

                    {isOpen && query.trim().length >= 2 && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                            {loading && results.length === 0 ? (
                                <div className="p-3 text-center text-xs text-muted-foreground">
                                    Mencari pasien...
                                </div>
                            ) : results.length === 0 ? (
                                <div className="p-3 text-center text-xs text-muted-foreground">
                                    Tidak ada pasien yang sesuai dengan kata
                                    kunci &quot;{query}&quot;.
                                </div>
                            ) : (
                                <ul className="space-y-0.5">
                                    {results.map((patient) => (
                                        <li
                                            key={patient.id}
                                            onClick={() =>
                                                selectPatient(patient)
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' ||
                                                    e.key === ' '
                                                ) {
                                                    selectPatient(patient);
                                                }
                                            }}
                                            tabIndex={0}
                                            className="flex cursor-pointer items-center justify-between rounded px-2.5 py-2 text-sm transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                                                        {
                                                            patient.medical_record_number
                                                        }
                                                    </span>
                                                    <span className="font-medium">
                                                        {patient.name}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            patient.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {patient.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </Badge>
                                                    {patient.merged_to_patient_id && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-destructive text-[10px] text-destructive"
                                                        >
                                                            Tergabung
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>
                                                        NIK:{' '}
                                                        {patient.nik ?? '-'}
                                                    </span>
                                                    <span>
                                                        {patient.gender ===
                                                        'male'
                                                            ? 'Laki-laki'
                                                            : 'Perempuan'}
                                                    </span>
                                                    <span>
                                                        Lahir:{' '}
                                                        {patient.birth_date}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs font-medium text-destructive">{error}</p>
            )}
        </div>
    );
}
