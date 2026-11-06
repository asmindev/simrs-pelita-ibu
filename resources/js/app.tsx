import { createInertiaApp } from '@inertiajs/react';

import AppLayout from '@/shared/layouts/app-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        if (name.startsWith('welcome/') || name.startsWith('auth/')) {
            return null;
        }

        return AppLayout;
    },
    strictMode: true,
    progress: {
        color: '#4B5563',
    },
});
