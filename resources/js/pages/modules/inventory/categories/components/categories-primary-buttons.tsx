import { Button } from '@/components/ui/button';
import { useCategories } from '../context/categories-context';
import { Plus, Trash2 } from 'lucide-react';

export function CategoriesPrimaryButtons() {
    
    const { setIsCreateDialogOpen, selectedCategories, setIsDeleteDialogOpen } = useCategories();

    const handleCreateCategory = () => {
        setIsCreateDialogOpen(true);
    };

    const handleDeleteSelected = () => {
        if (selectedCategories.length > 0) {
            setIsDeleteDialogOpen(true);
        }
    };
    
    return (
        <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
            </Button>

            {selectedCategories.length > 0 && (
                <Button variant="destructive" onClick={handleDeleteSelected}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedCategories.length})
                </Button>
            )}
        </div>
    );
}
