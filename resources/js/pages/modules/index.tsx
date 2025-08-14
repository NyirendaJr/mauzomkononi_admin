import Heading from '@/components/heading';
import { ModulesGrid } from '@/components/modules/modules-grid';
import { getModulesForUser } from '@/data/modules';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head } from '@inertiajs/react';

interface ModulesPageProps {
    userPermissions: {
        permissions: string[];
        [key: string]: any;
    };
    modules?: any; // Backend modules data (not used for grid)
}

export default function ModulesPage({ userPermissions, modules }: ModulesPageProps) {
    // Extract the flat permissions array from the complex userPermissions object
    const permissions = userPermissions?.permissions || [];

    // Always use frontend modules data for the grid
    const availableModules = getModulesForUser(permissions);

    return (
        <>
            <Head title="Modules" />

            <AppHeaderLayout>
                <div className="px-4 py-4">
                    <Heading title="Modules" description="Select a module to get started." />

                    {/* Modules Grid */}
                    <ModulesGrid modules={availableModules} />

                    {/* Empty State */}
                    {availableModules.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                                <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">No Modules Available</h3>
                            <p className="text-muted-foreground">
                                You don't have access to any modules at the moment. Please contact your administrator.
                            </p>
                        </div>
                    )}
                </div>
            </AppHeaderLayout>
        </>
    );
}
