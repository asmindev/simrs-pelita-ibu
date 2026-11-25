import { Head } from '@inertiajs/react';
import { ClipboardList, Pill, Receipt } from 'lucide-react';
import { useState } from 'react';

import { usePermissions } from '@/shared/hooks/use-permissions';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import type { Encounter } from '../../types/registration';
import { CancelVisitDialog } from './components/cancel-visit-dialog';
import { VisitBillingTab } from './components/visit-billing-tab';
import { VisitControlBar } from './components/visit-control-bar';
import { VisitOverviewTab } from './components/visit-overview-tab';
import { VisitPrescriptionsTab } from './components/visit-prescriptions-tab';
import {
    VisitSheetHeader,
    type VisitShowTab,
} from './components/visit-sheet-header';

type Props = {
    encounter: Encounter;
};

export default function EncounterShow({ encounter }: Props) {
    const { can } = usePermissions();
    const canViewPrescriptions = can('pharmacy.prescription.view');

    const [activeTab, setActiveTab] = useState<VisitShowTab>('overview');
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    const prescriptionsCount = encounter.prescriptions?.length ?? 0;
    const invoicesCount = encounter.invoices?.length ?? 0;

    return (
        <div className="space-y-3">
            <Head
                title={`Kunjungan ${encounter.encounter_number} — ${encounter.patient?.name ?? 'SIMRS'}`}
            />

            <VisitControlBar
                encounter={encounter}
                onOpenCancel={() => setIsCancelOpen(true)}
            />

            <VisitSheetHeader
                encounter={encounter}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
            />

            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as VisitShowTab)}
                className="space-y-3"
            >
                <TabsList className="h-9 w-full justify-start gap-1 overflow-x-auto bg-muted/50 p-1 sm:w-auto">
                    <TabsTrigger
                        value="overview"
                        className="h-7 cursor-pointer gap-1.5 px-2.5 text-xs font-medium"
                    >
                        <ClipboardList className="size-3.5" />
                        <span>Ringkasan</span>
                    </TabsTrigger>

                    {canViewPrescriptions && (
                        <TabsTrigger
                            value="prescriptions"
                            className="h-7 cursor-pointer gap-1.5 px-2.5 text-xs font-medium"
                        >
                            <Pill className="size-3.5" />
                            <span>Resep Obat</span>
                            {prescriptionsCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 font-mono text-[10px]"
                                >
                                    {prescriptionsCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    )}

                    <TabsTrigger
                        value="billing"
                        className="h-7 cursor-pointer gap-1.5 px-2.5 text-xs font-medium"
                    >
                        <Receipt className="size-3.5" />
                        <span>Tagihan & Kasir</span>
                        {invoicesCount > 0 && (
                            <Badge
                                variant="secondary"
                                className="px-1.5 py-0 font-mono text-[10px]"
                            >
                                {invoicesCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="m-0">
                    <VisitOverviewTab encounter={encounter} />
                </TabsContent>

                {canViewPrescriptions && (
                    <TabsContent value="prescriptions" className="m-0">
                        <VisitPrescriptionsTab encounter={encounter} />
                    </TabsContent>
                )}

                <TabsContent value="billing" className="m-0">
                    <VisitBillingTab encounter={encounter} />
                </TabsContent>
            </Tabs>

            <CancelVisitDialog
                encounterId={encounter.id}
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
            />
        </div>
    );
}
