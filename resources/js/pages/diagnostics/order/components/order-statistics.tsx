import {
    CheckCircle2,
    FileSpreadsheet,
    Microscope,
    Radiation,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type Props = {
    statistics: {
        total_today: number;
        lab_orders: number;
        radiology_orders: number;
        completed_today: number;
    };
};

export function DiagnosticOrderStatistics({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Total Order Hari Ini
                    </CardTitle>
                    <FileSpreadsheet className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_today}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Permintaan penunjang
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Pemeriksaan Laboratorium
                    </CardTitle>
                    <Microscope className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.lab_orders}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Darah, urine, swab, dll
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Pemeriksaan Radiologi
                    </CardTitle>
                    <Radiation className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.radiology_orders}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Rontgen, USG, CT-Scan
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Hasil Selesai & Rilis
                    </CardTitle>
                    <CheckCircle2 className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        {statistics.completed_today}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Telah diverifikasi
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
