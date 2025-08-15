import type { Category } from '@/services/categoriesApiService';
import { createContext, useContext, useState } from 'react';

interface CategoriesContextType {
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
    isCreateDialogOpen: boolean;
    setIsCreateDialogOpen: (open: boolean) => void;
    isEditDialogOpen: boolean;
    setIsEditDialogOpen: (open: boolean) => void;
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    editingCategory: Category | null;
    setEditingCategory: (category: Category | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    successMessage: string | null;
    setSuccessMessage: (message: string | null) => void;
    errorMessage: string | null;
    setErrorMessage: (message: string | null) => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function useCategories() {
    const ctx = useContext(CategoriesContext);
    if (!ctx) throw new Error('useCategories must be used within CategoriesProvider');
    return ctx;
}

export default function CategoriesProvider({
    children,
    initialFlash,
}: {
    children: React.ReactNode;
    initialFlash?: { success?: string; error?: string };
    }) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(initialFlash?.error || null);
    const [successMessage, setSuccessMessage] = useState<string | null>(initialFlash?.success || null);

    const value = {
        selectedCategories,
        setSelectedCategories,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        editingCategory,
        setEditingCategory,
        isLoading,
        setIsLoading,
        errorMessage,
        setErrorMessage,
        successMessage,
        setSuccessMessage,
    };

    return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}
