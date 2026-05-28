
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axiosInstance";
import toast from "react-hot-toast";

// sub cat list
export const useSubCatList = ({ search = '', page = 1 } = {}) => {
    return useQuery({
        queryKey: ['subCatList', search, page],
        queryFn: async () => {
            const { data } = await API.get(`/subCategory/sub-category-list?search=${search}&page=${page}&limit=10`);
            return data;
        },
        staleTime: 0,
        keepPreviousData: true,
    });
};

// sub cat toggle status
export const useToggleSubCatStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleSubCat'],
        mutationFn: async (subCatId) => {
            const { data } = await API.patch(`/subCategory/sub-category-toggle-status/${subCatId}`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['subCatList'] });
            toast.success(data.message || "Status Updated!")
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    });
};

// toggle show on home
export const useToggleShowOnHome = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await API.patch(`/subCategory/sub-category-toggle-show-on-home/${id}`);
            return data;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['subCatList'] });
            queryClient.invalidateQueries({ queryKey: ['activeSubCategories'] });
            toast.success(response?.message || "Updated successfully");
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Something went wrong";
            toast.error(message);
        }

    });
};

// add sub-cat
export const useAddSubCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['addSubCat'],
        mutationFn: async ({ catId, formData }) => {
            const { data } = await API.post(`/subCategory/sub-category-add/${catId}`, formData);
            return data;
        },
        onSuccess: () => {

            // Category list ko invalidate karein taaki nayi category turant dikhne lage
            queryClient.invalidateQueries({ queryKey: ['subCatList'] });
        }
    });
};

// edit sub-cat
export const useUpdateSubCategory = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateSubCat'],
        mutationFn: async ({ subCatId, formData }) => {
            const { data } = await API.put(`/subCategory/sub-category-update/${subCatId}`, formData);
            return data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subCatList'] });
        }
    });
};

// dlt info
export const useDeleteInfoSubCategory = (subCat_id) => {
    return useQuery({
        queryKey: ['subCatDeleteInfo', subCat_id],
        queryFn: async () => {
            const { data } = await API.get(`/subCategory/sub-category-delete-info/${subCat_id}`);
            return data;
        },
        enabled: !!subCat_id,
        refetchOnMount: true,
    });
};


// dlt sub-cat
export const useDeleteSubCategory = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['subCatDelete'],
        mutationFn: async ({ subCatId }) => {
            const { data } = await API.delete(`/subCategory/sub-category-delete/${subCatId}`);
            return data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subCatList'] });
        }
    });
};