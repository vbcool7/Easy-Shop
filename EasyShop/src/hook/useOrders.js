
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import API from '../api/axiosConfig.js';
import toast from 'react-hot-toast';

// Get Vendor Orders 
export const useVendorOrders = ({ search = '', page = 1, orderStatus = '' } = {}) => {
    return useQuery({
        queryKey: ['vendorOrders', search, page, orderStatus],
        queryFn: async () => {
            const { data } = await API.get('/order/get-vendor-orders', {
                params: { search, page, limit: 10, orderStatus }
            });
            return data;
        },
        keepPreviousData: true
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

            queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
            queryClient.invalidateQueries(['orderList']);
            queryClient.invalidateQueries({ queryKey: ['orderDetail', data._id] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    });
};

// get single order
export const useSingleOrderDetail = (order_id) => {
    return useQuery({
        queryKey: ['singleOrder', , order_id],
        queryFn: async () => {
            const { data } = await API.get(`/order/get-vendor-single-order/${order_id}`);
            return data.data;
        },
        enabled: !!order_id,
    });
};

// download invoice
export const useOrderInvoiceDownload = () => {
    return useMutation({
        mutationFn: async (order_id) => {
            const response = await API.get(`/order/download-invoice/${order_id}`, {
                responseType: 'blob'
            });
            return response.data;
        },
        onSuccess: (data, order_id) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${order_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Invoice downloaded!");
        },
        onError: () => {
            toast.error("Failed to download invoice");
        }
    });
};

// vendor order stats
export const useOrderStats = () => {
    return useQuery({
        queryKey: ['orderStats'],
        queryFn: async () => {
            const { data } = await API.get('/order/vendor-order-stats');
            return data.data;
        }
    });
};

// ======= USER =======

// create
export const useCreateRazorpayOrder = () => {
    return useMutation({
        mutationFn: async (amount) => {
            const { data } = await API.post('/order/create-razorpay-order', { amount });
            return data;
        }
    });
};

// verify
export const useVerifyPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await API.post('/order/verify-payment', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Payment verification failed");
        }
    });
};

// place cart order
export const usePlaceCartOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ shippingAddress, paymentMethod }) => {
            const { data } = await API.post('/order/place-cart-order', {
                shippingAddress,
                paymentMethod
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to place order";
            toast.error(message);
        }
    });
};

// place direct order
export const usePlaceDirectOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ prod_id, quantity, shippingAddress, paymentMethod, selectedColor, selectedSize }) => {
            const { data } = await API.post(`/order/place-direct-order/${prod_id}`, {
                quantity,
                shippingAddress,
                paymentMethod,
                selectedColor,
                selectedSize
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to place order";
            toast.error(message);
        }
    });
};

// user order history 
export const useUserOrderHistory = ({ page = 1, search = '', orderStatus = '' } = {}) => {
    return useQuery({
        queryKey: ['userOrders', { page, search, orderStatus }],
        queryFn: async () => {
            const { data } = await API.get('/order/user-order-history', {
                params: { page, limit: 10, search, orderStatus }
            });
            return data;
        },
        staleTime: 0,
    });
};

// user single order 
export const useOrderDetail = (order_id) => {
    return useQuery({
        queryKey: ['orderDetail', order_id],
        queryFn: async () => {
            const { data } = await API.get(`/order/user-order-detail/${order_id}`);
            return data.data;
        },
        enabled: !!order_id,
        staleTime: 0,
    });
};