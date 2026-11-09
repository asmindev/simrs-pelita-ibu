import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BedDouble,
    Clock,
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

export function DashboardActionFeed({ items }: Props) {
    function renderIcon(icon: ActionFeedItem['action_icon']) {
        switch (icon) {
            case 'stethoscope':
                return <Stethoscope className="size-4 text-primary" />;
            case 'pill':
                return <Pill className="size-4 text-primary" />;
            case 'wallet':
                return <Wallet className="size-4 text-primary" />;
            case 'microscope':
                return <Microscope className="size-4 text-primary" />;
            case 'ticket':
                return <Ticket className="size-4 text-primary" />;
            case 'bed':
                return <BedDouble className="size-4 text-primary" />;
            case 'shield':
                return <Shield className="size-4 text-primary" />;
            default:
                return <FileText className="size-4 text-primary" />;
        }
    }

    return (
        <Card className="flex flex-col border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">
                            Tugas & Pasien Memerlukan Tindakan
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Antrean otomatis disusun sesuai urutan waktu datang
                            dan peran aktif Anda.
                        </CardDescription>
                    </div>
                    {items.length > 0 && (
                        <Badge
                            variant="secondary"
                            className="font-mono text-xs"
                        >
                            {items.length} tugas aktif
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {items.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <Clock className="mb-2 size-8 text-muted-foreground/50" />
                        <div className="text-sm font-medium">
                            Semua Tugas Sudah Selesai
                        </div>
                        <p className="mt-1 max-w-xs text-xs">
                            Tidak ada pasien atau antrean yang sedang menunggu
                            tindakan Anda saat ini.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col justify-between gap-3 p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                                        {renderIcon(item.action_icon)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-foreground">
                                                {item.title}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="border-border text-[10px] text-muted-foreground"
                                            >
                                                {item.badge}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.subtitle}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:flex-col sm:items-end sm:gap-0.5">
                                        <span className="font-medium text-foreground">
                                            {item.status_label}
                                        </span>
                                        <span>Jam {item.time}</span>
                                    </div>
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="default"
                                        className="h-8 gap-1.5 text-xs font-medium"
                                    >
                                        <Link href={item.action_route}>
                                            {item.action_label}
                                            <ArrowRight className="size-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
