
import React, { useEffect, useState } from 'react'
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore';
import { useLogin } from '../hook/useAuth';
import { useCart } from './CartContext';
import { useTranslation } from 'react-i18next';

function Login() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);  // Zustand Action

    const { mergeGuestCartToDB } = useCart();

    const [loginType, setLoginType] = useState('user');
    const { mutate: loginUser, isPending: isLogging } = useLogin();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // input handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };

    // login handler
    const handleLogin = (e) => {
        if (e) e.preventDefault();

        if (!formData.email) {
            return toast.error("Please enter email");
        };

        if (!formData.password) {
            return toast.error("Please enter password");
        };

        loginUser({ ...formData, role: loginType }, {
            onSuccess: async (res) => {
                toast.success(res.message || "Login successful!");

                const userData = res.user || res.vendor;

                if (userData && res.token) {

                    // Zustand store mein user aur token save karein
                    login(userData, res.token);

                    if (userData.role === 'user') {
                        await mergeGuestCartToDB();
                    }

                    // role check 
                    const targetPath = userData.role === 'vendor' ? "/vendor_dashboard" : "/";
                    navigate(targetPath);
                }
            },

            onError: (err) =>
                toast.error(err.response?.data?.message || "Invalid Credentials")
        });
    };

    // signup handler
    const handleAccount = () => {
        if (loginType === 'user') {
            navigate("/user_signup");
        } else {
            navigate("/vendor_signup")
        }
    };

    return (
        <section className="min-h-[70vh] bg-gray-50 py-10 px-4 lg:px-6">

            {/* tabs */}
            <div className="max-w-md mx-auto bg-white rounded-2xl md:rounded-3xl p-1.5 mb-8 shadow-sm border border-gray-50">
                
                <div className="grid grid-cols-2 bg-gray-100 rounded-xl md:rounded-2xl p-1 gap-1">
                    <button
                        onClick={() => setLoginType("user")}
                        className={`w-full py-3 md:py-3 rounded-lg md:rounded-xl text-[11px] min-[375px]:text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-normal tracking-tight px-1 text-center flex items-center justify-center min-h-11
                    ${loginType === 'user' ? 'bg-white text-pink-500 shadow-sm scale-[1.01]' : 'text-gray-500 hover:text-pink-400'}`}
                    >
                        {t('login.userLogin')}
                    </button>

                    <button
                        onClick={() => setLoginType("vendor")}
                        className={`w-full py-3 md:py-3 rounded-lg md:rounded-xl text-[11px] min-[375px]:text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-normal tracking-tight px-1 text-center flex items-center justify-center min-h-11
                    ${loginType === 'vendor' ? 'bg-white text-pink-500 shadow-sm scale-[1.01]' : 'text-gray-500 hover:text-pink-400'}`}
                    >
                        {t('login.vendorLogin')}
                    </button>
                </div>
            </div>

            {/* Form Container */}
            <div className='max-w-xl mx-auto bg-pink-50/30 rounded-xl md:rounded-[30px] shadow-md p-6 md:p-12 border border-gray-100 mt-10'>
                <div className='space-y-6'>

                    {/* Email Field */}
                    <div className='flex flex-col gap-1.5'>
                        <label
                            htmlFor='email'
                            className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                            {t('login.emailAddress')}
                        </label>
                        <div className='relative group'>
                            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />
                            <input
                                type="email"
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('login.email')}
                                className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className='flex flex-col gap-1.5'>
                        <div className="flex justify-between items-center px-1">
                            <label
                                htmlFor='password'
                                className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                                {t('login.password')}
                            </label>

                            {/* forgot button */}
                            <button
                                onClick={() => navigate(`/forgot_password?role=${loginType}`)}
                                className="text-xs font-bold text-pink-500 hover:text-pink-600 cursor-pointer">
                                {t('login.forgot')}
                            </button>

                        </div>
                        <div className='relative group'>
                            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />
                            <input
                                type="password"
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t('login.password')}
                                className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={isLogging}
                        className={`w-full  font-bold py-3 md:py-4 rounded-2xl mt-4 shadow-lg shadow-pink-100 transition-all active:scale-[0.98] cursor-pointer
                            ${isLogging ? "text-gray-500 bg-gray-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 text-white"}`}
                    >
                        {isLogging ?
                            (<span className="animate-pulse">{t('login.checkingCredentials')}</span>) :
                            (loginType === 'user' ? t('login.startShopping') : t('login.accessDashboard'))
                        }
                    </button>

                    {/* Signup Link */}
                    <p
                        onClick={handleAccount}
                        className="text-center text-sm text-gray-500 mt-3 md:mt-6">
                        {t('login.dontHaveAccount')}
                        <button className="ml-1 font-bold text-pink-500 hover:underline cursor-pointer">
                            {loginType === 'user' ? t('login.signUp') : t('login.registerAsVendor')}
                        </button>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login;