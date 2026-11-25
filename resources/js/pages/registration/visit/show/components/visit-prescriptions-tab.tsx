import { Link } from '@inertiajs/react';
import { ExternalLink, Pill, Stethoscope } from 'lucide-react';

import { Can } from '@/shared/components/can';
import { PrescriptionStatusBadge } from '@/shared/components/prescription-status-badge';
import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

import type { Encounter } from '../../../types/registration';

type Props = {
    encounter: Encounter;
};

export function VisitPrescriptionsTab({ encounter }: Props) {
    const prescriptions = encounter.prescriptions ?? [];

    if (prescriptions.length === 0) {
        return (
            <Card className="gap-0 border-border bg-card py-0 shadow-xs">
                <CardContent className="flex flex-col items-center justify-center gap-2.5 py-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Pill className="size-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            Belum Ada E-Resep
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Belum ada resep obat yang diterbitkan untuk
                            kunjungan ini.
                        </p>
                    </div>
                    {encounter.status === 'in_consultation' && (
                        <Can permission="medical-record.encounter.view">
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs"
                            >
                                <Link
                                    href={route(
                                        'medical-record.encounters.show',
                                        encounter.id,
                                    )}
                                >
                                    <Stethoscope className="size-3.5" />
                                    Tulis E-Resep di EMR
                                </Link>
                            </Button>
                        </Can>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {prescriptions.map((rx) => (
                <Card
                    key={rx.id}
                    className="gap-0 border-border bg-card py-0 shadow-xs"
                >
                    <CardHeader className="border-b border-border px-3.5 py-2 [.border-b]:pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="font-mono text-xs font-bold text-foreground">
                                    {rx.prescription_number}
                                </CardTitle>
                                <PrescriptionStatusBadge status={rx.status} />
                                <span className="text-[11px] text-muted-foreground">
                                    {formatDateTime(rx.created_at)}
                                </span>
                            </div>

                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1.5 text-xs"
                            >
                                <Link
                                    href={route(
                                        'pharmacy.prescriptions.show',
                                        rx.id,
                                    )}
                                >
                                    Buka di Farmasi
                                    <ExternalLink className="size-3" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {rx.notes && (
                            <div className="border-b border-border bg-muted/20 px-3.5 py-1.5 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    Catatan Resep:
                                </span>{' '}
                                {rx.notes}
                            </div>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="h-8 py-1.5 text-xs">
                                        Obat
                                    </TableHead>
                                    <TableHead className="h-8 py-1.5 text-xs">
                                        Dosis & Aturan Pakai
                                    </TableHead>
                                    <TableHead className="h-8 py-1.5 text-right text-xs">
                                        Jumlah
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(rx.items ?? []).map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="py-1.5 text-xs font-medium text-foreground">
                                            {item.product?.name ??
                                                `Obat #${item.product_id}`}
                                            {item.product?.code && (
                                                <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
                                                    {item.product.code}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {item.dosage}
                                            </span>{' '}
                                            · {item.frequency}
                                        </TableCell>
                                        <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums">
                                            {item.quantity}{' '}
                                            {item.product?.unit_of_measure ??
                                                'unit'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
