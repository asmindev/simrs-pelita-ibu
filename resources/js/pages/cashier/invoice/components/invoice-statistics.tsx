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
                        Belum diselesaikan kasir
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Tagihan Lunas
                    </CardTitle>
                    <CheckCircle2 className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        {statistics.paid}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Pembayaran telah diterima
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Pendapatan Hari Ini
                    </CardTitle>
                    <DollarSign className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        {formatCurrency(statistics.revenue_today)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Total penerimaan kasir
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
