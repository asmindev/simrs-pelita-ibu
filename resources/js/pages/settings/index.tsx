import { Head } from '@inertiajs/react';

import { SettingForm } from './components/setting-form';
import type { HospitalSetting } from './types/setting';

type Props = {
    setting: HospitalSetting;
};

export default function SettingIndex({ setting }: Props) {
    return (
        <div className="space-y-4">
            <Head title="Pengaturan Sistem & Profil Fasilitas — SIMRS" />
            <SettingForm setting={setting} />
        </div>
    );
}
