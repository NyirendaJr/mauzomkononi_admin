import { ApiDataTableWithPagination, DataTableToolbar, PageLayout } from '@/components';
import { getModuleSidebar } from '@/data/module-sidebars';
import { categoriesApiService } from '@/services/categoriesApiService';
import { type Module } from '@/types/modules';
import { Head } from '@inertiajs/react';
import { columns } from './components/categories-columns';
import { CategoriesDialogs } from './components/categories-dialogs';
import { CategoriesPrimaryButtons } from './components/categories-primary-buttons';
import CategoriesProvider from './context/categories-context';

interface CategoriesModuleProps {
    module?: Module;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function CategoriesModule({ module, flash }: CategoriesModuleProps) {
    const sidebarData = getModuleSidebar('inventory');

    if (!module || !sidebarData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold">Module Not Found</h1>
                    <p className="text-muted-foreground">The requested module is not available.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={`${module.name} - Categories`} />

            <CategoriesProvider initialFlash={flash}>
                <PageLayout
                    title="Category Management"
                    description="Manage your product categories."
                    primaryButtons={<CategoriesPrimaryButtons />}
                    dialogs={<CategoriesDialogs />}
                    module={module}
                    sidebarData={sidebarData}
                >
                    <ApiDataTableWithPagination
                        columns={columns}
                        apiService={categoriesApiService}
                        searchField="global"
                        filterFields={['parent_id']}
                        toolbar={<DataTableToolbar searchKey="name" searchPlaceholder="Search categories..." />}
                    />
                </PageLayout>
            </CategoriesProvider>
        </>
    );
}
