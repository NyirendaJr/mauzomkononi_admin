import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { brandsApiService } from '@/services/brandsApiService';
import { handleServerError } from '@/utils/handle-server-error';
import { useBrands } from '../context/brands-context';

interface BrandFormData {
    name: string;
    description?: string;
    is_active: boolean;
    image?: FileList;
}

export function BrandsDialogs() {
    return (
        <>
            <CreateBrandDialog />
            <EditBrandDialog />
            <DeleteBrandDialog />
        </>
    );
}

function CreateBrandDialog() {
    const { isCreateDialogOpen, setIsCreateDialogOpen, setSuccessMessage, setErrorMessage, isLoading, setIsLoading } = useBrands();

    const form = useForm<BrandFormData>({
        defaultValues: {
            name: '',
            description: '',
            is_active: true,
        },
    });

    const onSubmit = async (data: BrandFormData) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.description !== undefined) formData.append('description', data.description);
            formData.append('is_active', String(data.is_active ? 1 : 0));
            if (data.image && data.image[0]) {
                formData.append('image', data.image[0]);
            }

            await brandsApiService.createBrand(formData as any);
            toast.success('Brand created successfully');
            setIsCreateDialogOpen(false);
            form.reset();
            // Trigger refetch - this would be handled by the parent component
            window.location.reload();
        } catch (error: any) {
            const errors = handleServerError(error) as Record<string, string[]> | undefined;
            if (errors) {
                console.log(errors);
                // Map server-side field errors to form state
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setError(field as keyof BrandFormData, { type: 'server', message: messages[0] });
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg md:max-w-xl"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetHeader>
                    <SheetTitle>Create New Brand</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active</FormLabel>
                                            <FormDescription>Active brands can be assigned to products.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="mt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Brand'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function EditBrandDialog() {
    const { isEditDialogOpen, setIsEditDialogOpen, editingBrand, setEditingBrand, setSuccessMessage, setErrorMessage, isLoading, setIsLoading } =
        useBrands();

    const form = useForm<BrandFormData>({
        defaultValues: {
            name: '',
            description: '',
            is_active: true,
        },
    });

    // Update form when editing brand changes
    React.useEffect(() => {
        if (editingBrand) {
            form.reset({
                name: editingBrand.name,
                description: editingBrand.description || '',
                is_active: editingBrand.is_active,
            });
        }
    }, [editingBrand, form]);

    const onSubmit = async (data: BrandFormData) => {
        if (!editingBrand) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.description !== undefined) formData.append('description', data.description);
            formData.append('is_active', String(data.is_active ? 1 : 0));
            if (data.image && data.image[0]) {
                formData.append('image', data.image[0]);
            }

            await brandsApiService.updateBrand(editingBrand.id, formData as any);
            toast.success('Brand updated successfully');
            setIsEditDialogOpen(false);
            setEditingBrand(null);
            // Trigger refetch - this would be handled by the parent component
            window.location.reload();
        } catch (error: any) {
            const errors = handleServerError(error) as Record<string, string[]> | undefined;
            if (errors) {
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setError(field as keyof BrandFormData, { type: 'server', message: messages[0] });
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet
            open={isEditDialogOpen}
            onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) setEditingBrand(null);
            }}
        >
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg md:max-w-xl"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetHeader>
                    <SheetTitle>Edit Brand</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Same form fields as CreateBrandDialog */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter brand name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Brief description of the brand" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active</FormLabel>
                                            <FormDescription>Active brands can be assigned to products.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="mt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Brand'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function DeleteBrandDialog() {
    const {
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        editingBrand,
        setEditingBrand,
        selectedBrands,
        setSelectedBrands,
        setSuccessMessage,
        setErrorMessage,
        isLoading,
        setIsLoading,
    } = useBrands();

    const isMultipleDelete = selectedBrands.length > 1;
    const brandToDelete = editingBrand;

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            if (isMultipleDelete) {
                // Delete multiple brands
                await Promise.all(selectedBrands.map((id) => brandsApiService.deleteBrand(id)));
                setSuccessMessage(`${selectedBrands.length} brands deleted successfully`);
                setSelectedBrands([]);
            } else if (brandToDelete) {
                // Delete single brand
                await brandsApiService.deleteBrand(brandToDelete.id);
                setSuccessMessage('Brand deleted successfully');
                setEditingBrand(null);
            }

            setIsDeleteDialogOpen(false);
            // Trigger refetch - this would be handled by the parent component
            window.location.reload();
        } catch (error: any) {
            setErrorMessage(error.response?.data?.error || 'Failed to delete brand(s)');
        } finally {
            setIsLoading(false);
        }
    };

    const getDialogContent = () => {
        if (isMultipleDelete) {
            return {
                title: `Delete ${selectedBrands.length} Brands`,
                description: `Are you sure you want to delete ${selectedBrands.length} selected brands? This action cannot be undone.`,
            };
        } else if (brandToDelete) {
            return {
                title: 'Delete Brand',
                description: `Are you sure you want to delete "${brandToDelete.name}"? This action cannot be undone.`,
            };
        }
        return {
            title: 'Delete Brand',
            description: 'Are you sure you want to delete this brand? This action cannot be undone.',
        };
    };

    const { title, description } = getDialogContent();

    return (
        <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) {
                    setEditingBrand(null);
                    setSelectedBrands([]);
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
