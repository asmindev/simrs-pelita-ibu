import { CheckCircle2, Clock, DollarSign, Receipt } from 'lucide-react';

import { formatCurrency } from '@/shared/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type Props = {
    statistics: {
        total_today: number;
        draft: number;
        paid: number;
        revenue_today: number;
    };
};

export function InvoiceStatistics({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Tagihan Hari Ini
                    </CardTitle>
                    <Receipt className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_today}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Total invoice dibuat
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Menunggu Pembayaran
                    </CardTitle>
                    <Clock className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statistics.draft}</div>
                    <p className="text-[11px] text-muted-foreground">
                        Belum lunas / draft
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Lunas Hari Ini
                    </CardTitle>
                    <CheckCircle2 className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statistics.paid}</div>
                    <p className="text-[11px] text-muted-foreground">
                        Invoice berhasil dibayar
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Penerimaan Kasir
                    </CardTitle>
                    <DollarSign className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="font-mono text-xl font-bold">
                        {formatCurrency(statistics.revenue_today)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Total kas masuk hari ini
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
