
import React, { useState } from 'react'
import { HiOutlineLockClosed } from "react-icons/hi2";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResetPassword } from '../hook/useAuth';
import { useTranslation } from 'react-i18next';

function ResetPassword() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id, token } = useParams();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'user';

    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    const { mutate: resetpass, isPending: isResetting } = useResetPassword();

    // input handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // submit btn
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.password || !formData.confirmPassword) {
            return toast.error("Please fill all fields");
        }

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        resetpass({ ...formData, id, token, role }, {
            onSuccess: (res) => {
                setIsSuccess(true);
            },

            onError: (err) => {
                toast.error(err.response?.data?.message || "Link expired or invalid")
            }
        });
    };

    return (
        <section className="min-h-[70vh] bg-gray-50 py-10 px-4 lg:px-6">
            <div className="max-w-xl mx-auto">

                <div className="bg-pink-50/30 rounded-[30px] shadow-md p-6 md:p-12 border border-gray-100 my-6 md:mt-10">

                    {/* heading */}
                    <div className='mb-8 text-center md:text-left'>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                            {t('resetPassword.title')}
                        </h2>

                        <p className="text-xs md:text-sm mt-2 text-gray-500 ">
                            {t('resetPassword.subtitle')}
                        </p>
                    </div>

                    {/* form */}
                    <div className='space-y-6'>

                        {/* password */}
                        <div className='flex flex-col gap-1.5'>
                            <label
                                htmlFor="password"
                                className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                                {t('resetPassword.newPassword')}
                            </label>
                            <div className='relative group'>
                                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="password"
                                    name='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t('resetPassword.passwordPlaceholder')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* confirm password */}
                        <div className='flex flex-col gap-1.5'>
                            <label
                                htmlFor="confirmPassword"
                                className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                                {t('resetPassword.confirmPassword')}
                            </label>
                            <div className='relative group'>
                                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="password"
                                    name='confirmPassword'
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder={t('resetPassword.confirmPlaceholder')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Requirement Note */}
                        <p className="text-[11px] text-gray-400 ml-1">
                            {t('resetPassword.requirement')}
                        </p>

                        {/* submit */}
                        <div className='md:pt-4 '>
                            <button
                                onClick={handleSubmit}
                                className={`w-full text-xs md:text-sm font-bold py-3 md:py-4 rounded-2xl shadow-lg shadow-pink-100 transition-all active:scale-[0.98] 
                                    ${isResetting ? "text-gray-500 bg-gray-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 text-white cursor-pointer"}
                                    `}
                            >
                                {isResetting ? t('resetPassword.resetting') : t('resetPassword.resetBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* popup section */}
            <div className={`fixed inset-0 z-999 flex items-center justify-center px-4 lg:px-6 transition-all duration-500 
                ${isSuccess ? "opacity-100 visible" : "opacity-0 invisible"}`}>

                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500"
                // onClick={() => setIsSuccess(false)}
                ></div>

                {/* Modal Content */}
                <div className={`relative max-w-md w-full bg-white shadow-2xl rounded-[40px] p-4 md:p-8 text-center space-y-6 transform transition-all duration-500 
                    ${isSuccess ? "translate-y-0 scale-100" : "-translate-y-20 scale-90"}`}>

                    {/* Check Icon */}
                    <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
                        <HiOutlineCheckCircle />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                            {t('resetPassword.allSet')}
                        </h2>
                        <p className="text-gray-500 text-xs md:text-sm px-6 leading-relaxed">
                            {t('resetPassword.successMsg')}
                        </p>
                    </div>

                    {/* Login Button */}
                    <div className="mt-5 md:mt-10">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-1/2 text-xs md:text-sm bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 md:py-4 rounded-2xl shadow-xl shadow-pink-50 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            {t('resetPassword.proceedLogin')}
                        </button>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default ResetPassword;