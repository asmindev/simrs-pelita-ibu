import { usePage } from '@inertiajs/react';
import { route as ziggyRoute } from 'ziggy-js';
import { Ziggy } from '@/ziggy';

declare global {
    // eslint-disable-next-line no-var
    var Ziggy: any;
}

export function getZiggyConfig() {
    if (typeof window !== 'undefined') {
        const liveZiggy = (window as any).Ziggy;
        if (liveZiggy) {
            return {
                ...liveZiggy,
                url: window.location.origin,
            };
        }
        return {
            ...Ziggy,
            url: window.location.origin,
        };
    }
    return Ziggy;
}

if (typeof globalThis.Ziggy === 'undefined') {
    globalThis.Ziggy = Ziggy;
}

export const route: typeof ziggyRoute = ((
    name?: any,
    params?: any,
    absolute: boolean = false,
    config?: any,
) => {
    return ziggyRoute(name, params, absolute, config ?? getZiggyConfig());
}) as typeof ziggyRoute;

export function resolveCurrentRoute(url?: string): string | undefined {
    const activeConfig = getZiggyConfig();

    if (!url) {
        if (typeof window !== 'undefined') {
            return (ziggyRoute as any)(
                undefined,
                undefined,
                undefined,
                activeConfig,
            ).current() as string | undefined;
        }
        return undefined;
    }

    try {
        const base =
            typeof window !== 'undefined'
                ? window.location.origin
                : activeConfig.url || 'http://localhost';
        const location = new URL(url, base);
        return (ziggyRoute as any)(undefined, undefined, undefined, {
            ...activeConfig,
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
