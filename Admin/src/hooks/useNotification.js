
import API from '../api/axiosInstance.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// get
export const useGetAdminNotification = ({ pageNum = 1 }) => {
    return useQuery({
        queryKey: ['fetchAdminNotifications', pageNum],
        queryFn: async () => {
            const { data } = await API.get(`/adminNotification/get-all-notification?page=${pageNum}&limit=10`);
            return data;
        }
    });
};

// all read
export const useMarkAllAdminReadNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['markAllRead'],
        mutationFn: async () => {
            const { data } = await API.patch(`/adminNotification/mark-all-read-notification`)
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fetchAdminNotifications'] })
        }
    });
};

// single read
export const useMarkSingleReadNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await API.patch(`/adminNotification/read-notification/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fetchAdminNotifications'] });
        }
    });
};