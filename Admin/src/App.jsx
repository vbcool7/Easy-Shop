
import { useState } from "react";
import AdminLogin from "./Components/AdminLogin";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Dashboard from "./Components/Dashboard";
import Categories from './Components/Categories';
import AddCategory from "./Components/AddCategory";
import SubCategories from './Components/SubCategories';
import AddSubCategory from "./Components/AddSubCategory";

import useAdminAuthStore from "./store/useAdminAuthStore";
import { Toaster } from "react-hot-toast";
import VendorList from "./Components/VendorList";
import Products from "./Components/Products";
import Orders from "./Components/Orders";
import UserList from "./Components/UserList";
import Reviews from "./Components/Reviews";
import Transactions from "./Components/Transactions";
import PayoutRequest from "./Components/PayoutRequest";
import Blogs from "./Components/Blogs";
import AddBlog from "./Components/AddBlog";
import Banners from "./Components/Banners";
import AddBanner from "./Components/AddBanner";
import CmsEditor from "./Components/CmsEditor";
import { useTranslation } from "react-i18next";

function App() {

    const { t } = useTranslation();

    const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState("admin-dashboard");

    // Zustand store se token nikalna
    const token = useAdminAuthStore((state) => state.token);

    const handleToggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setMobileSidebarOpen((prev) => !prev);
        } else {
            setSideBarCollapsed((prev) => !prev);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setMobileSidebarOpen(false);
    };

    // Global Toaster y
    const globalToaster = (
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 3000,
                style: {
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                    zIndex: 9999,
                },
            }}
        />
    );

    // if not token show only login
    if (!token) {
        return (
            <>
                {globalToaster}
                <AdminLogin />
            </>
        );
    }

    return (
        <>
            {globalToaster}

            <div className='min-h-screen bg-[#F5F5F5] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500'>

                {mobileSidebarOpen && (
                    <div
                        onClick={() => setMobileSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    />
                )}

                {/* sidebar call */}
                <div className='flex h-screen overflow-hidden'>
                    <Sidebar
                        collapsed={sideBarCollapsed}
                        mobileOpen={mobileSidebarOpen}
                        onCloseMobile={() => setMobileSidebarOpen(false)}
                        onToggle={handleToggleSidebar}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />

                    {/* header call */}
                    <div className='flex-1 flex flex-col overflow-hidden'>
                        <Header
                            setCurrentPage={setCurrentPage}
                            sidebarCollapsed={sideBarCollapsed}
                            onToggleSideBar={handleToggleSidebar}
                        />

                        <main className='flex overflow-y-auto bg-transparent'>
                            <div className='p-6 space-y-6 w-full'>

                                {/* dashboard */}
                                {currentPage === "admin-dashboard" && <Dashboard setCurrentPage={setCurrentPage} />}

                                {/* vendor list */}
                                {currentPage === "manage-vendors" && <VendorList />}

                                {/* manage categories */}
                                {currentPage === "categories" && <Categories setCurrentPage={setCurrentPage} />}
                                {currentPage === "add-category" && <AddCategory setCurrentPage={setCurrentPage} />}
                                {currentPage === "sub-categories" && <SubCategories setCurrentPage={setCurrentPage} />}
                                {currentPage === "add-sub-category" && <AddSubCategory setCurrentPage={setCurrentPage} />}

                                {/* products */}
                                {currentPage === "all-products" && <Products />}

                                {/* manage blogs */}
                                {currentPage === "blogs" && <Blogs setCurrentPage={setCurrentPage} />}
                                {currentPage === "create-blog" && <AddBlog setCurrentPage={setCurrentPage} />}

                                {/* orders */}
                                {currentPage === "platform-orders" && <Orders />}

                                {/* transactions */}
                                {currentPage === "transactions" && <Transactions />}

                                {/* payout request */}
                                {currentPage === "payout-request" && <PayoutRequest />}

                                {/* customers */}
                                {currentPage === "customers" && <UserList />}

                                {/* reviews */}
                                {currentPage === "review" && <Reviews />}

                                {/* banner management */}
                                {currentPage === "banners" && <Banners setCurrentPage={setCurrentPage} />}
                                {currentPage === "add-banner" && <AddBanner setCurrentPage={setCurrentPage} />}

                                {/* cms pages */}
                                {currentPage === "terms-policy" && <CmsEditor cmsKey="terms_policy" title={t('cmsEditor.termsTitle')} />}
                                {currentPage === "privacy-policy" && <CmsEditor cmsKey="privacy_policy" title={t('cmsEditor.privacyTitle')} />}
                                {currentPage === "delivery-policy" && <CmsEditor cmsKey="delivery_policy" title={t('cmsEditor.deliveryTitle')} />}
                                {currentPage === "exchange-policy" && <CmsEditor cmsKey="exchange_policy" title={t('cmsEditor.exchangeTitle')} />}

                            </div>
                        </main>
                    </div>
                </div>

            </div>
        </>
    )
}

export default App;