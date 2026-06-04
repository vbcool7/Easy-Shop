
import API from '../api/axiosConfig.js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// get
export const useGetNotification = ({ pageNum = 1 }) => {
    return useQuery({
        queryKey: ['fetchNotifications', pageNum],
        queryFn: async () => {
            const { data } = await API.get(`/notification/get-all-notification?page=${pageNum}&limit=10`);
            return data;
        }
    });
};

// all read
export const useMarkAllReadNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['markAllRead'],
        mutationFn: async () => {
            const { data } = await API.patch(`/notification/mark-all-read-notification`)
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fetchNotifications'] });
        }
    });
};

// single read
export const useMarkSingleReadNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await API.patch(`/notification/read-notification/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fetchNotifications'] });
        }
    });
};