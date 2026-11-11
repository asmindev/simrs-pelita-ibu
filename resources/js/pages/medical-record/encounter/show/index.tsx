import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckSquare,
    FileText,
    Lock,
    Stethoscope,
} from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

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

export default function EncounterEmrShow({ encounter, doctors }: Props) {
    const diagnosisCount = encounter.diagnoses?.length || 0;
    const procedureCount = encounter.procedures?.length || 0;
    const sensitiveCount = encounter.sensitive_notes?.length || 0;
    const reportCount = encounter.clinical_reports?.length || 0;

    return (
        <div className="space-y-4">
            <Head
                title={`EMR - ${encounter.patient?.name || 'Pasien'} (${encounter.encounter_number}) — SIMRS`}
            />

            {/* Bilah Konteks Pasien Terpilih */}
            <PatientContextBar encounter={encounter} />

            {/* Navigasi Klinis berbasis shadcn Tabs */}
            <Tabs defaultValue="soap" className="space-y-6">
                <div className="border-b border-border pb-px">
                    <TabsList className="h-11 w-full justify-start gap-1 overflow-x-auto bg-muted/40 p-1 text-muted-foreground sm:w-auto">
                        <TabsTrigger
                            value="soap"
                            className="gap-2 px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <Stethoscope className="size-3.5" />
                            <span>Asesmen SOAP</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="diagnoses"
                            className="gap-2 px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <CheckSquare className="size-3.5" />
                            <span>Diagnosis ICD-10</span>
                            {diagnosisCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {diagnosisCount}
                                </Badge>
                            )}
                        </TabsTrigger>

                        <TabsTrigger
                            value="procedures"
                            className="gap-2 px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <Activity className="size-3.5" />
                            <span>Tindakan ICD-9</span>
                            {procedureCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {procedureCount}
                                </Badge>
                            )}
                        </TabsTrigger>

                        <TabsTrigger
                            value="sensitive"
                            className="gap-2 px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <Lock className="size-3.5" />
                            <span>Catatan Sensitif</span>
                            {sensitiveCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {sensitiveCount}
                                </Badge>
                            )}
                        </TabsTrigger>

                        <TabsTrigger
                            value="reports"
                            className="gap-2 px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <FileText className="size-3.5" />
                            <span>Laporan Khusus</span>
                            {reportCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {reportCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Konten Tiap Tab */}
                <TabsContent
                    value="soap"
                    className="m-0 focus-visible:outline-none"
                >
                    <AssessmentForm encounter={encounter} />
                </TabsContent>

                <TabsContent
                    value="diagnoses"
                    className="m-0 focus-visible:outline-none"
                >
                    <DiagnosisEditor encounter={encounter} />
                </TabsContent>

                <TabsContent
                    value="procedures"
                    className="m-0 focus-visible:outline-none"
                >
                    <ProcedureEditor encounter={encounter} doctors={doctors} />
                </TabsContent>

                <TabsContent
                    value="sensitive"
                    className="m-0 focus-visible:outline-none"
                >
                    <SensitiveNoteBox encounter={encounter} />
                </TabsContent>

                <TabsContent
                    value="reports"
                    className="m-0 focus-visible:outline-none"
                >
                    <ReportListTab encounter={encounter} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
