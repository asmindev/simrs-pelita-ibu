import { useEffect, useState } from 'react';

import { route } from '@/shared/lib/route';

import type { PatientDuplicate } from '../types/patient';

type Params = {
    nik: string;
    name: string;
    birthDate: string;
    excludeId?: number;
};

export function usePatientDuplicates({
    nik,
    name,
    birthDate,
    excludeId,
}: Params) {
    const [duplicates, setDuplicates] = useState<PatientDuplicate[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hasNik = nik.length === 16;
        const hasNameAndBirthDate = name.trim().length >= 3 && birthDate !== '';

        if (!hasNik && !hasNameAndBirthDate) {
            setDuplicates([]);

            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            const params = new URLSearchParams();

            if (hasNik) {
                params.set('nik', nik);
            }

            if (hasNameAndBirthDate) {
                params.set('name', name);
                params.set('birth_date', birthDate);
            }

            if (excludeId) {
                params.set('exclude', String(excludeId));
            }

            setLoading(true);

            fetch(
                `${route('master-data.patients.duplicates')}?${params.toString()}`,
                {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                },
            )
                .then((response) =>
                    response.ok
                        ? response.json()
                        : { data: [] as PatientDuplicate[] },
                )
                .then((data: { data: PatientDuplicate[] }) =>
                    setDuplicates(data.data),
                )
                .catch((error: unknown) => {
                    if (error instanceof Error && error.name === 'AbortError') {
                        return;
                    }

                    setDuplicates([]);
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setLoading(false);
                    }
                });
        }, 400);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [nik, name, birthDate, excludeId]);

    return { duplicates, loading };
}
