import { FileText } from 'lucide-react';

import { formatDateTime } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';

import type { ActivityLog } from '../../../types/audit';

type Props = {
    log: ActivityLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function LogDetailDialog({ log, open, onOpenChange }: Props) {
    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="size-5 text-primary" />
                        Detail Audit Log #{log.id}
                    </DialogTitle>
                    <DialogDescription>
                        Rincian payload perubahan dan metadata aktivitas sistem.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-3">
                        <div>
                            <span className="text-muted-foreground">
                                Pelaku (Causer):
                            </span>
                            <div className="font-semibold text-foreground">
                                {log.causer?.name ?? 'Sistem / Anonim'}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                {log.causer?.email}
                            </div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Waktu:
                            </span>
                            <div className="font-semibold text-foreground">
                                {formatDateTime(log.created_at)}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                Modul: {log.log_name ?? 'default'}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3">
                        <span className="text-muted-foreground">
                            Deskripsi Aktivitas:
                        </span>
                        <div className="mt-1 font-medium text-foreground">
                            {log.description}
                        </div>
                    </div>

                    {log.properties &&
                        Object.keys(log.properties).length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-muted-foreground">
                                    Snapshot Data (Properties / Payload):
                                </span>
                                <pre className="max-h-60 overflow-x-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-[11px] text-foreground">
                                    {JSON.stringify(log.properties, null, 2)}
                                </pre>
                            </div>
                        )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
