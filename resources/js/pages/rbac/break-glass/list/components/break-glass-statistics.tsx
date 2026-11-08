import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type Props = {
    statistics: {
        total_grants: number;
        active_grants: number;
        pending_review: number;
        reviewed_grants: number;
    };
};

export function BreakGlassStatistics({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Total Permintaan
                    </CardTitle>
                    <ShieldAlert className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_grants}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Semua akses darurat
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Sedang Aktif
                    </CardTitle>
                    <Clock className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        {statistics.active_grants}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Sesi belum kadaluarsa
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Perlu Review
                    </CardTitle>
                    <AlertCircle className="size-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                        {statistics.pending_review}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Belum diverifikasi auditor
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Telah Ditinjau
                    </CardTitle>
                    <CheckCircle2 className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.reviewed_grants}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Selesai diaudit
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
