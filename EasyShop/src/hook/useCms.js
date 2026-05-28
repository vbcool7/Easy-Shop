
import { useQuery } from '@tanstack/react-query';
import API from '../api/axiosConfig';

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