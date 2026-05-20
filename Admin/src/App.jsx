
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

function App() {

    const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState("admin-dashboard");

    // Zustand store se token nikalna
    const token = useAdminAuthStore((state) => state.token);

    // Global Toaster yahan rakhein taaki har jagah chale
    const globalToaster = (
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 3000,
                style: {
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                    zIndex: 9999, // Z-index safe side ke liye
                },
            }}
        />
    );

    // Agar token nahi hai, toh sirf Login page dikhao
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

                {/* sidebar call */}
                <div className='flex h-screen overflow-hidden'>
                    <Sidebar
                        collapsed={sideBarCollapsed}
                        onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage} />

                    {/* header call */}
                    <div className='flex-1 flex flex-col overflow-hidden'>
                        <Header
                            sidebarCollapsed={sideBarCollapsed}
                            onToggleSideBar={() => setSideBarCollapsed(!sideBarCollapsed)} 
                            setCurrentPage={setCurrentPage} />

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
                                {currentPage === "transactions" && <Transactions/>}

                                {/* payout request */}
                                {currentPage === "payout-request" && <PayoutRequest/>}

                                {/* customers */}
                                {currentPage === "customers" && <UserList />}

                                {/* reviews */}
                                {currentPage === "review" && <Reviews />}

                            </div>
                        </main>
                    </div>
                </div>

            </div>
        </>
    )
}

export default App;