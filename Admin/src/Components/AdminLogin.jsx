
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";

import useAdminAuthStore from '../store/useAdminAuthStore';
import { useAdminLogin } from '../hooks/useAdminAuth';

const AdminLogin = () => {

    const { mutate: loginAdmin, isPending: isLogging } = useAdminLogin();
    const login = useAdminAuthStore((state) => state.login);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // input handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!formData.email) {
            return toast.error("Please enter an email");
        }

        if (!formData.password) {
            return toast.error("Please enter a password");
        }

        loginAdmin(formData, {
            onSuccess: (res) => {

                if (res.admin && res.token) {
                toast.success(res.message || "Login successful!");
                login(res.admin, res.token);
            } else {
                toast.error("Invalid response from server");
            }
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Login failed");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"></div>

            <div className="relative w-full max-w-lg transform transition-all animate-in fade-in zoom-in duration-300">

                {/* Form Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-white">

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-2xl bg-pink-100 text-pink-600 mb-3">
                            <HiOutlineLockClosed size={28} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
                            Admin <span className="text-pink-600">Login</span>
                        </h2>
                        <p className="text-gray-400 text-xs md:text-sm mt-1 font-medium">
                            Restricted Access
                            </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">
                                Email
                            </label>
                            <div className="relative group">
                                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Password
                                </label>
                            </div>
                            <div className="relative group">
                                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLogging}
                            className={`w-full font-bold py-3.5 rounded-2xl mt-4 shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2
                            ${isLogging
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-100 cursor-pointer"
                                }`}
                        >
                            {isLogging ? "Verifying..." : "Access Dashboard"}
                        </button>
                    </form>

                    {/* Footer Note */}
                    <div className="mt-6 pt- border-t border-gray-50 text-center">
                        <button
                            type="button"
                            className="text-xs font-semibold text-gray-400 hover:text-pink-500 transition-colors"
                        >
                            Facing issues? <span className="text-pink-500 cursor-pointer hover:underline">Contact Support</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;