import { useForm } from '@inertiajs/react';
import { Loader2, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo } from 'react';

import { Combobox, type ComboboxOption } from '@/shared/components/combobox';
import {
    createEmptyPrescriptionItem,
    type PrescribableDrug,
    type PrescriptionDraftItem,
    PrescriptionItemsEditor,
} from '@/shared/components/prescription-items-editor';
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

export type ActiveEncounterOption = {
    id: number;
    encounter_number: string;
    arrived_at?: string;
    patient?: {
        id: number;
        name: string;
        medical_record_number: string;
    } | null;
    unit?: {
        id: number;
        name: string;
        code: string;
    } | null;
    doctor?: {
        id: number;
        name: string;
    } | null;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drugs: PrescribableDrug[];
    activeEncounters: ActiveEncounterOption[];
};

export function CreatePrescriptionDialog({
    open,
    onOpenChange,
    drugs,
    activeEncounters,
}: Props) {
    const encounterOptions: ComboboxOption[] = useMemo(
        () =>
            activeEncounters.map((enc) => {
                const patientName = enc.patient?.name ?? 'Pasien';
                const mrn = enc.patient?.medical_record_number ?? '-';
                const unitName = enc.unit?.name ?? '-';
                const doctorName = enc.doctor?.name ?? 'Dokter Jaga';

                return {
                    value: String(enc.id),
                    label: `${patientName} (${mrn})`,
                    badge: enc.encounter_number,
                    description: `${unitName} · ${doctorName}${enc.arrived_at ? ` · ${formatDateTime(enc.arrived_at)}` : ''}`,
                };
            }),
        [activeEncounters],
    );

    const { data, setData, post, processing, errors, reset } = useForm<{
        encounter_id: string;
        notes: string;
        items: PrescriptionDraftItem[];
    }>({
        encounter_id: '',
        notes: '',
        items: [createEmptyPrescriptionItem()],
    });

    const formErrors = errors as Record<string, string | undefined>;

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('pharmacy.prescriptions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Buat E-Resep Baru</DialogTitle>
                    <DialogDescription>
                        Pilih kunjungan pasien yang sedang dilayani dan susun
                        daftar obat untuk masuk ke antrean telaah farmasi.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="rx-encounter-select">
                            Pasien Sedang Dilayani{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Combobox
                            id="rx-encounter-select"
                            modal
                            options={encounterOptions}
                            value={data.encounter_id}
                            onValueChange={(val) =>
                                setData('encounter_id', val)
                            }
                            placeholder="Pilih pasien yang sedang dilayani..."
                            searchPlaceholder="Cari nama pasien, No. RM, atau No. Kunjungan..."
                            emptyText="Tidak ada kunjungan yang sedang dilayani saat ini."
                        />
                        {errors.encounter_id && (
                            <p className="text-xs text-destructive">
                                {errors.encounter_id}
                            </p>
                        )}
                    </div>

                    <PrescriptionItemsEditor
                        drugs={drugs}
                        items={data.items}
                        onChange={(nextItems) => setData('items', nextItems)}
                        errors={formErrors}
                        modal
                    />

                    <div className="space-y-1.5">
                        <Label htmlFor="pharmacy-rx-notes">
                            Catatan Resep (Opsional)
                        </Label>
                        <Textarea
                            id="pharmacy-rx-notes"
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Catatan instruksi klinis atau alergi pasien..."
                            className="bg-background text-xs"
                        />
                        {errors.notes && (
                            <p className="text-xs text-destructive">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-1.5"
                        >
                            {processing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Send className="size-3.5" />
                            )}
                            {processing ? 'Menyimpan...' : 'Terbitkan E-Resep'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
