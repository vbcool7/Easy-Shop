
import API from '../api/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetBanners = (zone) => {
    return useQuery({
        queryKey: ['banners', zone],
        queryFn: async () => {
            const { data } = await API.get(`/banner/get-banners/${zone}`);
            return data.banners;
        },
    });
};

export const useAddBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['addBanner'],
        mutationFn: async (formData) => {
            const { data } = await API.post('/banner/create-banner', formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        }
    });
};

export const useUpdateBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateBanner'],
        mutationFn: async ({ id, formData }) => {
            const { data } = await API.put(`/banner/update-banner/${id}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        }
    });
};

export const useDeleteBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteBanner'],
        mutationFn: async (id) => {
            const { data } = await API.delete(`/banner/delete-banner/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        }
    });
};