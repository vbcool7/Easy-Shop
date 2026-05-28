
import { create } from 'zustand';

const getSafeJSON = (key) => {
    const data = localStorage.getItem(key);
    if (!data || data === "undefined") return null;
    try {
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
};

// search
export const useAdminUIStore = create((set) => ({
    selectedProductSearch: null,
    isProductDrawerOpen: false,
    selectedOrder: null,
    isOrderDrawerOpen: false,
    selectedUser: null,
    isUserDrawerOpen: false,

    openProductDrawer: (product) => set({ selectedProductSearch: product, isProductDrawerOpen: true }),
    closeProductDrawer: () => set({ selectedProductSearch: null, isProductDrawerOpen: false }),

    openOrderDrawer: (orderId) => set({ selectedOrder: orderId, isOrderDrawerOpen: true }),
    closeOrderDrawer: () => set({ selectedOrder: null, isOrderDrawerOpen: false }),
}));

const useAdminAuthStore = create((set) => ({
    admin: getSafeJSON("admin"),
    token: localStorage.getItem("admin_token") || null,

    login: (adminData, token) => {
        if (adminData && token) {
            localStorage.setItem("admin", JSON.stringify(adminData));
            localStorage.setItem("admin_token", token);
            // Dono names match karne chahiye (state key: value)
            set({ admin: adminData, token: token });
        }
    },

    logout: () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin");
        set({ admin: null, token: null });
        window.location.href = "/admin-login";
    }
}));

export default useAdminAuthStore;