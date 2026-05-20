
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { useRevenueByPaymentMethod } from '../../hooks/useAdminStats';

function RevenueByPaymentChart() {

    const { data, isLoading } = useRevenueByPaymentMethod();
    const chartData = data?.data || [];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-pink-50/50 dark:border-slate-700/50">
            <div className="mb-6">
                <h3 className="text-base font-black text-slate-800 dark:text-white">Revenue by Payment Method</h3>
                <p className="text-xs text-slate-400 mt-0.5">COD vs Online payment comparison</p>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
            ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data available</div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} barSize={48}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            formatter={(value, name) => name === 'revenue' ? [`₹${value}`, 'Revenue'] : [value, 'Orders']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="revenue" name="Revenue" fill="#ec4899" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="orders" name="Orders" fill="#fda4af" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default RevenueByPaymentChart;