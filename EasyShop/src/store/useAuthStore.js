
import { create } from 'zustand';

const getSafeJSON = (key) => {
    const data = localStorage.getItem(key);
    if (!data || data === "undefined") return null; // "undefined" string ko check karein
    try {
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
};

// vendor search
export const useVendorUIStore = create((set) => ({
    selectedProduct: null,
    isProductDrawerOpen: false,
    selectedOrder: null,
    isOrderDrawerOpen: false,

    openProductDrawer: (product) => set({ selectedProduct: product, isProductDrawerOpen: true }), 
    closeProductDrawer: () => set({ selectedProduct: null, isProductDrawerOpen: false }),

    openOrderDrawer: (order) => set({ selectedOrder: order, isOrderDrawerOpen: true }),
    closeOrderDrawer: () => set({ selectedOrder: null, isOrderDrawerOpen: false }),
}));

const useAuthStore = create((set) => ({
    user: getSafeJSON("user"),
    token: localStorage.getItem("token") || null,

    login: (user, token) => {
        // Hamesha check karein ki data valid hai ya nahi
        if (user && token) {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            set({ user, token });
        }
    },

    updateUser: (newUser) => {
        // Purane user data ke saath naye data ko merge karein
        const updatedUser = { ...get().user, ...newUser };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        set({ user: updatedUser });
    },

    // Action: Logout karne par khali karo
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null });
    }
}));

export default useAuthStore;