
import API from "../api/axiosConfig";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';

// blog list
export const useVendorBlogList = ({ search = '', page = 1, status = '' } = {}) => {
    return useQuery({
        queryKey: ['vendorBlogList', search, page, status],
        queryFn: async () => {
            const { data } = await API.get('/blog/get-vendor-blogs', {
                params: { search, page, limit: 10, status }
            });
            return data;
        },
        keepPreviousData: true
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
            queryClient.invalidateQueries({ queryKey: ['vendorBlogList'] });
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
            queryClient.invalidateQueries({ queryKey: ['vendorBlogList'] });
        }
    });
};

// status toggle
export const useToggleBlogVisibility = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleVisibility'],
        mutationFn: async (blog_id) => {
            const { data } = await API.patch(`/blog/toggle-visibility/${blog_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['vendorBlogList'] });
            toast.success(res?.message || "Status Updated");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    });
};

// ====== USER =======

// blog list
export const useBlogList = () => {
    return useInfiniteQuery({
        queryKey: ['blogList'],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await API.get(`/blog/get-blogs?page=${pageParam}&limit=6`);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage?.hasMore) {
                return lastPage.currentPage + 1;
            }
            return undefined;
        },
        staleTime: 1000 * 60 * 5
    });
};

// blog detail
export const useBlogDetail = (blog_id) => {
    return useQuery({
        queryKey: ['blogDetail', blog_id],
        queryFn: async () => {
            const { data } = await API.get(`/blog/get-blog/${blog_id}`);
            return data?.blog || null;
        },
        enabled: !!blog_id,
        staleTime: 1000 * 60 * 10,
    });
};

// related blogs
export const useRelatedBlogs = (blog_id) => {
    return useQuery({
        queryKey: ['relatedBlogs', blog_id],
        queryFn: async () => {
            const { data } = await API.get(`/blog/get-related-blogs/${blog_id}?limit=3`);
            return data;
        },
        enabled: !!blog_id,
        staleTime: 1000 * 60 * 5
    });
};