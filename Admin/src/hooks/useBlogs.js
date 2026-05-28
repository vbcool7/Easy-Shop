
import API from '../api/axiosInstance';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';

// list 
export const useBlogList = ({ search = '', page = 1 } = {}) => {
    return useQuery({
        queryKey: ['blogList', search, page],
        queryFn: async () => {
            const { data } = await API.get(`/admin/list-blog?search=${search}&page=${page}&limit=10`);
            return data;
        },
        staleTime: 0,
        keepPreviousData: true,
    });
};

// add blog 
export const useAddBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['addBlog'],
        mutationFn: async (formData) => {
            const { data } = await API.post('/blog/create-blog', formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogList'] });
        }
    });
};

// update blog status - blog table
export const useUpdateBlogStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateStatus'],
        mutationFn: async ({ blog_id, status }) => {
            const { data } = await API.patch(`/admin/update-blog-status/${blog_id}`, { status });
            return data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries(['blogList']);
        }
    });
};

// update blogs
export const useUpdateBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateBlog'],
        mutationFn: async ({ blog_id, formData }) => {
            const { data } = await API.put(`/blog/update-blog/${blog_id}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogList'] });
        }
    });
};

// delete blog 
export const useDeleteBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteBlog'],
        mutationFn: async (blog_id) => {
            const { data } = await API.delete(`/admin/delete-blog/${blog_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['blogList'] });
            toast.success(res?.message || "Blog deleted successfully!");
        },
        onError: (err) => {
            console.error("Delete Blog Error:", err);
            toast.error(err?.response?.data?.message || "Failed to delete the blog");
        }
    });
};