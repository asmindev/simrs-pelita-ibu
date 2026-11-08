import { CheckCircle2, Clock, Pill, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type Props = {
    statistics: {
        total_today: number;
        submitted: number;
        verified: number;
        dispensed: number;
    };
};

export function PrescriptionStatistics({ statistics }: Props) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Resep Hari Ini
                    </CardTitle>
                    <Pill className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {statistics.total_today}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Kunjungan poli & gawat darurat
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Menunggu Verifikasi
                    </CardTitle>
                    <Clock className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {statistics.submitted}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Perlu telaah klinis apoteker
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Siap Dispensing
                    </CardTitle>
                    <ShieldCheck className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {statistics.verified}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Resep siap disiapkan & diserahkan
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Selesai Dispensing
                    </CardTitle>
                    <CheckCircle2 className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {statistics.dispensed}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Obat telah diterima pasien
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
