import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Category, categoriesApiService } from '@/services/categoriesApiService';
import { useCategories } from '../context/categories-context';

export const columns: ColumnDef<Category>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Category
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const category = row.original;
            const imageUrl = (category as any).image_url || (category as any).image || '';
            const initial = (category.name || '?').trim().charAt(0).toUpperCase();
            return (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                        {imageUrl ? <AvatarImage src={imageUrl} alt={category.name} /> : <AvatarFallback>{initial}</AvatarFallback>}
                    </Avatar>
                    <div className="font-medium">{category.name}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'parent.name',
        header: 'Parent',
        cell: ({ row }) => {
            const parent = (row.original as any).parent;
            return <div className="text-sm text-muted-foreground">{parent?.name || '-'}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const category = row.original;
            return <CategoryActionsCell category={category} />;
        },
    },
];

function CategoryActionsCell({ category }: { category: Category }) {
    const { setEditingCategory, setIsEditDialogOpen, setIsDeleteDialogOpen } = useCategories();

    // const handleToggleStatus = async () => {
    //     try {
    //         await categoriesApiService.toggleBrandStatus(brand.id);
    //         setSuccessMessage(`Brand ${brand.is_active ? 'deactivated' : 'activated'} successfully`);
    //         // Trigger refetch - this would be handled by the parent component
    //         window.location.reload();
    //     } catch (error) {
    //         setErrorMessage('Failed to toggle brand status');
    //     }
    // };

    const handleEdit = () => {
        setEditingCategory(category);
        setIsEditDialogOpen(true);
    };

    const handleDelete = () => {
        setEditingCategory(category);
        setIsDeleteDialogOpen(true);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem onClick={handleToggleStatus}>
                    {brand.is_active ? (
                        <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Activate
                        </>
                    )}
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
