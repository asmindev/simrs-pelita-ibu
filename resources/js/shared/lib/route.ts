import { usePage } from '@inertiajs/react';
import { route as ziggyRoute } from 'ziggy-js';
import { Ziggy } from '@/ziggy';

declare global {
    // eslint-disable-next-line no-var
    var Ziggy: any;
}

if (typeof globalThis.Ziggy === 'undefined') {
    globalThis.Ziggy = Ziggy;
}

export const route: typeof ziggyRoute = ((
    name?: any,
    params?: any,
    absolute?: any,
    config: any = Ziggy,
) => {
    return ziggyRoute(name, params, absolute, config);
}) as typeof ziggyRoute;

export function resolveCurrentRoute(url?: string): string | undefined {
    if (!url) {
        if (typeof window !== 'undefined') {
            return (ziggyRoute as any)(
                undefined,
                undefined,
                undefined,
                Ziggy,
            ).current() as string | undefined;
        }
        return undefined;
    }

    try {
        const base =
            typeof window !== 'undefined'
                ? window.location.origin
                : Ziggy.url || 'http://localhost';
        const location = new URL(url, base);
        return (ziggyRoute as any)(undefined, undefined, undefined, {
            ...Ziggy,
            location,
        }).current() as string | undefined;
    } catch {
        return undefined;
    }
}

export function useCurrentRoute(): string | undefined {
    const { url } = usePage();
    return resolveCurrentRoute(url);
}
