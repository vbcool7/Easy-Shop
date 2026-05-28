
import API from '../api/axiosConfig.js';
import { useMutation, useQuery } from '@tanstack/react-query';

// vendor trans stats
export const useVendorTransactionStats = () => {
    return useQuery({
        queryKey: ['transactionStats'],
        queryFn: async () => {
            const { data } = await API.get('/transaction/transaction-stats');
            return data;
        }
    });
};

// venodr trans list
export const useVendorTransactionList = ({ search = '', page = 1, status = '', paymentMethod = '' } = {}) => {
    return useQuery({
        queryKey: ['transactionList', search, page, status, paymentMethod],
        queryFn: async () => {
            const { data } = await API.get('/transaction/transaction-list', {
                params: { search, page, limit: 10, status, paymentMethod }
            });
            return data;
        },
        staleTime: 0,
        keepPreviousData: true
    });
};

// trans invoice
export const useDownloadTransactionInvoice = () => {
    return useMutation({
        mutationFn: async (transaction_id) => {
            if (!transaction_id) throw new Error("Transaction ID is required");

            const response = await API.get(`/transaction/download-transaction-invoice/${transaction_id}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${transaction_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            return true;
        }
    });
};
