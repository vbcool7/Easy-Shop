
import API from '../api/axiosConfig.js';
import { useQuery } from '@tanstack/react-query';

// sub cat list
// export const useSubCatList = () => {
//     return useQuery({
//         queryKey: ['subCatList'],
//         queryFn: async () => {
//             const { data } = await API.get('/subCategory/sub-category-list?limit=100');
//             return data.data;
//         },
//         staleTime: 5 * 60 * 1000,
//     });
// };

// home grid
export const useActiveSubCategories = () => {
    return useQuery({
        queryKey: ['activeSubCategories'],
        queryFn: async () => {
            const { data } = await API.get('/subCategory/sub-category-active-list');
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// list sub cat by cat
export const useSubCatByCategory = (cat_id) => {
    return useQuery({
        queryKey: ['subCatByCatList', cat_id],
        queryFn: async () => {
            if (!cat_id) return [];
            const { data } = await API.get(`/subCategory/sub-category-list-by-category/${cat_id}`);
            return data.data;
        },
        enabled: !!cat_id,
        staleTime: 5 * 60 * 1000,
    });
};