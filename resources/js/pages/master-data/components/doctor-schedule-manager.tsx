import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

import {
    dayLabels,
    dayOptions,
    type DoctorSchedule,
    type DoctorScheduleInput,
    type UnitOption,
} from '../types/doctor';

type Props = {
    doctorId: number;
    schedules: DoctorSchedule[];
    units: UnitOption[];
};

export function DoctorScheduleManager({ doctorId, schedules, units }: Props) {
    const { data, setData, post, processing, errors, reset } =
        useForm<DoctorScheduleInput>({
            unit_id: units[0] ? String(units[0].id) : '',
            day_of_week: '1',
            start_time: '08:00',
            end_time: '12:00',
            quota: '',
        });

    function submit(event: FormEvent) {
        event.preventDefault();

        post(route('master-data.doctors.schedules.store', doctorId), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function remove(schedule: DoctorSchedule) {
        if (
            !window.confirm(
                `Hapus jadwal ${dayLabels[schedule.day_of_week]} ${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)}?`,
            )
        ) {
            return;
        }

        router.delete(
            route('master-data.doctors.schedules.destroy', {
                doctor: doctorId,
                schedule: schedule.id,
            }),
            { preserveScroll: true },
        );
    }

    return (
        <section className="mt-8 max-w-4xl space-y-4">
            <div>
                <h2 className="text-base font-semibold">Jadwal praktik</h2>
                <p className="text-sm text-muted-foreground">
                    Tambahkan jam praktik dokter per unit.
                </p>
            </div>

            {units.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Belum ada unit aktif. Tambahkan unit terlebih dahulu.
                </p>
            ) : (
                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-6"
                >
                    <FormField
                        label="Unit"
                        htmlFor="schedule-unit"
                        error={errors.unit_id}
                    >
                        <Select
                            value={data.unit_id}
                            onValueChange={(value) => setData('unit_id', value)}
                        >
                            <SelectTrigger id="schedule-unit">
                                <SelectValue placeholder="Pilih unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem
                                        key={unit.id}
                                        value={String(unit.id)}
                                    >
                                        {unit.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="Hari"
                        htmlFor="schedule-day"
                        error={errors.day_of_week}
                    >
                        <Select
                            value={data.day_of_week}
                            onValueChange={(value) =>
                                setData('day_of_week', value)
                            }
                        >
                            <SelectTrigger id="schedule-day">
                                <SelectValue placeholder="Pilih hari" />
                            </SelectTrigger>
                            <SelectContent>
                                {dayOptions.map((day) => (
                                    <SelectItem
                                        key={day.value}
                                        value={String(day.value)}
                                    >
                                        {day.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="Mulai"
                        htmlFor="schedule-start"
                        error={errors.start_time}
                    >
                        <Input
                            id="schedule-start"
                            type="time"
                            value={data.start_time}
                            onChange={(event) =>
                                setData('start_time', event.target.value)
                            }
                        />
                    </FormField>

                    <FormField
                        label="Selesai"
                        htmlFor="schedule-end"
                        error={errors.end_time}
                    >
                        <Input
                            id="schedule-end"
                            type="time"
                            value={data.end_time}
                            onChange={(event) =>
                                setData('end_time', event.target.value)
                            }
                        />
                    </FormField>

                    <FormField
                        label="Kuota"
                        htmlFor="schedule-quota"
                        error={errors.quota}
                    >
                        <Input
                            id="schedule-quota"
                            type="number"
                            min={1}
                            max={999}
                            value={data.quota}
                            onChange={(event) =>
                                setData('quota', event.target.value)
                            }
                            placeholder="Opsional"
                        />
                    </FormField>

                    <div className="flex items-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Tambah jadwal'}
                        </Button>
                    </div>
                </form>
            )}

            {schedules.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Belum ada jadwal praktik.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-3 py-2 font-medium">Hari</th>
                                <th className="px-3 py-2 font-medium">Unit</th>
                                <th className="px-3 py-2 font-medium">Jam</th>
                                <th className="px-3 py-2 font-medium">Kuota</th>
                                <th className="px-3 py-2 text-right font-medium">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                <tr
                                    key={schedule.id}
                                    className="border-t hover:bg-muted/30"
                                >
                                    <td className="px-3 py-2">
                                        {dayLabels[schedule.day_of_week]}
                                    </td>
                                    <td className="px-3 py-2">
                                        {schedule.unit.name}
                                    </td>
                                    <td className="px-3 py-2">
                                        {schedule.start_time.slice(0, 5)}–
                                        {schedule.end_time.slice(0, 5)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {schedule.quota ?? '-'}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => remove(schedule)}
                                        >
                                            Hapus
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
