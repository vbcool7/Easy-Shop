
import { useQuery } from '@tanstack/react-query';
import API from '../api/axiosConfig';

export const useGetBanners = (zone) => {
    return useQuery({
        queryKey: ['banners', zone],
        queryFn: async () => {
            const { data } = await API.get(`/banner/get-banners/${zone}`);
            return data.banners;
        },
        select: (banners) => banners
            .filter(b => b.isActive)
            .sort((a, b) => a.order - b.order),
        staleTime: 1000 * 60 * 5,
        enabled: !!zone,
    });
};