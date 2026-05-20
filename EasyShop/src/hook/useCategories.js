
import API from '../api/axiosConfig.js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';

// list cat
export const useCatList = () => {
    return useQuery({
        queryKey: ['catList'],
        queryFn: async () => {
            const { data } = await API.get('/category/category-list');
            return data.data;
        },
        staleTime: 5 * 60 * 1000, 
    });
};

// mega menu
export const useMegaMenu = () => {
    return useQuery({
        queryKey: ['megaMenu'],
        queryFn: async () => {
            const {data} = await API.get('/category/category-tree-get');
            return data.data;
        },
        staleTime: 5 * 60 * 1000, 
        refetchOnWindowFocus: false, // avoid bg call
    });
};