
import toast from 'react-hot-toast';
import API from '../api/axiosInstance.js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// user list
export const useUserList = ({ search = '', status = '', page = 1 } = {}) => {
    return useQuery({
        queryKey: ['userList', { search, status, page }],
        queryFn: async () => {
            const { data } = await API.get('/admin/get-user-list', {
                params: {
                    ...(search && { search }),
                    ...(status && { status }),
                    page,
                    limit: 10
                }
            });
            return data;
        },
        staleTime: 0,
    });
};

// toggle user status
export const useToggleUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleStatus'],
        mutationFn: async ({ user_id }) => {
            const { data } = await API.patch(`/admin/toggle-user-status/${user_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['userList'] });
            toast.success(res.message || "User status updated");
        },
        onError: (err) => {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to updat user status");
        }
    });
};

//  delete user
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteUser'],
        mutationFn: async ({ user_id }) => {
            const { data } = await API.delete(`/admin/delete-user/${user_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['userList'] });
            toast.success(res.message || "User deleted");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete user");
        }
    });
};