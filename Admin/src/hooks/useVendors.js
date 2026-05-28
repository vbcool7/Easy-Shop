
import toast from "react-hot-toast";
import API from "../api/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// stats
export const useVendorStats = () => {
    return useQuery({
        queryKey: ['vendorStats'],
        queryFn: async () => {
            const { data } = await API.get('/admin/vendor-stats');
            return data.data;
        },
        staleTime: 0,
    });
};

// list
export const useVendorList = ({ search = '', page = 1 } = {}) => {
    return useQuery({
        queryKey: ['vendorList', search, page],
        queryFn: async () => {
            const { data } = await API.get(`/admin/get-vendor-list?search=${search}&page=${page}&limit=10`);
            return data;
        },
        staleTime: 0,
        keepPreviousData: true,
    });
};

// get vendor
export const useGetVendor = (vendorId) => {
    return useQuery({
        queryKey: ['vendorDetail', vendorId],
        queryFn: async () => {
            const { data } = await API.get(`/vendor/vendor-get/${vendorId}`);
            return data.data;
        },
        enabled: !!vendorId, // Jab tak ID na ho, API mat chalana
    });
};

// status toggle
export const useToggleVendorStatus = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleStatus'],
        mutationFn: async (vendor_id) => {
            const { data } = await API.patch(`/admin/vendor-toggle-status/${vendor_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['vendorList'] });
            toast.success(res.message || "Status Updated!")
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    });
};
