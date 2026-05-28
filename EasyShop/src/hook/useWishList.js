
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axiosConfig.js";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

// get wishlist
export const useGetWishList = () => {

    const { user } = useAuthStore();
    console.log("Current User Role:", user?.role);

    return useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const { data } = await API.get('/wishList/wishList-get');
            return data.data?.items || [];
        },
        enabled: !!user && user.role === 'user',
        staleTime: 5 * 60 * 1000,
    });
};

// toggle wishlist
export const useToggleWishList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, selectedColor, selectedSize, prodImage }) => {
            const { data } = await API.post('/wishList/wishList-add', {
                productId,
                selectedColor,
                selectedSize,
                prodImage
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wishlist']);
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to update wishlist";
            toast.error(message);
        }
    });
};