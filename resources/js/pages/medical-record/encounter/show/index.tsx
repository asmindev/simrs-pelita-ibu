import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    CheckSquare,
    FileText,
    Lock,
    Stethoscope,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/shared/components/page-header';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { EncounterWithEmr } from '../../types/medical-record';
import { AssessmentForm } from '../components/assessment-form';
import { DiagnosisEditor } from '../components/diagnosis-editor';
import { PatientContextBar } from '../components/patient-context-bar';
import { ProcedureEditor } from '../components/procedure-editor';
import { ReportListTab } from '../components/report-list-tab';
import { SensitiveNoteBox } from '../components/sensitive-note-box';

type Props = {
    encounter: EncounterWithEmr;
    doctors: Array<{ id: number; name: string }>;
};

type TabKey = 'soap' | 'diagnoses' | 'procedures' | 'sensitive' | 'reports';

export default function EncounterEmrShow({ encounter, doctors }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('soap');

    const diagnosisCount = encounter.diagnoses?.length || 0;
    const procedureCount = encounter.procedures?.length || 0;
    const sensitiveCount = encounter.sensitive_notes?.length || 0;
    const reportCount = encounter.clinical_reports?.length || 0;

    return (
        <div className="space-y-6">
            <Head
                title={`EMR - ${encounter.patient?.name || 'Pasien'} (${encounter.encounter_number})`}
            />

            <PageHeader
                title="Lembar Kerja Rekam Medis Elektronik"
                description={`Pelayanan rawat ${encounter.unit?.name || ''} • No. Rawat ${encounter.encounter_number}`}
                actions={
                    <Button asChild variant="outline">
                        <Link href={route('medical-record.index')}>
                            <ArrowLeft className="mr-1.5 size-4" />
                            Kembali ke Daftar Pasien
                        </Link>
                    </Button>
                }
            />

            {/* Bilah Konteks Pasien */}
            <PatientContextBar encounter={encounter} />

            {/* Navigasi Tab Klinis */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-2">
                <Button
                    size="sm"
                    variant={activeTab === 'soap' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('soap')}
                    className="gap-1.5"
                >
                    <Stethoscope className="size-4" />
                    Asesmen SOAP
                </Button>

                <Button
                    size="sm"
                    variant={activeTab === 'diagnoses' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('diagnoses')}
                    className="gap-1.5"
                >
                    <CheckSquare className="size-4" />
                    Diagnosis ICD-10
                    {diagnosisCount > 0 && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                            {diagnosisCount}
                        </span>
                    )}
                </Button>

                <Button
                    size="sm"
                    variant={activeTab === 'procedures' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('procedures')}
                    className="gap-1.5"
                >
                    <Activity className="size-4" />
                    Tindakan ICD-9
                    {procedureCount > 0 && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                            {procedureCount}
                        </span>
                    )}
                </Button>

                <Button
                    size="sm"
                    variant={activeTab === 'sensitive' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('sensitive')}
                    className="gap-1.5"
                >
                    <Lock className="size-4" />
                    Catatan Sensitif
                    {sensitiveCount > 0 && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                            {sensitiveCount}
                        </span>
                    )}
                </Button>

                <Button
                    size="sm"
                    variant={activeTab === 'reports' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('reports')}
                    className="gap-1.5"
                >
                    <FileText className="size-4" />
                    Laporan Klinis
                    {reportCount > 0 && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                            {reportCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Isi Tab Aktif */}
            <div>
                {activeTab === 'soap' && (
                    <AssessmentForm encounter={encounter} />
                )}
                {activeTab === 'diagnoses' && (
                    <DiagnosisEditor encounter={encounter} />
                )}
                {activeTab === 'procedures' && (
                    <ProcedureEditor encounter={encounter} doctors={doctors} />
                )}
                {activeTab === 'sensitive' && (
                    <SensitiveNoteBox encounter={encounter} />
                )}
                {activeTab === 'reports' && (
                    <ReportListTab encounter={encounter} />
                )}
            </div>
        </div>
    );
}
