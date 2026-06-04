
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import { useTopProducts } from '../../hooks/useAdminStats';
import { useTranslation } from 'react-i18next';

const BAR_COLORS = ['#ec4899', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];

function TopProductsChart() {
    
    const { t } = useTranslation();
    const { data, isLoading } = useTopProducts();
    const chartData = data || [];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-pink-50/50 dark:border-slate-700/50">
            <div className="mb-6">
                <h3 className="text-base font-black text-slate-800 dark:text-white">
                    {t('topProducts.title')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                    {t('topProducts.desc')}
                </p>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    {t('topProducts.loading')}
                </div>
            ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    {t('topProducts.noData')}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickLine={false}
                            axisLine={false}
                            width={100}
                            tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                            }}
                            formatter={(value, name, props) => {
                                const { sales, revenue } = props.payload;
                                if (name === 'sales') {
                                    return [
                                        <>
                                            <span className="block font-bold text-slate-700">
                                                {t('topProducts.unitsSold')}: {sales}
                                            </span>
                                            <span className="block font-bold text-pink-500 mt-0.5">
                                                {t('topProducts.revenue')}: ₹{revenue?.toLocaleString('en-IN')}
                                            </span>
                                        </>
                                    ];
                                }
                                return [value, name];
                            }}
                        />
                        <Bar dataKey="sales" name="sales" radius={[0, 8, 8, 0]} barSize={24}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default TopProductsChart;