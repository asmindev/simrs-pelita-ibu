import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BedDouble,
    CheckCircle2,
    ClipboardList,
    FileText,
    Microscope,
    Pill,
    Shield,
    Stethoscope,
    Ticket,
    Wallet,
} from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';

import type { ActionFeedItem } from '../types/dashboard';

interface Props {
    items: ActionFeedItem[];
}

function renderIcon(icon: ActionFeedItem['action_icon']) {
    switch (icon) {
        case 'stethoscope':
            return <Stethoscope className="size-4" />;
        case 'pill':
            return <Pill className="size-4" />;
        case 'wallet':
            return <Wallet className="size-4" />;
        case 'microscope':
            return <Microscope className="size-4" />;
        case 'ticket':
            return <Ticket className="size-4" />;
        case 'bed':
            return <BedDouble className="size-4" />;
        case 'shield':
            return <Shield className="size-4" />;
        default:
            return <FileText className="size-4" />;
    }
}

export function DashboardActionFeed({ items }: Props) {
    return (
        <Card
            size="sm"
            className="h-full gap-0 py-0 [--card-spacing:--spacing(2.5)]"
        >
            <CardHeader className="border-b border-border/60 px-3.5 pt-2.5">
                <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ClipboardList className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold">
                                Tugas & Pasien Perlu Tindakan
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Antrean disusun otomatis sesuai waktu datang dan
                                peran aktif Anda.
                            </CardDescription>
                        </div>
                    </div>

                    {items.length > 0 && (
                        <Badge
                            variant="secondary"
                            className="shrink-0 font-mono text-xs"
                        >
                            {items.length} aktif
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-8 text-center">
                        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <CheckCircle2 className="size-4.5" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            Semua tugas sudah selesai
                        </p>
                        <p className="max-w-xs text-xs text-muted-foreground">
                            Tidak ada pasien atau antrean yang sedang menunggu
                            tindakan Anda saat ini.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group flex items-center gap-2.5 px-3.5 py-2 transition-colors hover:bg-muted/40"
                            >
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                                    {renderIcon(item.action_icon)}
                                </div>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="truncate text-sm font-medium text-foreground">
                                            {item.title}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="h-4 border-border px-1.5 text-[10px] font-normal text-muted-foreground"
                                        >
                                            {item.badge}
                                        </Badge>
                                    </div>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {item.subtitle}
                                    </p>
                                </div>

                                <div className="hidden shrink-0 flex-col items-end gap-0.5 text-right sm:flex">
                                    <span className="text-xs font-medium text-foreground">
                                        {item.status_label}
                                    </span>
                                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                                        {item.time}
                                    </span>
                                </div>

                                <Button
                                    asChild
                                    size="sm"
                                    variant="secondary"
                                    className="shrink-0 gap-1.5 text-xs"
                                >
                                    <Link href={item.action_route}>
                                        <span className="hidden sm:inline">
                                            {item.action_label}
                                        </span>
                                        <ArrowUpRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
