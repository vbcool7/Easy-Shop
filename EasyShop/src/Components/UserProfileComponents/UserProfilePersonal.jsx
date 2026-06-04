
import React, { useEffect, useState } from 'react';
import { HiOutlineCamera } from "react-icons/hi2";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useUpdatedEmailVerifyOtp } from '../../hook/useAuth';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

function UserProfilePersonal({ userData, onSubmit, isPending }) {

    const { t } = useTranslation();
    const { user } = useAuthStore();

    const queryClient = useQueryClient();
    const userId = user?._id || user?.id;

    const { mutate: verifyOtp, isPending: isVerifying } = useUpdatedEmailVerifyOtp();

    const [isEditIndex, setIsEditIndex] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [tempEmail, setTempEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [formData, setFormdata] = useState({
        name: "",
        email: "",
        contact: "",
        address: "",
        city: "",
        pincode: "",
        state: ""
    });

    // get data
    useEffect(() => {
        if (userData) {
            setFormdata({
                name: userData.name || "",
                email: userData.email || "",
                contact: userData.contact || "",
                address: userData.address || "",
                city: userData.city || "",
                pincode: userData.pincode || "",
                state: userData.state || ""
            });
            setProfileImage(userData.profilePhoto || null);
        }
    }, [userData]);

    // input handler
    const handleInputChange = (e, fieldId) => {
        setFormdata({ ...formData, [fieldId]: e.target.value })
    };

    // toggle
    const toggleEdit = (fieldId) => {
        setIsEditIndex(prev => ({
            ...prev, [fieldId]: !prev[fieldId]
        }));
    };

    // save
    const handleSave = (fieldId) => {
        const fd = new FormData();
        fd.append(fieldId, formData[fieldId]);

        onSubmit(fd, {
            onSuccess: (res) => {
                if (res.isEmailUpdatePending) {
                    setTempEmail(res.newEmail);
                    setShowOtpModal(true);
                    toast.success("Please verify OTP sent to your new email");
                } else {
                    toggleEdit(fieldId);
                    // toast.success("Updated successfully");
                }
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Update failed");
            }
        });
    };

    // image upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);

            const fd = new FormData();
            fd.append("profilePhoto", file);
            onSubmit(fd);
        }
    };

    // otp handler
    const handleVerifyOtp = () => {
        if (!otp || otp.length !== 6) return toast.error("Please enter 6-digit OTP");

        verifyOtp({ email: tempEmail, otp }, {
            onSuccess: () => {
                toast.success("Email updated and verified!");
                setShowOtpModal(false);
                setOtp("");
                toggleEdit("email");
                queryClient.invalidateQueries(["user", userId]);
            },
            onError: (err) => toast.error(err.response?.data?.message || "Invalid OTP")
        });
    };

    const RenderField = (label, fieldId, type = "text") => {
        const isEditing = isEditIndex[fieldId];

        return (
            <div className='flex flex-col gap-1.5 md:gap-2'>
                <div className='flex flex-row gap-5 items-center'>
                    <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                        {label}
                    </label>
                    <span
                        onClick={() => toggleEdit(fieldId)}
                        className='text-pink-500 hover:text-pink-600 font-medium text-[13px] md:text-sm cursor-pointer'>
                        {!isEditing ? t('userProfile.edit') : t('userProfile.cancel')}
                    </span>
                </div>
                <div className='flex flex-row gap-4 md:gap-5 items-center'>
                    <input
                        type={type}
                        value={formData[fieldId]}
                        onChange={(e) => handleInputChange(e, fieldId)}
                        disabled={!isEditing}
                        className={`min-w-0 flex-1 p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border transition-all text-sm outline-none
                            ${!isEditing
                                ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed'
                                : 'bg-white border-slate-200 focus:ring-1 focus:ring-pink-500 text-slate-800 shadow-sm'
                            }`}
                    />
                    {isEditing && (
                        <button
                            onClick={() => handleSave(fieldId)}
                            disabled={isPending}
                            className='whitespace-nowrap shrink-0 px-4 md:px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-pink-100 disabled:opacity-50'>
                            {isPending ? t('userProfile.saving') : t('userProfile.save')}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className='w-full bg-white dark:bg-slate-900 space-y-6'>

                {/* image section */}
                <div className="flex flex-col items-center md:items-start gap-6 mb-10 md:pb-2 border-b border-slate-50">
                    <div className="relative group">
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl"
                            />
                        ) : (
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-xl">
                                <HiOutlineCamera size={28} className="text-slate-400" />
                            </div>
                        )}
                        <input type="file" id="profilePic" hidden accept="image/*" onChange={handleFileChange} />
                        <label
                            htmlFor="profilePic"
                            className="absolute bottom-1 right-1 bg-pink-500 p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:bg-pink-600 hover:scale-110 transition-all border-2 border-white">
                            <HiOutlineCamera size={18} />
                        </label>
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-[13px] md:text-sm font-black text-slate-800 uppercase tracking-tight">
                            {t('userProfile.photoTitle')}
                            </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                            {t('userProfile.photoHint')}
                            </p>
                    </div>
                </div>

                {/* input fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {RenderField(t('userProfile.fieldName'), "name")}
                    {RenderField(t('userProfile.fieldEmail'), "email", "email")}
                    {RenderField(t('userProfile.fieldPhone'), "contact")}
                    <div className="lg:col-span-2">{RenderField("Address", "address")}</div>
                    {RenderField(t('userProfile.fieldCity'), "city")}
                    {RenderField(t('userProfile.fieldPinCode'), "pincode")}
                    {RenderField(t('userProfile.fieldState'), "state")}
                </div>

                {/* footer */}
                <div className="mt-12 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="p-2 bg-white rounded-full text-slate-400">
                        <HiOutlineShieldCheck size={20} />
                    </div>
                    <p className="text-[10px] lg:text-xs text-slate-500 font-medium">
                        {t('userProfile.privacyText')} <span className="text-pink-500 cursor-pointer hover:underline">{t('userProfile.privacyLink')}</span>.
                    </p>
                </div>
            </div>

            {/* OTP Modal — structure same */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center gap-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {t('userProfile.otpTitle')}
                                </h2>
                            <p className="text-sm text-slate-500 mt-2">
                                {t('userProfile.otpSubtitle')} <br /><b>{tempEmail}</b>
                                </p>
                        </div>
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000000"
                            className="w-full text-center text-3xl tracking-[15px] font-bold p-3 border-2 border-slate-200 rounded-2xl focus:border-pink-500 outline-none transition-all"
                        />
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                                {t('userProfile.otpCancel')}
                            </button>
                            
                            <button
                                onClick={handleVerifyOtp}
                                disabled={isVerifying}
                                className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 disabled:opacity-50">
                                {isVerifying ? t('userProfile.otpVerifying') : t('userProfile.otpVerify')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserProfilePersonal;