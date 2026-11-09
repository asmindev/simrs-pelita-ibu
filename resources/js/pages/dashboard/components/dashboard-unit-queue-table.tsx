import { Stethoscope } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type { UnitQueueSummary } from '../types/dashboard';

interface Props {
    items: UnitQueueSummary[];
}

export function DashboardUnitQueueTable({ items }: Props) {
    return (
        <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <Stethoscope className="size-4 text-primary" />
                            Monitoring Antrean & Beban Kerja Poli
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Status antrean pasien rawat jalan dan instalasi
                            gawat darurat hari ini.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {items.length} Poli Aktif
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                        Belum ada aktivitas antrean poli tercatat hari ini.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs">
                                    Unit / Poliklinik
                                </TableHead>
                                <TableHead className="text-xs">
                                    Dokter Bertugas
                                </TableHead>
                                <TableHead className="text-center text-xs">
                                    Menunggu
                                </TableHead>
                                <TableHead className="text-center text-xs">
                                    Dilayani
                                </TableHead>
                                <TableHead className="text-center text-xs">
                                    Selesai
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-xs font-medium text-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <span>{item.unit_name}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                {item.unit_code}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {item.doctor_name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.waiting > 0 ? (
                                            <Badge
                                                variant="secondary"
                                                className="font-mono text-xs font-semibold"
                                            >
                                                {item.waiting}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.serving > 0 ? (
                                            <Badge
                                                variant="default"
                                                className="font-mono text-xs"
                                            >
                                                {item.serving}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                        {item.completed}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                                        {item.total}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
