
import React, { useState } from 'react'
import { HiOutlineUser } from "react-icons/hi";
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlinePhone } from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { HiOutlineCamera } from "react-icons/hi2";
import { useSendOTP, useVerifyOtp } from '../hook/useAuth';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function VendorPersonalInfo({ next, formData, setFormData, isEmailVerified, setIsEmailVerified }) {

    const { t } = useTranslation();
    const [showOtpModal, setShowOtpModal] = useState(false);

    const [previewImage, setPreviewImage] = useState(
        formData.profilePhoto
            ? URL.createObjectURL(formData.profilePhoto)
            : "https://i.pinimg.com/1200x/f9/1f/ba/f91fba046dd5208787a3ffa5c1f299e7.jpg"
    );

    const { mutate: sendOTP, isPending: isSending } = useSendOTP();
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();

    // Input change handler
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contact') {
            setFormData({ ...formData, contact: value.replace(/\D/g, '').slice(0, 10) });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    // image upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profilePhoto: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // handle otp send
    const handleSendOTP = () => {

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return toast.error("Enter a valid email address");
        }

        sendOTP({ email: formData.email, role: 'vendor' }, {
            onSuccess: () => {
                toast.success("OTP sent!");
                setShowOtpModal(true);
            },
            onError: (err) => toast.error(err.response?.data?.message || "Error!")
        });
    };

    // handle otp verify
    const handleVerifyOTP = () => {
        verifyOtp({ email: formData.email, otp: formData.otp, role: 'vendor' }, {
            onSuccess: () => {
                setIsEmailVerified(true);
                setShowOtpModal(false);
                toast.success("OTP Verified");
            },
            onError: (err) => {
                const errorMessage = err.response?.data?.message || "Invalid OTP. Please try again.";
                toast.error(errorMessage);

                // Optional: OTP field ko clear kar dena agar galat ho
                setFormData({ ...formData, otp: '' });
            }
        });
    };

    // submit
    const countinueToBusinessDetail = () => {
        const { name, email, contact, password, confirmPassword, profilePhoto } = formData;

        if (!name.trim()) return toast.error("Name is required");
        if (name.trim().length < 2) return toast.error("Name must be at least 2 characters");

        if (!email.trim()) return toast.error("Email is required");
        if (!isEmailVerified && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email");

        if (!contact.trim()) return toast.error("Contact number is required");
        if (!/^\d{10}$/.test(contact)) return toast.error("Contact must be exactly 10 digits");

        if (!password) return toast.error("Password is required");
        if (password.length < 6) return toast.error("Password must be at least 6 characters");

        if (!confirmPassword) return toast.error("Please confirm your password");
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        if (!isEmailVerified) return toast.error("Please verify your email first");

        if (!profilePhoto) return toast.error("Please upload a profile photo");

        next();
    };

    return (
        <section className="w-full">

            {/* heading */}
            <div className='mb-8 text-center md:text-left'>
                <h1 className='text-xl md:text-2xl font-bold text-gray-800 tracking-tight'>
                    {t('vendorSignup.personalInfo')}
                </h1>

                <div className='w-12 h-1 bg-pink-500 rounded-full mt-1 mx-auto md:ml-0'></div>

                <p className='text-gray-500 text-xs md:text-sm mt-2'>
                    {t('userSignup.subtitle')}
                </p>
            </div>

            {/* vendor image upload */}
            <div className="flex flex-col items-center md:items-start gap-6 pb-6 md:pb-8 border-b border-slate-50 ">
                <div className="relative group">
                    {/* Profile Image Preview */}
                    <img
                        src={previewImage}
                        alt="Profile"
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:opacity-90 transition-all"
                    />

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        id="profilePhoto"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* Upload Button (Camera Icon) */}
                    <label
                        htmlFor="profilePhoto"
                        className="absolute bottom-1 right-1 bg-pink-500 p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:bg-pink-600 hover:scale-110 transition-all border-2 border-white"
                    >
                        <HiOutlineCamera size={18} />
                    </label>
                </div>

                <div className="text-center md:text-left">
                    <h4 className="text-[13px] md:text-sm font-black text-slate-800 uppercase tracking-tight">
                        {t('userSignup.profilePhoto')}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {t('userSignup.photoDesc')}
                    </p>
                </div>
            </div>

            {/* form section */}
            <div className='grid md:grid-cols-2 gap-5 md:gap-6'>

                {/* name */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor="full name"
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('userSignup.fullName')}
                    </label>
                    <div className='relative group'>
                        <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                        <input
                            type="text"
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('userSignup.fullName')}
                            className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                {/* email */}
                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="email" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.email')}</label>
                    <div className='relative group'>
                        <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isEmailVerified}
                            placeholder={t('userSignup.email')}
                            className="w-full pl-10 md:pl-12 pr-20 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                            required
                        />

                        {/* email verify button */}
                        {!isEmailVerified ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendOTP();
                                }}

                                disabled={isSending || !formData.email}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1.5 text-xs md:text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-md md:rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm active:scale-95 cursor-pointer z-20"
                            >
                                {isSending ? (
                                    <span className="flex items-center gap-1">
                                        <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('userSignup.wait')}
                                    </span>
                                ) : t('userSignup.verify')}
                            </button>
                        ) : (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold text-xs flex items-center gap-1 z-20">
                                {t('userSignup.verified')} <HiOutlineBadgeCheck className="text-lg" />
                            </span>
                        )}

                    </div>
                </div>

                {/* mobile num */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor="Mobile Number"
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('userSignup.mobileNumber')}
                    </label>
                    <div className='relative group'>
                        <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                        <input
                            type="text"
                            name='contact'
                            inputMode="numeric"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder={t('userSignup.mobileNumber')}
                            className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                {/* password */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor="password"
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('userSignup.password')}
                    </label>
                    <div className='relative group'>
                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                        <input
                            type="password"
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t('userSignup.password')}
                            className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                {/* confirm password */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor="confirm password"
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('userSignup.confirmPassword')}
                    </label>
                    <div className='relative group'>
                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                        <input
                            type="password"
                            name='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder={t('userSignup.confirmPassword')}
                            className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* btn */}
            <div className="flex justify-end mt-10">
                <button
                    onClick={countinueToBusinessDetail}
                    className="w-full md:w-auto text-[12px] md:text-base bg-pink-500 text-white hover:bg-pink-600 hover:scale-[1.02] md:hover:scale-105 active:scale-95 px-6 md:px-8 py-3 rounded-2xl md:rounded-xl font-bold shadow-lg shadow-pink-200 transition-all cursor-pointer "
                >
                    {t('vendorSignup.continueBtn')}
                </button>
            </div>

            {/* otp popup section */}
            {showOtpModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center transform transition-all scale-100">
                        <h3 className="text-xl font-bold mb-2">
                            {t('userSignup.checkInbox')}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t('userSignup.otpSentTo')} {formData.email}
                        </p>

                        <input
                            type="text"
                            name="otp"
                            maxLength="6"
                            value={formData.otp}
                            onChange={handleChange}
                            disabled={isVerifying}
                            placeholder="000000"
                            className="w-full text-center text-2xl font-mono tracking-widest py-3 border-2 border-pink-100 rounded-2xl focus:border-pink-500 outline-none mb-6"
                        />

                        <button
                            onClick={handleVerifyOTP}
                            disabled={isVerifying || formData.otp.length < 6}
                            className="w-full py-3 bg-pink-500 text-white font-bold rounded-2xl hover:bg-pink-600 transition-all shadow-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('userSignup.verifying')}
                                </span>
                            ) : t('userSignup.confirmOtp')}
                        </button>
                    </div>
                </div>
            )}
        </section>

    )
}

export default VendorPersonalInfo;