
import API from '../api/axiosConfig.js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// contact
export const useContactForm =() => {
    return useMutation({
        mutationKey: ['contactForm'],
        mutationFn: async(formData) => {
            const {data} = await API.post('/contact/contact-form', formData);
            return data;
        }
    });
};