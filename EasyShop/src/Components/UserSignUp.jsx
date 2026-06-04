
import React, { useState } from 'react'
import { HiOutlineUser } from "react-icons/hi";
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlinePhone } from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { FaCheckCircle } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaCity } from "react-icons/fa";
import { FaMapPin } from "react-icons/fa";
import { FaMapMarkedAlt } from "react-icons/fa";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { HiOutlineCamera } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

import { useSendOTP, useSignup, useVerifyOtp } from '../hook/useAuth';
import useAuthStore from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';

function UserSignUp() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState("https://i.pinimg.com/1200x/f9/1f/ba/f91fba046dd5208787a3ffa5c1f299e7.jpg"); // Preview ke liye

    const { mutate: sendOTP, isPending: isSending } = useSendOTP();
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
    const { mutate: signupUser, isPending: isRegistering } = useSignup();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        otp: ''
    });

    // login from Zustand store 
    const login = useAuthStore((state) => state.login);

    // Input change handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // image upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {

            // Clean up the old URL to prevent memory leaks
            if (previewImage) URL.revokeObjectURL(previewImage);

            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Yeh turant dikhega
        }
    };

    // handle otp send
    const handleSendOTP = () => {
        sendOTP({ email: formData.email, role: 'user' }, {
            onSuccess: () => {
                toast.success("OTP sent!");
                setShowOtpModal(true);
            },
            onError: (err) => toast.error(err.response?.data?.message || "Error!")
        });
    };

    // handle otp verify
    const handleVerifyOTP = () => {
        verifyOtp({ email: formData.email, otp: formData.otp, role: 'user' }, {
            onSuccess: () => {
                setIsEmailVerified(true);
                setShowOtpModal(false);
                toast.success("OTP Verified!");
            },
            onError: (err) => {
                const errorMessage = err.response?.data?.message || "Invalid OTP. Please try again.";
                toast.error(errorMessage);

                // Optional: clear otp field if wrong
                setFormData({ ...formData, otp: '' });
            }
        });
    };

    // submit
    const handleCreateAccount = () => {

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords does not match");
        }

        if (!isEmailVerified) {
            return toast.error("Please verify your email first");
        }

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("contact", formData.contact);
        data.append("password", formData.password);
        data.append("address", formData.address);
        data.append("city", formData.city);
        data.append("pincode", formData.pincode);
        data.append("state", formData.state);
        data.append("otp", formData.otp);

        if (selectedFile) {
            data.append("profilePhoto", selectedFile);
        }

        signupUser(data, {
            onSuccess: (res) => {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ec4899', '#f472b6', '#db2777']
                });

                // Zustand store - token store 
                login(res.user, res.token);
                setIsSubmitOpen(true);
                setFormData({ name: '', email: '', contact: '', password: '', confirmPassword: '', address: '', city: '', pincode: '', state: '', otp: '' });
            },
            onError: (err) => toast.error(err.response?.data?.message || "Failed in signup")
        });
    };

    return (
        <section className="w-full min-h-[70vh] bg-gray-50 py-10 px-4 lg:px-6">
            <div className="max-w-4xl mx-auto ">

                <div className="bg-pink-50/30 rounded-[30px] shadow-md p-6 md:p-12 border border-gray-100 my-6 md:mt-10">

                    {/* heading */}
                    <div className='mb-8 text-center md:text-left'>
                        <h1 className='text-xl md:text-2xl font-bold text-gray-800 tracking-tight'>
                            {t('userSignup.title')}
                        </h1>

                        <div className='w-12 h-1 bg-pink-500 rounded-full mt-1 mx-auto md:ml-0'></div>

                        <p className='text-gray-500 text-xs md:text-sm mt-2'>
                            {t('userSignup.subtitle')}
                        </p>
                    </div>

                    {/* user image upload */}
                    <div className="flex flex-col items-center md:items-start gap-6 pb-6 md:pb-8 border-b border-slate-50">
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

                    {/* form detail */}
                    <div className='grid md:grid-cols-2 gap-5 md:gap-6'>

                        {/* name */}
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor="full name" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.fullName')}</label>
                            <div className='relative group'>
                                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="text"
                                    name="name"
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
                                            e.stopPropagation(); // Click event ko upar jaane se roko
                                            console.log("Verify Clicked!");
                                            handleSendOTP();
                                        }}
                                        // Agar email nahi hai ya loading hai toh disable
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
                            <label htmlFor="Mobile Number" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.mobileNumber')}</label>
                            <div className='relative group'>
                                <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="text"
                                    name="contact"
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
                            <label htmlFor="password" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.password')}</label>
                            <div className='relative group'>
                                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="password"
                                    name="password"
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
                            <label htmlFor="confirm password" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.confirmPassword')}</label>
                            <div className='relative group'>
                                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder={t('userSignup.confirmPassword')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* address */}
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor="address" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.address')}</label>
                            <div className='relative group'>
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder={t('userSignup.address')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* city */}
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor="city" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.city')}</label>
                            <div className='relative group'>
                                <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder={t('userSignup.city')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* pincode */}
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor="pincode" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.pinCode')}</label>
                            <div className='relative group'>
                                <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder={t('userSignup.pinCode')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* state */}
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor="state" className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('userSignup.state')}</label>
                            <div className='relative group'>
                                <FaMapMarkedAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl group-focus-within:text-pink-500 transition-colors" />

                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder={t('userSignup.state')}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* button */}
                    <div className="flex justify-end mt-10">
                        <button
                            onClick={handleCreateAccount}
                            disabled={isRegistering || !isEmailVerified}
                            className={`w-full md:w-auto text-sm md:text-base bg-pink-500 text-white px-8 py-3 rounded-2xl md:rounded-xl font-bold shadow-lg shadow-pink-200 transition-all cursor-pointer 
                                ${(isRegistering || !isEmailVerified) ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-600 hover:scale-[1.02] md:hover:scale-105 active:scale-95"}
                            `}
                        >
                            {isRegistering ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('userSignup.creating')}
                                </span>
                            ) : t('userSignup.createAccount')}
                        </button>
                    </div>

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
                                disabled={isVerifying || formData.otp.length < 6} // Button lock logic
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

                {/* Success Popup Section */}
                <div
                    className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-100 px-4 transition-all duration-500 
                    ${isSubmitOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                >
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsSubmitOpen(false)}
                    ></div>
                    <div
                        className={`bg-white rounded-3xl p-8 md:p-10 shadow-2xl text-center max-w-sm w-full transition-all duration-500 transform 
                        ${isSubmitOpen ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}
                    >
                        {/* Animated Check Icon */}
                        <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                            <FaCheckCircle />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {t('userSignup.success')}
                        </h2>
                        <p className="text-gray-500 mb-8">
                            {t('userSignup.successDesc')}
                            <span className="text-pink-500 font-semibold">Easy</span>!
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all active:scale-95 cursor-pointer"
                        >
                            {t('userSignup.startShopping')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UserSignUp