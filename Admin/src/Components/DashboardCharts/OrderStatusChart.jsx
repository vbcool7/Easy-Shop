
import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { useOrderStatusBreakdown } from '../../hooks/useAdminStats';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
    Delivered: '#ec4899',
    Processing: '#f43f5e',
    Shipped: '#fb7185',
    Cancelled: '#fda4af',
    Pending: '#fecdd3'
};

const CustomTooltip = ({ active, payload, t }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-3 border border-pink-50 text-xs">
                <p className="font-bold text-slate-700">{payload[0].name}</p>
                <p className="text-pink-500">{payload[0].value} {t('orderStatusChart.orders')}</p>
            </div>
        );
    }
    return null;
};

function OrderStatusChart() {
    
    const { t } = useTranslation();
    const { data, isLoading } = useOrderStatusBreakdown();
    const chartData = data?.data || [];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-pink-50/50 dark:border-slate-700/50">
            <div className="mb-6">
                <h3 className="text-base font-black text-slate-800 dark:text-white">{t('orderStatusChart.title')}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t('orderStatusChart.desc')}</p>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">{t('orderStatusChart.loading')}</div>
            ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">{t('orderStatusChart.noData')}</div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={STATUS_COLORS[entry.name] || '#fda4af'}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip t={t} />} />
                        <Legend
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value) => <span className="text-slate-600 dark:text-slate-300">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
export default OrderStatusChart;