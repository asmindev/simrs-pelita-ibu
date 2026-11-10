import { Calendar, CreditCard, MapPin, Phone, User, X } from 'lucide-react';

import type { PatientSearchResult } from '@/shared/types/patient';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

interface SelectedPatientCardProps {
    patient: PatientSearchResult;
    onClear: () => void;
}

export function SelectedPatientCard({
    patient,
    onClear,
}: SelectedPatientCardProps) {
    const isMale = patient.gender === 'male';

    return (
        <Card className="border-primary/20 bg-primary/5 shadow-xs">
            <CardContent className="p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3.5">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <User className="size-5.5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold text-foreground">
                                    {patient.name}
                                </h3>
                                <Badge
                                    variant="default"
                                    className="font-mono text-xs font-semibold"
                                >
                                    RM: {patient.medical_record_number}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="text-[11px]"
                                >
                                    {isMale ? 'Laki-laki' : 'Perempuan'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground sm:grid-cols-2">
                                <div className="flex items-center gap-1.5 font-mono">
                                    <CreditCard className="size-3.5 text-muted-foreground" />
                                    <span>NIK: {patient.nik || '-'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-muted-foreground" />
                                    <span>Lahir: {patient.birth_date}</span>
                                </div>
                                {patient.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="size-3.5 text-muted-foreground" />
                                        <span>{patient.phone}</span>
                                    </div>
                                )}
                                {patient.address && (
                                    <div className="flex items-center gap-1.5 sm:col-span-2">
                                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="truncate">
                                            {patient.address}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClear}
                        className="h-8 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <X className="mr-1.5 size-3.5" />
                        Ganti Pasien
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
