import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, MoreHorizontal, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Brand, brandsApiService } from '@/services/brandsApiService';
import { useBrands } from '../context/brands-context';

export const columns: ColumnDef<Brand>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Brand Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const brand = row.original;
            const imageUrl = (brand as any).image_url || (brand as any).image || '';
            const initial = (brand.name || '?').trim().charAt(0).toUpperCase();
            return (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                        {imageUrl ? (
                            <AvatarImage src={imageUrl} alt={brand.name} />
                        ) : (
                            <AvatarFallback className="text-xs font-semibold">{initial}</AvatarFallback>
                        )}
                    </Avatar>
                    <div className="font-medium">{brand.name}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
            const description = row.getValue('description') as string;
            return <div className="max-w-xs truncate">{description || '-'}</div>;
        },
    },
    {
        accessorKey: 'is_active',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean;
            return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
        },
    },
    {
        accessorKey: 'warehouse.name',
        header: 'Warehouse',
        cell: ({ row }) => {
            const warehouse = row.original.warehouse;
            return <div className="font-medium">{warehouse.name}</div>;
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = row.getValue('created_at') as string;
            return <div>{new Date(date).toLocaleDateString()}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const brand = row.original;
            return <BrandActionsCell brand={brand} />;
        },
    },
];

function BrandActionsCell({ brand }: { brand: Brand }) {
    const { setEditingBrand, setIsEditDialogOpen, setIsDeleteDialogOpen, setErrorMessage, setSuccessMessage } = useBrands();

    const handleToggleStatus = async () => {
        try {
            await brandsApiService.toggleBrandStatus(brand.id);
            setSuccessMessage(`Brand ${brand.is_active ? 'deactivated' : 'activated'} successfully`);
            // Trigger refetch - this would be handled by the parent component
            window.location.reload();
        } catch (error) {
            setErrorMessage('Failed to toggle brand status');
        }
    };

    const handleEdit = () => {
        setEditingBrand(brand);
        setIsEditDialogOpen(true);
    };

    const handleDelete = () => {
        setEditingBrand(brand);
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(brand.id)}>Copy brand ID</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStatus}>
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
                </DropdownMenuItem>
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
