import '../css/app.css';
import './assets/index.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { FontProvider } from './context/font-context';

import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <FontProvider>
                <App {...props} />
                <Toaster
                    theme="light"
                    closeButton
                    toastOptions={{
                        classNames: {
                            toast: 'bg-background text-foreground border border-border',
                            success: 'bg-background text-foreground',
                            error: 'bg-background text-foreground',
                            warning: 'bg-background text-foreground',
                            info: 'bg-background text-foreground',
                            title: 'text-foreground font-medium',
                            description: 'text-muted-foreground',
                            actionButton: 'bg-primary text-primary-foreground hover:opacity-90',
                            cancelButton: 'bg-muted text-foreground',
                            closeButton: 'text-muted-foreground',
                        },
                    }}
                />
            </FontProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
