import { useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { FormEvent } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

import type {
    DiagnosticOrder,
    DiagnosticOrderItem,
} from '../../../types/diagnostics';

type Props = {
    order: DiagnosticOrder;
    item?: DiagnosticOrderItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function InputResultDialog({ order, item, open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        diagnostic_order_item_id: item?.id ? String(item.id) : '',
        parameter_name: item?.test_name || '',
        result_value: '',
        reference_range: '',
        unit: '',
        is_critical: false,
        interpretation: '',
        attachment: null as File | null,
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('diagnostics.orders.results.store', order.id), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Input Hasil Pemeriksaan</DialogTitle>
                    <DialogDescription>
                        Masukkan nilai hasil parameter, nilai rujukan, dan
                        unggah berkas penunjang jika ada.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {order.items && order.items.length > 0 && !item && (
                        <div className="space-y-1">
                            <Label htmlFor="res-item-select">
                                Pilih Item Pemeriksaan
                            </Label>
                            <Select
                                value={data.diagnostic_order_item_id}
                                onValueChange={(val) => {
                                    setData('diagnostic_order_item_id', val);
                                    const selected = order.items?.find(
                                        (i) => String(i.id) === val,
                                    );
                                    if (selected) {
                                        setData(
                                            'parameter_name',
                                            selected.test_name,
                                        );
                                    }
                                }}
                            >
                                <SelectTrigger
                                    id="res-item-select"
                                    className="bg-background text-xs"
                                >
                                    <SelectValue placeholder="Pilih tindakan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {order.items.map((i) => (
                                        <SelectItem
                                            key={i.id}
                                            value={String(i.id)}
                                        >
                                            {i.test_name} ({i.status})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="param-name">
                            Nama Parameter / Pemeriksaan{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="param-name"
                            value={data.parameter_name}
                            onChange={(e) =>
                                setData('parameter_name', e.target.value)
                            }
                            placeholder="Contoh: Hemoglobin, Foto Thorax PA..."
                            className="bg-background text-xs"
                            required
                        />
                        {errors.parameter_name && (
                            <p className="text-xs text-destructive">
                                {errors.parameter_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="result-val">
                            Nilai Hasil / Temuan{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="result-val"
                            value={data.result_value}
                            onChange={(e) =>
                                setData('result_value', e.target.value)
                            }
                            placeholder="Contoh: 14.2 atau Tidak tampak infiltrat aktif..."
                            className="bg-background text-xs font-semibold"
                            required
                        />
                        {errors.result_value && (
                            <p className="text-xs text-destructive">
                                {errors.result_value}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="ref-range">Nilai Rujukan</Label>
                            <Input
                                id="ref-range"
                                value={data.reference_range}
                                onChange={(e) =>
                                    setData('reference_range', e.target.value)
                                }
                                placeholder="13.0 - 17.5"
                                className="bg-background text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="res-unit">Satuan</Label>
                            <Input
                                id="res-unit"
                                value={data.unit}
                                onChange={(e) =>
                                    setData('unit', e.target.value)
                                }
                                placeholder="g/dL, /uL, mm/jam..."
                                className="bg-background text-xs"
                            />
                        </div>
                    </div>

                    {/* Nilai Kritis Checkbox */}
                    <div className="flex items-center space-x-2 rounded-md border border-border bg-card p-2.5">
                        <Checkbox
                            id="is-critical"
                            checked={data.is_critical}
                            onCheckedChange={(checked) =>
                                setData('is_critical', Boolean(checked))
                            }
                        />
                        <div className="grid gap-0.5 leading-none">
                            <label
                                htmlFor="is-critical"
                                className="flex cursor-pointer items-center text-xs leading-none font-semibold text-destructive"
                            >
                                <AlertTriangle className="mr-1 size-3" />
                                Nilai Kritis (Critical Value)
                            </label>
                            <p className="text-[11px] text-muted-foreground">
                                Centang jika nilai membahayakan jiwa & butuh
                                penanganan segera.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="res-interp">
                            Interpretasi / Kesimpulan Ekspertise
                        </Label>
                        <Textarea
                            id="res-interp"
                            value={data.interpretation}
                            onChange={(e) =>
                                setData('interpretation', e.target.value)
                            }
                            placeholder="Catatan interpretasi klinis dokter..."
                            className="resize-none bg-background text-xs"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="res-file">
                            Upload Berkas / Foto Hasil (PDF/JPG/PNG max 5MB)
                        </Label>
                        <Input
                            id="res-file"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                                setData(
                                    'attachment',
                                    e.target.files?.[0] || null,
                                )
                            }
                            className="bg-background text-xs"
                        />
                        {errors.attachment && (
                            <p className="text-xs text-destructive">
                                {errors.attachment}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <CheckCircle2 className="mr-1.5 size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Hasil'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
