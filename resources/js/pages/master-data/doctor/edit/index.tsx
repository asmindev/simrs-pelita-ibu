import { Head } from '@inertiajs/react';

import { DoctorForm } from '../components/doctor-form';
import { DoctorScheduleManager } from '../components/doctor-schedule-manager';
import type { Doctor, DoctorSchedule, UnitOption } from '../types/doctor';

type Props = {
    doctor: Doctor;
    schedules: DoctorSchedule[];
    units: UnitOption[];
};

export default function DoctorEdit({ doctor, schedules, units }: Props) {
    return (
        <div className="space-y-4">
            <Head title={`Ubah Dokter — ${doctor.name}`} />
            <DoctorForm doctor={doctor} />
            <DoctorScheduleManager
                doctorId={doctor.id}
                schedules={schedules}
                units={units}
            />
        </div>
    );
}
