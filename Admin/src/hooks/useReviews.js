
import API from '../api/axiosInstance.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// review list
export const useReviewList = ({ status = '', vendorId = '', page = 1 } = {}) => {
    return useQuery({
        queryKey: ['reviewList', { status, vendorId, page }],
        queryFn: async () => {
            const { data } = await API.get('/admin/review-list', {
                params: {
                    ...(status && { status }),
                    ...(vendorId && { vendorId }),
                    page,
                    limit: 10
                }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// update review status
export const useUpdateReviewStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ review_id, status }) => {
            const { data } = await API.patch(`/admin/review-status-update/${review_id}`, { status });
            return data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['reviewList']);
            toast.success(data?.message || "Status updated successfully!");
        },
        onError: (error) => {
            const msg = error.response?.data?.message || "Failed to update status";
            toast.error(msg);
        }
    });
};

// delete review
export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (review_id) => {
            const { data } = await API.delete(`/admin/review-delete/${review_id}`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['reviewList']);
            toast.success(data?.message);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    });
};