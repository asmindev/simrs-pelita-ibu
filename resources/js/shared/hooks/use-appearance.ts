import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

function applyTheme(appearance: Appearance) {
    if (typeof window === 'undefined') {
        return;
    }

    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
}

function setCookie(name: string, value: string, days = 365) {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function useAppearance() {
    const pageAppearance =
        usePage<{ appearance?: Appearance }>().props.appearance ?? 'system';
    const [appearance, setAppearance] = useState<Appearance>(pageAppearance);

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        setCookie('appearance', mode);
        applyTheme(mode);
    }, []);

    useEffect(() => {
        applyTheme(appearance);

        if (appearance !== 'system' || typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [appearance]);

    return { appearance, updateAppearance };
}
