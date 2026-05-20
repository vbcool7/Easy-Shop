
import API from '../api/axiosConfig.js';
import toast from 'react-hot-toast';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from '../store/useAuthStore.js';
import { useEffect, useRef, useState } from 'react';

// prod list
export const useProductList = () => {
    return useQuery({
        queryKey: ['productsList'],
        queryFn: async () => {
            const { data } = await API.get('/product/product-get');
            return data.data;
        },
        staleTime: 0,
    });
};

// toggle status
export const useToggleProductStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['toggleStatus'],

        mutationFn: async (prod_id) => {
            const { data } = await API.patch(`/product/product-status-toggle/${prod_id}`);
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['productsList'] });
            queryClient.invalidateQueries({ queryKey: ['vendorStats'] });

            toast.success(res.message || "Status Updated");
        },
        onError: (err) => {
            const errorMsg = err.response?.data?.message || "Failed to update status";
            toast.error(errorMsg);
        }
    });
};

// update prods
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateProduct'],
        mutationFn: async ({ prod_id, formData }) => {
            const { data } = await API.put(`/product/product-update/${prod_id}`, formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsList'] });
        }
    });
};

// get category
export const useVendorCategories = () => {
    const { user } = useAuthStore();
    const vendorType = user?.category;

    return useQuery({
        queryKey: ['category', vendorType],
        queryFn: async () => {
            // API call jo vendorType ke basis par sub-cats layegi
            const { data } = await API.get(`/product/get-my-category`);
            return data.data;
        },
        enabled: !!vendorType,
    });
};

// get sub category
export const useVendorSubCategories = (type) => {
    return useQuery({
        queryKey: ['subCategory', type],
        queryFn: async () => {
            const { data } = await API.get(`/product/get-sub-category-by-category/${encodeURIComponent(type)}`);
            return data.data;
        },
        enabled: !!type,
    });
};

// add product
export const useAddProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['addProduct'],
        mutationFn: async ({ subCat_id, formData }) => {
            const { data } = await API.post(`/product/product-add/${subCat_id}`, formData);
            return data.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['productsList'] });
        }
    });
};

// stock stats
export const useVendorStockStats = () => {
    return useQuery({
        queryKey: ['vendorStockStats'],
        queryFn: async () => {
            const { data } = await API.get('/product/get-inventory-stats');
            return data.data;
        },
        staleTime: 0,
    });
};

// top selling prods
export const useTopSellingProducts = () => {
    return useQuery({
        queryKey: ['topSellingProducts'],
        queryFn: async () => {
            const { data } = await API.get('/product/get-top-selling-products');
            return data.data;
        },
        staleTime: 0,
    });
};

// stock alert
export const useStockAlert = () => {
    return useQuery({
        queryKey: ['stockAlertProds'],
        queryFn: async () => {
            const { data } = await API.get('/product/get-stock-alert');
            return data.data;
        },
        staleTime: 0,
    });
};


// ======== =USER SIDE ==========

// prod list - new arrival
export const useNewArrivalProducts = () => {
    return useQuery({
        queryKey: ['products', 'newArrivals'],
        queryFn: async () => {
            const { data } = await API.get('/product/product-list-all?isNewArrival=true');
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// prod list - best seller 
export const useBestSellerProducts = () => {
    return useQuery({
        queryKey: ['products', 'bestSellers'],
        queryFn: async () => {
            const { data } = await API.get('/product/product-list-all?isBestSeller=true&sort=bestSeller');
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// single product detail 
export const useProductDetail = (prodId) => {
    return useQuery({
        queryKey: ['product', prodId],
        queryFn: async () => {
            const { data } = await API.get(`/product/product-detail-public/${prodId}`);
            return data.data;
        },
        enabled: !!prodId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useProductsByCategory = (catId, filters = {}) => {
    return useQuery({
        queryKey: ['products', 'category', catId, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (catId) params.append('catId', catId);
            if (filters.subCatId) params.append('subCatId', filters.subCatId);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.sort) params.append('sort', filters.sort);

            // dynamic attributes
            if (filters.attributes) {
                Object.entries(filters.attributes).forEach(([key, value]) => {
                    params.append(key, value);
                });
            }

            const { data } = await API.get(`/product/product-list-all?${params.toString()}`);
            return data.data;
        },
        enabled: true,
        staleTime: 0,
        placeholderData: (previousData) => previousData,
    });
};

// updated hook — accepts both catId and subCatId
export const useProductFilterOptions = (catId, subCatId) => {
    return useQuery({
        queryKey: ['filterOptions', catId, subCatId], // refetches when subCatId changes
        queryFn: async () => {
            const url = subCatId
                ? `/product/filter-options/${catId}?subCatId=${subCatId}`
                : `/product/filter-options/${catId}`;
            const { data } = await API.get(url);
            return data.data;
        },
        enabled: !!catId,
        staleTime: 5 * 60 * 1000,
    });
};

// user - similar prods
export const useGetSimilarProducts = (prod_id) => {
    return useQuery({
        queryKey: ['similarProducts', prod_id],
        queryFn: async () => {
            const { data } = await API.get(`/product/get-similar-products/${prod_id}`);
            return data.data || [];
        },
        enabled: !!prod_id,
        staleTime: 1000 * 60 * 5
    });
};

// user - vendor shop prods
export const useVendorShopProducts = (vendor_id) => {
    return useInfiniteQuery({
        queryKey: ['shopProducts', vendor_id],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await API.get(`/product/get-vendor-shop-products/${vendor_id}?page=${pageParam}&limit=4`);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.currentPage < lastPage.totalPages) {
                return lastPage.currentPage + 1;
            }
            return undefined; // no more pages
        },
        enabled: !!vendor_id,
        staleTime: 1000 * 60 * 5
    });
};

// search prods - search bar
export const useSearchSuggestions = (delay = 300) => {

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // 1. Outside Click handler: jab user bahar click kare toh dropdown band ho jaye
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. Debounce Logic: Typing rukne ke baad hi API hit hogi
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                // Aapka API endpoint
                const response = await API.get(`/product/get-search-suggestions?query=${searchQuery}`);
                setSuggestions(response.data);
                setShowDropdown(true);
            } catch (error) {
                console.error("Search API Error:", error);
            }
        }, delay);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, delay]);

    // Kuch utilities jo component me use hongi
    const clearSearch = () => {
        setSearchQuery("");
        setSuggestions([]);
        setShowDropdown(false);
    };

    return {
        searchQuery,
        setSearchQuery,
        suggestions,
        showDropdown,
        setShowDropdown,
        dropdownRef,
        clearSearch
    };
};

// search prods - search results
export const useSearchResults = (query) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query || !query.trim()) {
                setData([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Aapka product search suggestions wala backend endpoint
                const response = await API.get(`/product/get-search-suggestions?query=${query}`);
                setData(response.data);
            } catch (err) {
                console.error("Error fetching search results:", err);
                setError(err);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return { data, isLoading, error };
};