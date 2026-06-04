
import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useOrdersOverTime } from '../../hooks/useAdminStats';
import { useTranslation } from 'react-i18next';

function OrdersOverTimeChart() {

    const { t } = useTranslation();
    const [days, setDays] = useState(30);
    const { data, isLoading, isError } = useOrdersOverTime(days);

    const chartData = data?.data?.map(item => ({
        date: item.date || item._id,
        orders: item.orders || 0,
        revenue: item.revenue || 0
    })) || [];

    if (isError) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 h-80 flex items-center justify-center text-red-500 text-sm border border-red-100">
                {t('ordersOverTime.error')}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-pink-50/50 dark:border-slate-700/50 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white">
                        {t('ordersOverTime.title')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {t('ordersOverTime.desc')}
                    </p>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="text-xs border border-pink-100 dark:border-slate-600 rounded-xl px-3 py-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer"
                >
                    <option value={7}>{t('ordersOverTime.days7')}</option>
                    <option value={30}>{t('ordersOverTime.days30')}</option>
                    <option value={90}>{t('ordersOverTime.days90')}</option>
                </select>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    <span className="animate-pulse">{t('ordersOverTime.loading')}</span>
                </div>
            ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    {t('ordersOverTime.noData')}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 10 }}>

                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" vertical={false} />

                        <XAxis
                            dataKey="date"
                            height={40}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickFormatter={(val) => {
                                if (!val) return "";
                                const d = new Date(val);
                                return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                            }}
                        />
                        <YAxis
                            yAxisId="left"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickFormatter={(v) => `₹${v}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'document' === 'undefined' ? '#fff' : undefined,
                                borderRadius: '14px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                            }}
                            className="dark:bg-slate-900 dark:text-white"
                            formatter={(value, name) => name === 'Revenue' ? [`₹${value}`, t('ordersOverTime.revenue')] : [value, t('ordersOverTime.orders')]}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="orders"
                            stroke="#ec4899"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                            name={t('ordersOverTime.orders')}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                            name={t('ordersOverTime.revenue')}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default OrdersOverTimeChart;