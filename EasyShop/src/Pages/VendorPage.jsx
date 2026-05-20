
import React, { useState } from 'react';
import VendorDashboard from '../Components/VendorComponents/VendorDashboard';
import VendorSidebar from '../Components/VendorComponents/VendorSidebar';
import Header from '../Components/VendorComponents/Header';
import AllProducts from '../Components/VendorComponents/AllProducts';
import AddNewProduct from '../Components/VendorComponents/AddNewProduct';
import VendorStockInventoryPage from './VendorStockInventoryPage';
import Orders from '../Components/VendorComponents/Orders';
import Transactions from '../Components/VendorComponents/Transactions';
import Withdrawals from '../Components/VendorComponents/Withdrawals';
import Customers from '../Components/VendorComponents/Customers';
import ReviewRating from '../Components/VendorComponents/ReviewRating';
import DiscountOffer from '../Components/VendorComponents/DiscountOffer';
import AddCoupon from '../Components/VendorComponents/AddCoupon';
import HomeBannerCMS from '../Components/VendorComponents/HomeBannerCMS';
import FooterCMS from '../Components/VendorComponents/FooterCMS';
import ShopPolicyCMS from '../Components/VendorComponents/ShopPolicyCMS';
import VendorChat from '../Components/VendorComponents/VendorChat';
import Blogs from '../Components/VendorComponents/Blogs';
import AddBlog from '../Components/VendorComponents/AddBlog';

function VendorPage() {
    const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState("Vendor Dashboard");

    return (
        <div className='min-h-screen bg-[#F5F5F5]
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500'>

            {/* sidebar call */}
            <div className='flex h-screen overflow-hidden'>
                <VendorSidebar
                    collapsed={sideBarCollapsed}
                    onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage} />

                {/* header call */}
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <Header
                        sidebarCollapsed={sideBarCollapsed}
                        onToggleSideBar={() => setSideBarCollapsed(!sideBarCollapsed)} />

                    <main className='flex overflow-y-auto bg-transparent'>
                        <div className='p-6 space-y-6 w-full'>

                            {/* dashboard */}
                            {currentPage === "Vendor Dashboard" && <VendorDashboard setCurrentPage={setCurrentPage}/>}

                            {/* products management */}
                            {currentPage === "All Products" && <AllProducts setCurrentPage={setCurrentPage} />}
                            {currentPage === "Add Product" && <AddNewProduct setCurrentPage={setCurrentPage}/>}
                            {currentPage === "Inventory" && <VendorStockInventoryPage setCurrentPage={setCurrentPage}/>}
                            
                            {/* blog management */}
                            {currentPage === "blogs" && <Blogs setCurrentPage={setCurrentPage} />}
                            {currentPage === "create-blog" && <AddBlog setCurrentPage={setCurrentPage} />}

                            {/* orders */}
                            {currentPage === "Orders" && <Orders />}

                            {/* earning and payout */}
                            {currentPage === "Transactions" && <Transactions />}
                            {currentPage === "Withdrawals" && <Withdrawals />}

                            {/* customer */}
                            {currentPage === "Customers" && <Customers />}

                            {/* chat */}
                            {currentPage === "Messages" && <VendorChat  />}

                            {/* review ratung */}
                            {currentPage === "Review" && <ReviewRating />}

                            {/* discount and offer */}
                            {currentPage === "Promotions" && <DiscountOffer setCurrentPage={setCurrentPage}/>}
                            {currentPage === "Add Coupon" && <AddCoupon setCurrentPage={setCurrentPage}/>}

                            {/* shop setting */}
                            {currentPage === "Hero CMS" && <HomeBannerCMS />}
                            {currentPage === "Footer CMS" && <FooterCMS />}
                            {currentPage === "Shop Policy" && <ShopPolicyCMS />}
                            
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default VendorPage;