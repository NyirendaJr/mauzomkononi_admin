import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { categoriesApiService } from '@/services/categoriesApiService';
import { handleServerError } from '@/utils/handle-server-error';
import { useCategories } from '../context/categories-context';
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

interface CategoryFormData {
    name: string;
    image?: FileList;
    parent_id?: string | null;
}

export function CategoriesDialogs() {
    return (
        <>
            <CreateCategoryDialog />
            <EditCategoryDialog />
            <DeleteCategoryDialog />
        </>
    );
}

function CreateCategoryDialog() {
    const { isCreateDialogOpen, setIsCreateDialogOpen, isLoading, setIsLoading } = useCategories();

    const form = useForm<CategoryFormData>({
        defaultValues: { name: '' },
    });

    const onSubmit = async (data: CategoryFormData) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.image && data.image[0]) formData.append('image', data.image[0]);
            if (data.parent_id) formData.append('parent_id', data.parent_id);

            await categoriesApiService.createCategory(formData as any);
            toast.success('Category created successfully');
            setIsCreateDialogOpen(false);
            form.reset();
            window.location.reload();
        } catch (error) {
            const errors = handleServerError(error) as Record<string, string[]> | undefined;
            if (errors) {
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setError(field as keyof CategoryFormData, { type: 'server', message: messages[0] });
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
                    <SheetTitle>Create New Category</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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

                            <div className="mt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function EditCategoryDialog() {
    const { isEditDialogOpen, setIsEditDialogOpen, editingCategory, setEditingCategory, isLoading, setIsLoading } = useCategories();

    const form = useForm<CategoryFormData>({ defaultValues: { name: '' } });

    React.useEffect(() => {
        if (editingCategory) {
            form.reset({ name: editingCategory.name });
        }
    }, [editingCategory, form]);

    const onSubmit = async (data: CategoryFormData) => {
        if (!editingCategory) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.image && data.image[0]) formData.append('image', data.image[0]);
            if (data.parent_id) formData.append('parent_id', data.parent_id);

            await categoriesApiService.updateCategory(editingCategory.id, formData as any);
            toast.success('Category updated successfully');
            setIsEditDialogOpen(false);
            setEditingCategory(null);
            window.location.reload();
        } catch (error) {
            const errors = handleServerError(error) as Record<string, string[]> | undefined;
            if (errors) {
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setError(field as keyof CategoryFormData, { type: 'server', message: messages[0] });
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
                if (!open) setEditingCategory(null);
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
                    <SheetTitle>Edit Category</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter category name" {...field} />
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

                            <div className="mt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Category'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function DeleteCategoryDialog() {
    const {
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        editingCategory,
        setEditingCategory,
        selectedCategories,
        setSelectedCategories,
        isLoading,
        setIsLoading,
        setSuccessMessage,
        setErrorMessage,
    } = useCategories();

    const isMultipleDelete = selectedCategories.length > 1;
    const categoryToDelete = editingCategory;

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            if (isMultipleDelete) {
                // Delete multiple brands
                await Promise.all(selectedCategories.map((id) => categoriesApiService.deleteCategory(id)));
                setSuccessMessage(`${selectedCategories.length} categories deleted successfully`);
                setSelectedCategories([]);
            } else if (categoryToDelete) {
                // Delete single category
                await categoriesApiService.deleteCategory(categoryToDelete.id);
                setSuccessMessage('Category deleted successfully');
                setEditingCategory(null);
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
                title: `Delete ${selectedCategories.length} Categories`,
                description: `Are you sure you want to delete ${selectedCategories.length} selected categories? This action cannot be undone.`,
            };
        } else if (categoryToDelete) {
            return {
                title: 'Delete Category',
                description: `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`,
            };
        }
        return {
            title: 'Delete Category',
            description: 'Are you sure you want to delete this category? This action cannot be undone.',
        };
    };

    const { title, description } = getDialogContent();

    return (
        <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) {
                    setEditingCategory(null);
                    setSelectedCategories([]);
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