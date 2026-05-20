
import {
    PieChart, Pie, Cell, Tooltip,
    Legend, ResponsiveContainer
} from "recharts";
import { useVendorOrderStatus } from "../../../hook/useVendor";

// Match exactly the orderStatus values your schema uses
const STATUS_COLORS = {
    Pending:    "#f59e0b",
    Processing: "#ec4899",
    Shipped:    "#6366f1",
    Delivered:  "#10b981",
    Cancelled:  "#ef4444",
};
const FALLBACK = "#d1d5db";

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <div className="bg-white dark:bg-slate-800 border border-pink-100 rounded-xl shadow-lg p-3 text-xs">
            <p className="font-semibold text-slate-600 dark:text-slate-300">{name}</p>
            <p className="text-slate-500">{value} orders</p>
        </div>
    );
};

function VendorOrderStatusChart() {

    const { data, isLoading, isError } = useVendorOrderStatus();

    const chartData = data?.map((item) => ({
        name: item.status,
        value: item.count,
        color: STATUS_COLORS[item.status] ?? FALLBACK,
    }));

    const total = chartData?.reduce((sum, d) => sum + d.value, 0) || 0;

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-all">
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Order Status Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Distribution across all statuses</p>
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
            {chartData && chartData.length === 0 && (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                    No orders yet
                </div>
            )}
            {chartData && chartData.length > 0 && (
                <div className="relative">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={105}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: "12px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centre label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white">
                            {total}
                        </span>
                        <span className="text-xs text-slate-400">Total Orders</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorOrderStatusChart;