import { useForm } from '@inertiajs/react';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';

import { formatDateTime } from '@/shared/lib/format';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

import type { BreakGlassGrant } from '../../../types/rbac';

type Props = {
    grant: BreakGlassGrant | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function BreakGlassReviewDialog({ grant, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        review_notes: grant?.review_notes || '',
    });

    useEffect(() => {
        if (open && grant) {
            setData({
                review_notes: grant.review_notes || '',
            });
        }
    }, [grant, open]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!grant) return;

        post(route('rbac.break-glass.review', grant.id), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    }

    if (!grant) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="size-5 text-primary" />
                        Tinjau Akses Break-Glass
                    </DialogTitle>
                    <DialogDescription>
                        Verifikasi justifikasi klinis atas pembukaan rekam medis
                        darurat.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 rounded-lg border border-border bg-card p-3 text-xs">
                    <div>
                        <span className="text-muted-foreground">Pemohon:</span>{' '}
                        <span className="font-semibold text-foreground">
                            {grant.user?.name}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Pasien:</span>{' '}
                        <span className="font-semibold text-foreground">
                            {grant.patient?.name} (RM:{' '}
                            {grant.patient?.medical_record_number})
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Waktu:</span>{' '}
                        <span className="text-foreground">
                            {formatDateTime(grant.granted_at)} s/d{' '}
                            {formatDateTime(grant.expires_at)}
                        </span>
                    </div>
                    <div className="border-t border-border pt-2">
                        <span className="text-muted-foreground">
                            Alasan Klinis:
                        </span>
                        <p className="mt-1 font-medium text-foreground italic">
                            "{grant.reason}"
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="review-notes">
                            Catatan Audit & Evaluasi
                        </Label>
                        <Textarea
                            id="review-notes"
                            value={data.review_notes}
                            onChange={(e) =>
                                setData('review_notes', e.target.value)
                            }
                            placeholder="Tuliskan catatan hasil verifikasi pemohon dan alasan akses..."
                            className="resize-none bg-background text-xs"
                            rows={3}
                        />
                        {errors.review_notes && (
                            <p className="text-xs text-destructive">
                                {errors.review_notes}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Tutup
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-1.5 size-4" />
                                    Simpan Review
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
