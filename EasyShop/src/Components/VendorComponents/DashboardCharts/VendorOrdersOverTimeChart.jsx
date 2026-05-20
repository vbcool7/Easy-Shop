
import { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useVendorOrdersOverTime } from "../../../hook/useVendor";

const PERIODS = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-slate-800 border border-pink-100 rounded-xl shadow-lg p-3 text-xs">
            <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.name}: {p.dataKey === "revenue" ? `₹${p.value.toLocaleString()}` : p.value}
                </p>
            ))}
        </div>
    );
};

function VendorOrdersOverTimeChart() {
    const [period, setPeriod] = useState(30);
    const { data, isLoading, isError } = useVendorOrdersOverTime(period);

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Orders Over Time
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Revenue & order count trend</p>
                </div>
                <div className="flex gap-1">
                    {PERIODS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                                period === opt.value
                                    ? "bg-pink-500 text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                    Loading chart...
                </div>
            )}
            {isError && (
                <div className="h-64 flex items-center justify-center text-sm text-red-400">
                    Failed to load data
                </div>
            )}
            {data && data.length === 0 && (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                    No order data for this period
                </div>
            )}
            {data && data.length > 0 && (
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            tickFormatter={(v) => v.slice(5)}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="count"
                            name="Orders"
                            stroke="#ec4899"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, fill: "#ec4899" }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#8b5cf6"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, fill: "#8b5cf6" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default VendorOrdersOverTimeChart