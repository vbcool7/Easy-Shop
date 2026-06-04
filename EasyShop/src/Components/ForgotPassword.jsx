
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import toast from 'react-hot-toast';

import { useForgotPassword } from '../hook/useAuth';
import { useTranslation } from 'react-i18next';

function ForgotPassword() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'user';

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [timer, setTimer] = useState(0);
    const [email, setEmail] = useState("");

    const { mutate: forgotPass, isPending: isForgettingPass } = useForgotPassword();

    // submit btn
    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!email) {
            return toast.error("Please enter email");
        }

        forgotPass({ email, role }, {
            onSuccess: (res) => {

                setIsSubmitted(true);
                setTimer(60); // Pehli baar success par timer start karein

            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Something went wrong")
            }
        });
    };

    // timer for resend btn
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() =>
                setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // resend btn
    const handleResend = () => {

        // Check karein agar pehle se request ja rahi hai
        if (isForgettingPass) return;

        setTimer(60);

        forgotPass({ email, role }, {
            onSuccess: (res) => {

                toast.success("New reset link sent successfully!");
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Failed to resend link");
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
                            {role === 'vendor'
                                ? t('forgotPassword.vendorRecovery')
                                : t('forgotPassword.userRecovery')
                            }
                        </h2>
                        <p className="text-xs md:text-sm mt-2 text-gray-500 ">
                            {t('forgotPassword.enterEmailDesc')}
                        </p>
                    </div>

                    {/* form */}
                    <div className='space-y-6'>

                        {/* email */}
                        <div className='flex flex-col gap-1.5'>
                            <label
                                htmlFor='email'
                                className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                                {t('forgotPassword.emailLabel')}
                            </label>
                            <div className='relative group'>
                                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    type="email"
                                    name='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('forgotPassword.emailPlaceholder')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* buttons */}
                        <div className='flex flex-col md:flex-row gap-4 pt-4'>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full order-2 md:order-1 text-sm md:text-base bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 md:py-4 rounded-2xl shadow-lg shadow-pink-100 transition-all active:scale-[0.98] cursor-pointer"
                            >
                                {t('forgotPassword.backToLogin')}
                            </button>

                            <button
                                onClick={() => handleSubmit()}
                                disabled={isForgettingPass}
                                className={`w-full order-1 md:order-2 text-sm md:text-base  font-bold py-3 md:py-4 rounded-2xl shadow-lg shadow-pink-100 transition-all active:scale-[0.98] 
                                    ${isForgettingPass ? "text-gray-500 bg-gray-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 text-white cursor-pointer"}
                                    `}
                            >
                                {isForgettingPass ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* popup section */}
            {isSubmitted && (
                <div className="fixed inset-0 z-999 flex items-center justify-center px-4 lg:px-6">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                    // onClick={() => setIsSubmitted(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative max-w-md w-full bg-white shadow-2xl rounded-4xl p-4 md:p-8 text-center space-y-6 transform transition-all animate-in fade-in zoom-in duration-300">

                        {/* Check Icon */}
                        <div className="w-22 h-22 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 ">
                            <HiOutlineCheckCircle />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl md:text-3xl font-medium text-slate-800 tracking-tight">
                                {t('forgotPassword.checkEmail')}
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed px-2">
                                {t('forgotPassword.sentLinkTo')} <br />
                                <span className="font-bold text-slate-700 underline decoration-pink-200 decoration-4 underline-offset-2">{email}</span>
                            </p>
                        </div>

                        <div className="pt-4 space-y-3 border-t border-slate-50">
                            <p className="text-xs text-slate-400">
                                {t('forgotPassword.didNotReceive')}
                            </p>

                            <button
                                onClick={handleResend}
                                disabled={timer > 0 || isForgettingPass}
                                className={`text-sm font-black transition-colors uppercase tracking-wider 
                                    ${(timer > 0 || isForgettingPass) ? 'text-gray-400 cursor-not-allowed' : 'text-pink-500 hover:text-pink-600 cursor-pointer '
                                    }`}>
                                {isForgettingPass
                                    ? t('forgotPassword.sending') :
                                    timer > 0
                                        ? t('forgotPassword.resendIn', { timer })
                                        : t('forgotPassword.resendLink')
                                }
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200 cursor-pointer text-sm"
                        >
                            {t('forgotPassword.backToLogin')}
                        </button>
                    </div>
                </div>
            )
            }
        </section>
    )
}

export default ForgotPassword;