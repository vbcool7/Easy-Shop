
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./Pages/HomePage";
import ProductsPage from "./Pages/ProductsPage";
import ProductDetail from "./Components/ProductDetail";
import AboutUs from "./Components/AboutUs";
import ContactUs from "./Components/ContactUs";
import AccountType from "./Components/AccountType";
import VendorSignupPage from "./Pages/VendorSignUpPage";
import ScrollToTop from "./Components/ScrollToTop";
import Login from "./Components/Login";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import UserSignUp from "./Components/UserSignUp";
import WishList from "./Components/WishList";
import CartItem from "./Components/CartItem";
import Blog from "./Components/Blog";
import BlogDetail from "./Components/BlogDetail";
import FAQs from "./Components/FAQs";
import PolicyTerms from "./Components/PolicyTerms";
import PolicyPrivacy from "./Components/PolicyPrivacy";
import PolicyDelivery from "./Components/PolicyDelivery";
import PolicyExchange from "./Components/PolicyExchange";
import PlaceOrderForm from "./Components/PlaceOrderForm";
import MyOrders from "./Components/MyOrders";
import ReviewRating from "./Components/ReviewRating";
import OrderTracker from "./Components/OrderTracker";
import VendorPage from "./Pages/VendorPage";
import UserLayout from "./Layouts/UserLayout";
import VendorLayout from "./Layouts/VendorLayout";
import ProfileLayout from "./Components/VendorComponents/ProfileLayout";
import UserProfileLayout from "./Components/UserProfileComponents/UserProfileLayout";
import VendorShop from "./Components/VendorShop";
import SearchResults from "./Components/SearchResults";

function App() {

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'sans-serif',
            fontSize: '14px',
          },
        }}
      />

      <Routes>

        {/* user side */}
        <Route element={<UserLayout />}>

          <Route path="/" element={<HomePage />} />
          <Route path="/about_us" element={<AboutUs />} />
          <Route path="/contact_us" element={<ContactUs />} />
          <Route path="/all_products" element={<ProductsPage />} />
          <Route path="/all_products/:catId/:catName" element={<ProductsPage />} />
          <Route path="/product_detail/:prodId/:prodName" element={<ProductDetail />} />
          <Route path="/account_type" element={<AccountType />} />
          <Route path="/vendor_signup" element={<VendorSignupPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route path="/reset_password/:id/:token" element={<ResetPassword />} />
          <Route path="/user_signup" element={<UserSignUp />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/cart" element={<CartItem />} />
          <Route path="/place_order" element={<PlaceOrderForm />} />
          <Route path="/my_orders" element={<MyOrders />} />
          <Route path="/order_track/:orderId" element={<OrderTracker />} />
          <Route path="/review_rating/:orderId/:productId" element={<ReviewRating />} />
          <Route path="/shop/:vendorId" element={<VendorShop/>} />
          <Route path="/search" element={<SearchResults/>} />
          
          {/* redirect from cart */}
          <Route path="/product_detail/:prodId" element={<ProductDetail />} />

          <Route path="/blog" element={<Blog />} />
          <Route path="/blog_detail/:blogId" element={<BlogDetail />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/terms_policy" element={<PolicyTerms />} />
          <Route path="/privacy_policy" element={<PolicyPrivacy />} />
          <Route path="/delivery_policy" element={<PolicyDelivery />} />
          <Route path="/exchange_policy" element={<PolicyExchange />} />

          <Route path="/user_profile" element={<UserProfileLayout />} />
        </Route>

        {/* vendor side */}
        <Route element={<VendorLayout />}>
          <Route path="/vendor_dashboard" element={<VendorPage />} />
        </Route>
        
        <Route path="/vendor_profile" element={<ProfileLayout />} />
        
      </Routes>
    </>
  )
}

export default App;