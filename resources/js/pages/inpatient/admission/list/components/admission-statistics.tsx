import { BedDouble, LogOut, Percent, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type Props = {
    statistics: {
        active_patients: number;
        discharged_today: number;
        available_beds: number;
        bed_occupancy_rate: number;
    };
};

export function AdmissionStatistics({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Pasien Dirawat Aktif
                    </CardTitle>
                    <Users className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.active_patients}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Sedang menempati ruangan
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Bed Kosong (Tersedia)
                    </CardTitle>
                    <BedDouble className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.available_beds}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Siap digunakan untuk admisi
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Bed Occupancy Rate (BOR)
                    </CardTitle>
                    <Percent className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.bed_occupancy_rate}%
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Persentase keterisian tempat tidur
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Pasien Pulang Hari Ini
                    </CardTitle>
                    <LogOut className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.discharged_today}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Selesai perawatan rawat inap
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
