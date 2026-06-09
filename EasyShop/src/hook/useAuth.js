
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import API from '../api/axiosConfig.js';
import toast from 'react-hot-toast';

// send otp - user + vendor
export const useSendOTP = () => {
    return useMutation({
        mutationFn: async (data) => {

            // data should be { email, role }
            const res = await API.post('/otp/send-otp', data);
            return res.data;
        }
    });
};

// verify otp - user + vendor
export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: async (verifyData) => {

            // verifyData should be { email, otp, role }
            const res = await API.post('/otp/verify-otp', verifyData);
            return res.data
        }
    });
};

// update email verify otp - user + vendor
export const useUpdatedEmailVerifyOtp = () => {
    return useMutation({
        mutationFn: async (verifyUpdatedData) => {
            const res = await API.post('/otp/updated-email-verify-otp', verifyUpdatedData);
            return res.data;
        }
    });
};

// Signup - user
export const useSignup = () => {
    return useMutation({
        mutationFn: async (userData) => {
            const res = await API.post('/user/user-signup', userData);
            return res.data;
        }
    });
};

// Signup - vendor
export const useVendorSignup = () => {
    return useMutation({
        mutationFn: async (vendorData) => {
            const res = await API.post('/vendor/vendor-signup', vendorData);
            return res.data;
        }
    });
};

// login - user + vendor
export const useLogin = () => {
    return useMutation({
        mutationFn: async ({ email, password, role }) => {
            const endpoint = role === 'vendor' ? '/vendor/vendor-login' : '/user/user-login';

            const res = await API.post(endpoint, { email, password });
            return res.data;
        }
    });
};

// forgot - user + vendor
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async ({ email, role }) => {

            const endpoint = role === 'vendor' ? '/vendor/vendor-forgot-password' : '/user/user-forgot-password'
            const res = await API.post(endpoint, { email });
            return res.data;
        }
    });
};

// reset - user + vendor
export const useResetPassword = () => {
    return useMutation({
        mutationFn: async ({ id, token, password, confirmPassword, role }) => {

            const endpoint = role === 'vendor'
                ? `/vendor/vendor-reset-password/${id}/${token}`
                : `/user/user-reset-password/${id}/${token}`;

            const res = await API.post(endpoint, { password, confirmPassword });
            return res.data;
        }
    });
};

// get - user
export const useUserProfile = (user_id) => {
    return useQuery({
        queryKey: ["user", user_id],
        queryFn: async () => {
            const { data } = await API.get(`/user/user-get/${user_id}`);
            return data.data;
        },
        enabled: !!user_id,
    });
};

// get - vendor
export const useVendorProfile = (vendorId) => {
    return useQuery({
        queryKey: ["vendor", vendorId],
        queryFn: async () => {
            const { data } = await API.get(`/vendor/vendor-get/${vendorId}`);
            return data.data;
        },
        enabled: !!vendorId,
    });
};

// update - user
export const useUpdateUserProfile = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await API.put(`/user/user-detail-update`, formData);
            return data;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries(["user", userId]);
            toast.success(response.message || "Profile updated successfully!");
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to update profile";
            toast.error(message);
            console.error("Profile Update Error:", error);
        },
    });
};

// update - vendor
export const useUpdateVendorProfile = (vendorId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await API.put("/vendor/vendor-detail-update", formData);
            return data;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries(["vendor", vendorId]);
            // toast.success(response.message || "Profile updated successfully!");
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to update profile";
            toast.error(message);
            console.error("Profile Update Error:", error);
        },
    });
};

// change password - vendor
export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (passwordData) => {
            const { data } = await API.put("/vendor/change-password", passwordData);
            return data;
        },
        onSuccess: (response) => {
            toast.success(response.message || "Password changed successfully!");
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to change password";
            toast.error(message);
        },
    });
};

// change password - user
export const useChangeUserPassword = () => {
    return useMutation({
        mutationFn: async (passwordData) => {
            const { data } = await API.put("/user/change-password", passwordData);
            return data;
        },
        onSuccess: (response) => {
            toast.success(response.message || "Password changed successfully! Now login again");
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Failed to change password";
            toast.error(message);
        },
    });
};

// vendor logout
export const useVendorLogout = () => {
    return useMutation({
        mutationKey: ['vendorLogout'],
        mutationFn: async () => {
            const res = await API.post('/vendor/vendor-logout');
            return res.data;
        }
    });
};

// user logout
export const useUserLogout = () => {
    return useMutation({
        mutationKey: ['userLogout'],
        mutationFn: async () => {
            const res = await API.post('/user/user-logout');
            return res.data;
        }
    });
};