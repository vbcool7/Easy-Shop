
import API from '../api/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetCmsContent = (key) => {
    return useQuery({
        queryKey: ['cms', key],
        queryFn: async () => {
            const { data } = await API.get(`/cms/get-cms-content/${key}`);
            return data.content;
        },
        staleTime: 1000 * 60 * 10,
        retry: false,
    });
};

export const useUpsertCmsContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['upsertCms'],
        mutationFn: async ({ key, formData }) => {
            const { data } = await API.put(`/cms/upsert-cms-content/${key}`, formData);
            return data;
        },
        onSuccess: (_, { key }) => {
            queryClient.invalidateQueries({ queryKey: ['cms', key] });
        }
    });
};