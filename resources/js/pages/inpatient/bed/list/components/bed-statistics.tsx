import { BedDouble, CheckCircle2, Users, Wrench } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type Props = {
    statistics: {
        total_beds: number;
        available_beds: number;
        occupied_beds: number;
        maintenance_beds: number;
    };
};

export function BedStatistics({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Total Tempat Tidur
                    </CardTitle>
                    <BedDouble className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_beds}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Kapasitas seluruh ruangan
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Bed Tersedia (Kosong)
                    </CardTitle>
                    <CheckCircle2 className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.available_beds}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Siap digunakan admisi baru
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Bed Terisi Pasien
                    </CardTitle>
                    <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.occupied_beds}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Pasien aktif rawat inap
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Dalam Perawatan / Rusak
                    </CardTitle>
                    <Wrench className="size-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.maintenance_beds}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Bed sedang diservis / perbaikan
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
