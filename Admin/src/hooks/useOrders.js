
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axiosInstance";
import toast from 'react-hot-toast';

// order list
export const useOrderList = ({ search = '', page = 1, status = '', vendorId = '' } = {}) => {
    return useQuery({
        queryKey: ['orderList', { search, page, status, vendorId }],
        queryFn: async () => {
            const { data } = await API.get('/admin/get-all-orders', {
                params: {
                    ...(search && { search }),
                    ...(status && { status }),
                    ...(vendorId && { vendorId }),
                    page,
                    limit: 10
                }
            });
            return data; 
        },
        staleTime: 30 * 1000,
    });
};

// toggle order status
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateOrderStatus'],
        mutationFn: async ({ order_id, status }) => {
            const { data } = await API.patch(`/order/order-status-update/${order_id}`, { status });
            return data.data;
        },
        onSuccess: (data) => {
            toast.success(`Order updated to ${data.orderStatus}`);

            queryClient.invalidateQueries(['orderList']);
            queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
            queryClient.invalidateQueries(['orderDetail', data._id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    });
};