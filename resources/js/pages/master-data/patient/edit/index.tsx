import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, GitMerge, History } from 'lucide-react';
import { useState } from 'react';

import { Can } from '@/shared/components/can';
import { PageHeader } from '@/shared/components/page-header';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import { PatientForm } from '../components/patient-form';
import { PatientMergeDialog } from '../components/patient-merge-dialog';
import type { Patient } from '../types/patient';

type Props = {
    patient: Patient;
};

export default function PatientEdit({ patient }: Props) {
    const [isMergeOpen, setIsMergeOpen] = useState(false);

    return (
        <div className="space-y-6">
            <Head title="Ubah pasien" />
            <PageHeader
                title="Ubah pasien"
                description={`Perbarui data ${patient.name}.`}
                actions={
                    !patient.merged_to_patient_id && (
                        <Can permission="master-data.patient.merge">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsMergeOpen(true)}
                                className="flex items-center gap-1.5"
                            >
                                <GitMerge className="size-4" />
                                Gabungkan Berkas
                            </Button>
                        </Can>
                    )
                }
            />

            {/* Alert if patient was already merged */}
            {patient.merged_to && (
                <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    <p className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="size-4" />
                        Berkas Rekam Medis Telah Digabungkan
                    </p>
                    <p className="text-xs">
                        Berkas ini telah dinonaktifkan dan digabungkan ke{' '}
                        <Link
                            href={route(
                                'master-data.patients.edit',
                                patient.merged_to.id,
                            )}
                            className="font-medium underline underline-offset-4"
                        >
                            {patient.merged_to.name} (
                            {patient.merged_to.medical_record_number})
                        </Link>
                        {patient.merged_at &&
                            ` pada ${patient.merged_at.slice(0, 10)}`}
                        .
                    </p>
                </div>
            )}

            {/* Info card if other patients were merged into this patient */}
            {patient.merged_from && patient.merged_from.length > 0 && (
                <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                        <History className="size-3.5 text-primary" />
                        Riwayat Berkas yang Digabungkan ke Pasien Ini:
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                        {patient.merged_from.map((from) => (
                            <li key={from.id}>
                                <span className="font-mono font-medium text-foreground">
                                    {from.medical_record_number}
                                </span>{' '}
                                — {from.name}{' '}
                                <span className="text-muted-foreground">
                                    (digabungkan pada{' '}
                                    {from.merged_at.slice(0, 10)})
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <PatientForm patient={patient} />

            {!patient.merged_to_patient_id && (
                <PatientMergeDialog
                    sourcePatient={patient}
                    open={isMergeOpen}
                    onOpenChange={setIsMergeOpen}
                />
            )}
        </div>
    );
}
