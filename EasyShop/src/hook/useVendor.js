
import { useQuery } from '@tanstack/react-query';
import API from '../api/axiosConfig.js';
import useAuthStore from '../store/useAuthStore.js';

// list cat for vendor signup
export const useCatList = () => {
    return useQuery({
        queryKey: ['catList'],
        queryFn: async () => {
            const { data } = await API.get('/category/category-list');
            return data.data;
        },
        staleTime: 0,
    });
};

// vendor profile
export const useGetVendor = () => {
    const token = useAuthStore((state) => state.token);

    return useQuery({
        queryKey: ['getVendor'],
        queryFn: async () => {
            const { data } = await API.get(`/vendor/vendor-profile`);
            return data.data;
        },
        enabled: !!token,
    });
};

//vendor stats
export const useVendorStats = () => {
    return useQuery({
        queryKey: ["vendorStats"],
        queryFn: async () => {
            const { data } = await API.get('/vendor/vendor-dashboard-stats');
            return data.data;
        },
    });
};

export const useVendorOrdersOverTime = (period = 30) => {
    return useQuery({
        queryKey: ["vendorOrdersOverTime", period],
        queryFn: async () => {
            const { data } = await API.get(`/vendor/orders-over-time?period=${period}`);
            return data.data;
        },
    });
};

export const useVendorOrderStatus = () => {
    return useQuery({
        queryKey: ["vendorOrderStatus"],
        queryFn: async () => {
            const { data } = await API.get("/vendor/order-status");
            return data.data;
        },
    });
};

export const useVendorTopProducts = (limit = 5) => {
    return useQuery({
        queryKey: ["vendorTopProducts", limit],
        queryFn: async () => {
            const { data } = await API.get(`/vendor/top-products?limit=${limit}`);
            return data.data;
        },
    });
};

// dashboard - search
export const useVendorSearch = (query) => {
    return useQuery({
        queryKey: ['vendorSearch', query],
        queryFn: async () => {
            const { data } = await API.get(`/vendor/search?q=${query}`);
            return data;
        },
        enabled: !!query && query.trim().length >= 2,
        staleTime: 0,
        gcTime: 0,
    });
};