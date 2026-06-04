
import { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { useVendorTopProducts } from "../../../hook/useVendor";
import { useTranslation } from "react-i18next";

const LIMITS = [5, 10];

const truncate = (str = "", n = 16) =>
    str.length > n ? str.slice(0, n) + "…" : str;

const CustomTooltip = ({ active, payload }) => {

    const { t } = useTranslation();
    if (!active || !payload?.length) return null;

    const d = payload[0].payload;
    return (
        <div className="bg-white dark:bg-slate-800 border border-pink-100 rounded-xl shadow-lg p-3 text-xs max-w-45">
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1 wrap-break-words">
                {d.name}
            </p>
            <p className="text-pink-500">
                {d.unitsSold} {t('vendorTopProducts.tooltipUnitsSold')}
            </p>
            <p className="text-purple-500">
                ₹{d.revenue?.toLocaleString()} {t('vendorTopProducts.tooltipRevenue')}
            </p>
        </div>
    );
};

// Gradient bar colours cycling through pink → purple → indigo
const BAR_COLORS = ["#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#6366f1",
    "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#6366f1"];

function VendorTopProductsChart() {

    const { t } = useTranslation();
    const [limit, setLimit] = useState(5);
    const { data, isLoading, isError } = useVendorTopProducts(limit);

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {t('vendorTopProducts.chartTitle')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {t('vendorTopProducts.chartSubTitle')}
                    </p>
                </div>

                <div className="flex gap-1">
                    {LIMITS.map((n) => (
                        <button
                            key={n}
                            onClick={() => setLimit(n)}
                            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all 
                                ${limit === n
                                ? "bg-pink-500 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50"
                                }`}
                        >
                            {t('vendorTopProducts.limitButtonLabel', { count: n })}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                    {t('vendorTopProducts.loading')}
                </div>
            )}
            {isError && (
                <div className="h-64 flex items-center justify-center text-sm text-red-400">
                    {t('vendorTopProducts.error')}
                </div>
            )}
            {data && data.length === 0 && (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                    {t('vendorTopProducts.noData')}
                </div>
            )}
            {data && data.length > 0 && (
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={115}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => truncate(v)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#fdf2f8" }} />
                        <Bar dataKey="unitsSold" radius={[0, 6, 6, 0]} maxBarSize={28}>
                            {data.map((_, i) => (
                                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default VendorTopProductsChart;