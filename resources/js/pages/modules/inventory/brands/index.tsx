import { ApiDataTableWithPagination, DataTableToolbar, PageLayout } from '@/components';
import { getModuleSidebar } from '@/data/module-sidebars';
import { brandsApiService } from '@/services/brandsApiService';
import { type Module } from '@/types/modules';
import { Head } from '@inertiajs/react';
import { columns } from './components/brands-columns';
import { BrandsDialogs } from './components/brands-dialogs';
import { BrandsPrimaryButtons } from './components/brands-primary-buttons';
import BrandsProvider from './context/brands-context';

interface BrandsModuleProps {
    module?: Module;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function BrandsModule({ module, flash }: BrandsModuleProps) {
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
            <Head title={`${module.name} - Brands`} />

            <BrandsProvider initialFlash={flash}>
                <PageLayout
                    title="Brand Management"
                    description="Manage your product brands."
                    primaryButtons={<BrandsPrimaryButtons />}
                    dialogs={<BrandsDialogs />}
                    module={module}
                    sidebarData={sidebarData}
                >
                    <ApiDataTableWithPagination
                        columns={columns}
                        apiService={brandsApiService}
                        searchField="global"
                        filterFields={['is_active']}
                        toolbar={
                            <DataTableToolbar
                                searchKey="name"
                                searchPlaceholder="Search brands..."
                                filters={[
                                    {
                                        column: 'is_active',
                                        title: 'Status',
                                        options: [
                                            { label: 'Active', value: 'true' },
                                            { label: 'Inactive', value: 'false' },
                                        ],
                                    },
                                ]}
                            />
                        }
                    />
                </PageLayout>
            </BrandsProvider>
        </>
    );
}
