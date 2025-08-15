import { type BaseFilters, type GenericApiService, type PaginatedResponse } from '@/types/api';
import apiClient from './axiosConfig';

export interface Category {
    id: string;
    name: string;
    image?: string;
    image_url?: string;
    parent_id?: string | null;
    parent?: { id: string; name: string } | null;
    created_at: string;
    updated_at: string;
}

class CategoriesApiService implements GenericApiService<Category, BaseFilters> {
    private baseUrl = '/categories';

    async getItems(filters: BaseFilters = {}): Promise<PaginatedResponse<Category>> {
        return this.getCategories(filters);
    }

    async getCategories(filters: Record<string, any> = {}): Promise<{ data: Category[]; meta: any; links: any }> {
        const params = new URLSearchParams();

        // Spatie Query Builder style params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key !== 'sort' && key !== 'page' && key !== 'per_page' && key !== 'include' && key !== 'fields') {
                    params.append(`filter[${key}]`, value.toString());
                } else {
                    params.append(key, value.toString());
                }
            }
        });

        try {
            const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
            return response.data;
        } catch (error) {
            return {
                data: [],
                meta: {
                    current_page: 1,
                    last_page: 1,
                    per_page: filters.per_page || 10,
                    total: 0,
                    from: 0,
                    to: 0,
                    path: `/api${this.baseUrl}`,
                    links: [],
                },
                links: {
                    first: '',
                    last: '',
                    prev: null,
                    next: null,
                },
            };
        }
    }

    async createCategory(data: FormData | Record<string, any>): Promise<Category> {
        const res = await apiClient.post(this.baseUrl, data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        });
        return res.data.data;
    }

    async updateCategory(id: string, data: FormData | Record<string, any>): Promise<Category> {
        const res = await apiClient.post(`${this.baseUrl}/${id}?_method=PUT`, data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        });
        return res.data.data;
    }

    async deleteCategory(id: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }
}

export const categoriesApiService = new CategoriesApiService();
