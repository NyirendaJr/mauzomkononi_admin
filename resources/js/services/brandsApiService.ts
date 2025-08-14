import { type BaseFilters, type GenericApiService, type PaginatedResponse } from '@/types/api';
import apiClient from './axiosConfig';

export interface Brand {
    id: string;
    name: string;
    description?: string;
    image?: string;
    image_url?: string;
    is_active: boolean;
    warehouse_id: string;
    warehouse: {
        id: string;
        name: string;
        code: string;
    };
    products_count?: number;
    created_at: string;
    updated_at: string;
}

export interface BrandFilters extends BaseFilters {
    name?: string;
    is_active?: boolean;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    path: string;
    links: any[];
}

export interface BrandsResponse {
    data: Brand[];
    meta: PaginationMeta;
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface CreateBrandData {
    name: string;
    description?: string;
    is_active?: boolean;
}

export interface UpdateBrandData extends Partial<CreateBrandData> {}

class BrandsApiService implements GenericApiService<Brand, BrandFilters> {
    private baseUrl = '/brands';

    /**
     * Get paginated brands with filters (implements GenericApiService)
     */
    async getItems(filters: BrandFilters = {}): Promise<PaginatedResponse<Brand>> {
        return this.getBrands(filters);
    }

    async getBrands(filters: BrandFilters = {}): Promise<BrandsResponse> {
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

    async getAllBrands(): Promise<Brand[]> {
        const response = await apiClient.get(`${this.baseUrl}/all`);
        return response.data.data;
    }

    async getBrand(id: string): Promise<Brand> {
        const response = await apiClient.get(`${this.baseUrl}/${id}`);
        return response.data.data;
    }

    async createBrand(data: CreateBrandData | FormData): Promise<Brand> {
        const response = await apiClient.post(this.baseUrl, data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        });
        return response.data.data;
    }

    async updateBrand(id: string, data: UpdateBrandData | FormData): Promise<Brand> {
        const response = await apiClient.post(`${this.baseUrl}/${id}?_method=PUT`, data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        });
        return response.data.data;
    }

    async deleteBrand(id: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }

    async toggleBrandStatus(id: string): Promise<Brand> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/toggle-status`);
        return response.data.data;
    }

    async getBrandsByStatus(isActive: boolean): Promise<Brand[]> {
        const response = await apiClient.get(`${this.baseUrl}/by-status/${isActive ? '1' : '0'}`);
        return response.data.data;
    }
}

export const brandsApiService = new BrandsApiService();
