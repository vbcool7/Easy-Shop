
import API from "../api/axiosInstance.js";
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// withdraw req list
export const useWithdrawReqList = ({ status = '', page = 1 } = {}) => {
    return useQuery({
        queryKey: ['withdrawReqList', { status, page }],
        queryFn: async () => {
            const { data } = await API.get('/admin/get-all-withdrawal-request', {
                params: {
                    ...(status && { status }),
                    page,
                    limit: 10
                }
            });
            return data;
        },
        staleTime: 0
    });
};

// toggle withdraw status
export const useToggleWithdrawStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleWithdrawStatus'],
        mutationFn: async ({ withdraw_id, formData }) => {
            const { data } = await API.patch(`admin/toggle-withdraw-status/${withdraw_id}`, formData);
            return data.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['withdrawReqList'] });
            toast.success("Status Approved");
        },
        onError: (err) => {
            console.error(err.response?.data?.message || "Failed to status change");
            toast.success("Error to change status")
        }
    });
};