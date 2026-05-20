
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axiosConfig.js";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

// get cart
export const useGetCart = () => {

    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const { data } = await API.get('/cart/cart-get');
            return data.data?.items || [];
        },
        enabled: !!user && user.role === 'user',
        staleTime: 0,
    });
};

// add to cart
export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, quantity, selectedColor, selectedSize,variantId, prodImage }) => {
            const { data } = await API.post('/cart/cart-add', {
                productId,
                quantity,
                selectedColor,
                selectedSize,
                variantId,
                prodImage
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to add to cart");
        }
    });
};

// remove from cart
export const useRemoveFromCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ prodId, variantId }) => {
            const { data } = await API.delete(`/cart/cart-remove/${prodId}`, {
                data: { variantId }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });
};

// clear cart
export const useClearCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await API.delete('/cart/cart-clear');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to clear cart");
        }
    });
};


// update quantity
export const useUpdateCartQuantity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, variantId, action }) => {
             const { data } = await API.put('/cart/cart-quantity-update', {
                productId,
                variantId,
                action
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update quantity");
        }
    });
};