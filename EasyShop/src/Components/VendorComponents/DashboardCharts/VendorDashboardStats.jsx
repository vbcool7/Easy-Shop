
import React from 'react';
import { HiOutlineCurrencyRupee, HiOutlineShoppingBag, HiOutlineCube, HiOutlineStar } from "react-icons/hi";
import CountUp from 'react-countup';

import {useVendorStats} from '../../../hook/useVendor';

function VendorDashboardStats() {
    
    const { data: stats, isLoading, isError } = useVendorStats();

    const cardItems = [
        {
            id: 1,
            title: "Total Revenue",
            para: "Overall earnings from successful sales.",
            icon: <HiOutlineCurrencyRupee />,
            value: stats?.totalRevenue || 0, // Dynamic Value
            growth: "+12.5%", 
            color: "bg-pink-500"
        },
        {
            id: 2,
            title: "Total Products", // Updated from Total Orders to match your API
            para: "Total number of products in your inventory.",
            icon: <HiOutlineShoppingBag />,
            value: stats?.totalProds || 0, // Dynamic Value
            growth: "+8.2%",
            color: "bg-blue-500"
        },
        {
            id: 3,
            title: "Approved Products",
            para: "Products currently live in your store.",
            icon: <HiOutlineCube />,
            value: stats?.activeProds || 0, // Dynamic Value
            growth: "Live",
            color: "bg-purple-500"
        },
        {
            id: 4,
            title: "Average Rating",
            para: "Overall customer satisfaction score.",
            icon: <HiOutlineStar />,
            value: stats?.avgRating || 0, // Dynamic Value
            growth: "Top Rated",
            color: "bg-amber-500"
        },
    ];

    if (isLoading) return <div className="py-10 text-center text-slate-500">Loading Stats...</div>;
    if (isError) return <div className="py-10 text-center text-red-500">Failed to load statistics.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
            {cardItems.map((card) => (
                <div
                    key={card.id}
                    className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-all"
                >
                    {/* Icons and Growth */}
                    <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl text-white shadow-md ${card.color}`}>
                            <div className='w-6 h-6 text-2xl'>{card.icon}</div>
                        </div>

                        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                            {card.growth}
                        </span>
                    </div>

                    {/* Title, Value, Para */}
                    <div className="mt-4">
                        <h3 className="text-slate-500 text-sm font-medium">
                            {card.title}
                        </h3>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {card.id === 1 ? "₹" : ""}
                            <CountUp
                                start={0}
                                end={card.value}
                                duration={1.5}
                                decimals={card.id === 4 ? 1 : 0} // Show decimals only for Rating
                                separator=","
                            />
                        </h2>

                        <p className="text-xs text-slate-400 mt-1">
                            {card.para}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default VendorDashboardStats;