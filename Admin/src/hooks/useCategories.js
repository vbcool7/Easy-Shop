
import toast from 'react-hot-toast';
import API from "../api/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// list cate 
export const useCatList = ({ search = '', page = 1 } = {}) => {
    return useQuery({
        queryKey: ['catList', search, page],
        queryFn: async () => {
            const { data } = await API.get(`/category/category-list?search=${search}&page=${page}&limit=10`);
            return data;
        },
        staleTime: 0,
        keepPreviousData: true,
    });
};

// status toggle cat 
export const useToggleCatStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleCat'],
        mutationFn: async (catId) => {
            const { data } = await API.patch(`/category/category-toggle-status/${catId}`);
            return data;
        },
        onSuccess: (data) => {
            // Category list ko refresh karein taaki UI update ho jaye
            queryClient.invalidateQueries({ queryKey: ['catList'] });
            toast.success(data.message || "Status Updated!")
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    });
};

// add cat
export const useAddCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['addCat'],
        mutationFn: async (formData) => {
            const { data } = await API.post('/category/category-add', formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catList'] });
        }
    });
};

// edit cat
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateCat'],
        mutationFn: async ({ catId, formData }) => {
            const { data } = await API.put(`/category/category-update/${catId}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catList'] });
        }
    });
};

// delete info
export const useDeleteInfoCategory = (cat_id) => {
    return useQuery({
        queryKey: ['catDeleteInfo', cat_id],
        queryFn: async () => {
            const { data } = await API.get(`/category/category-delete-info/${cat_id}`);
            return data;
        },
        enabled: !!cat_id,
        refetchOnMount: true,
    });
};

// delete cat
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['catDelete'],
        mutationFn: async ({ catId }) => {
            const { data } = await API.delete(`/category/category-delete/${catId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catList'] });
        }
    });
};