
import React, { useEffect, useState } from 'react';
import AdminDashboardStats from './DashboardCharts/AdminDashboardStats';
import OrdersOverTimeChart from './DashboardCharts/OrdersOverTimeChart';
import OrderStatusChart from './DashboardCharts/OrderStatusChart';
import RevenueByPaymentChart from './DashboardCharts/RevenueByPaymentChart';
import TopProductsChart from './DashboardCharts/TopProductsChart';

function Dashboard({ setCurrentPage }) {

    return (
        <>
            <div className='space-y-8'>

                {/* Stat Cards */}
                <AdminDashboardStats />

                {/* Line Chart */}
                <OrdersOverTimeChart />

                {/* Donut + Bar - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <OrderStatusChart />
                    <RevenueByPaymentChart />
                </div>

                {/* top products */}
                <TopProductsChart />

            </div>
        </>
    )
}

export default Dashboard;