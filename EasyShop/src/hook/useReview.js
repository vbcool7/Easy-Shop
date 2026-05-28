
import API from '../api/axiosConfig.js';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// vendor - review stats
export const useVendorReviewStats = () => {
    return useQuery({
        queryKey: ['vendorReviewStats'],
        queryFn: async () => {
            const { data } = await API.get(`/review/review-stats-vendor`);
            return data?.data;
        }
    });
};

// vendor - review list
export const useVendorReviewList = ({ status = '', page = 1, limit = 10 } = {}) => {
    return useQuery({
        queryKey: ['vendorReviews', { status, page, limit }],
        queryFn: async () => {
            const { data } = await API.get(`/review/review-list-vendor`, {
                params: { status, page, limit }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// reply review
export const useSubmitVendorReply = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ review_id, replyText }) => {
            const { data } = await API.post(`/review/review-reply/${review_id}`, { replyText });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorReviews'] });
            queryClient.invalidateQueries({ queryKey: ['vendorReviewStats'] });
        }
    });
};

// ======= USER =======

// user reviews
export const useUserReviews = ({ page = 1, limit = 10 } = {}) => {
    return useQuery({
        queryKey: ['userReviews', page, limit],
        queryFn: async () => {
            const { data } = await API.get(`/review/get-user-reviews?page=${page}&limit=${limit}`);
            return data;
        }
    });
};

// add review 
export const useAddReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['addReview'],
        mutationFn: async ({ prod_id, rating, review }) => {
            const { data } = await API.post(`/review/review-add/${prod_id}`, {
                rating,
                review
            });
            return data;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries(['productReviews']);
            toast.success(response.message || "Review added successfully!");
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Unable to submit review";
            toast.error(message);
        }
    });
};

// delete review
export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (review_id) => {
            const { data } = await API.delete(`/review/review-delete/${review_id}`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['userReviews']);
            toast.success(data?.message);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    });
};

// prod reviews
export const useProductReviews = (prod_id) => {
    return useQuery({
        queryKey: ['productReviews', prod_id],
        queryFn: async () => {
            const { data } = await API.get(`review/get-product-reviews/${prod_id}`);
            return data.data || [];
        },
        enabled: !!prod_id,
        staleTime: 1000 * 60 * 5
    });
};

// home review
export const useApprovedReviews = () => {
    return useQuery({
        queryKey: ['approvedReviews'],
        queryFn: async () => {
            const { data } = await API.get('/review/get-approved-reviews-home');
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};