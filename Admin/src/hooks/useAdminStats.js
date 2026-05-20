
import toast from "react-hot-toast";
import API from "../api/axiosInstance";
import useAdminAuthStore from '../store/useAdminAuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// profile
export const useGetAdmin = () => {
    const token = useAdminAuthStore((state) => state.token); 

    return useQuery({
        queryKey: ['getAdmin'],
        queryFn: async () => {
            const { data } = await API.get(`/admin/admin-detail`); 
            return data.data;
        },
        enabled: !!token, 
    });
};

// dashboard stats
export const useAdminDashboardStats = () => {
    return useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: async () => {
            const { data } = await API.get('/admin/dashboard-stats');
            return data;
        },
        staleTime: 1000 * 60 * 5
    });
};

// orders through tym
export const useOrdersOverTime = (days = 30) => {
    return useQuery({
        queryKey: ['ordersOverTime', days],
        queryFn: async () => {
            const { data } = await API.get(`/admin/orders-over-time?days=${days}`);
            return data;
        },
        staleTime: 1000 * 60 * 5
    });
};

// orders - deliever, pending etc
export const useOrderStatusBreakdown = () => {
    return useQuery({
        queryKey: ['orderStatusBreakdown'],
        queryFn: async () => {
            const { data } = await API.get('/admin/order-status-breakdown');
            return data;
        },
        staleTime: 1000 * 60 * 5
    });
};

// orders pay method
export const useRevenueByPaymentMethod = () => {
    return useQuery({
        queryKey: ['revenueByPaymentMethod'],
        queryFn: async () => {
            const { data } = await API.get('/admin/revenue-by-payment');
            return data;
        },
        staleTime: 1000 * 60 * 5
    });
};

// top saleing prods
export const useTopProducts = () => {
    return useQuery({
        queryKey: ['topProducts'],
        queryFn: async () => {
            const { data } = await API.get('/admin/top-products'); 
            return data.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};