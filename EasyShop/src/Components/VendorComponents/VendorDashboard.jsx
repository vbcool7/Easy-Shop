
import React, { useEffect, useState } from 'react';
import EasyShopLoader from '../EasyShopLoader';
import RecentOrderTable from './RecentOrderTable';
import AnalyticsSplit from './AnalyticsSplit';
import DashboardChatIcon from './DashboardChatIcon';
import VendorDashboardStats from './DashboardCharts/VendorDashboardStats';
import VendorOrdersOverTimeChart from './DashboardCharts/VendorOrdersOverTimeChart';
import VendorOrderStatusChart from './DashboardCharts/VendorOrderStatusChart';
import VendorTopProductsChart from './DashboardCharts/VendorTopProductsChart';

function VendorDashboard({ setCurrentPage }) {

  const [loading, setLoading] = useState(true);

  // loader
  useEffect(() => {
    // Fake timer or real API call
    setTimeout(() => setLoading(false), 2000);
  }, []);

  // if (loading) return <EasyShopLoader />;

  return (
    <>
      <div className='space-y-8'>
        <VendorDashboardStats />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">
            <VendorOrdersOverTimeChart />
          </div>
          <div className="lg:col-span-1">
            <VendorOrderStatusChart />
          </div>
        </div>

        {/* Top Products Bar Chart  */}
        <VendorTopProductsChart />

        <RecentOrderTable setCurrentPage={setCurrentPage} />
        <AnalyticsSplit setCurrentPage={setCurrentPage} />
      </div>

      <DashboardChatIcon setCurrentPage={setCurrentPage} />
    </>
  )
}

export default VendorDashboard;