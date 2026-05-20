
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import API from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

// prod list
export const useGetProducts = (search = "") => {
    return useQuery({
        queryKey: ['productList', search],
        queryFn: async () => {
            const { data } = await API.get(`/admin/get-product-list?search=${search}`);
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// update prod status - prod table
export const useUpdateProductStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateStatus'],
        mutationFn: async ({ product_id, status }) => {
            const { data } = await API.patch(`/admin/update-product-status/${product_id}`, { status });
            return data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries(['productList']);
        }
    });
};

// update prods
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateProduct'],
        mutationFn: async ({ prod_id, formData }) => {
            const { data } = await API.put(`/product/product-update/${prod_id}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productList'] });
        }
    });
};

// toggle prods arrival
export const useToggleProductArrival = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleArrival'],
        mutationFn: async ({ product_id }) => {
            const { data } = await API.patch(`/admin/toggle-product-arrival/${product_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['productList'] });
            toast.success(res.message || "Product in New Arrival")
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Product remove from New Arrival");
        }
    });
};

// delete prod
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["deleteProduct"],

        mutationFn: async ({ prod_id }) => {
            const { data } = await API.delete(`/product/product-delete/${prod_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["productList"] });
            toast.success(res.message || "Product deleted successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete product");
        }
    });
};

// toggle best seller 
export const useToggleBestSeller = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productId) => {
            const { data } = await API.patch(`/admin/toggle-best-seller/${productId}`);
            return data;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries(['productList']); 
            toast.success("Best Seller Product");
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to toggle best seller";
            toast.error(message);
        }
    });
};