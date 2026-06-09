
import React, { useEffect, useState } from 'react';
import { HiOutlineCamera } from "react-icons/hi2";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/useAuthStore';
import { useUpdatedEmailVerifyOtp } from '../../hook/useAuth';
import toast from 'react-hot-toast';

function ProfilePersonalForm({ vendorData, onSubmit, isPending }) {

    const { t } = useTranslation();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const vendorId = user?._id || user?.id;

    const { mutate: verifyOtp, isPending: isVerifying } = useUpdatedEmailVerifyOtp();

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [tempEmail, setTempEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [formData, setformData] = useState({
        name: vendorData?.name || "",
        email: vendorData?.email || "",
        phone: vendorData?.contact || "",
    });

    const [profileFile, setProfileFile] = useState(null);
    const [isEditIndex, setIsEditIndex] = useState({});

    const [profileImage, setProfileImage] = useState(vendorData?.profilePhoto || null);

    useEffect(() => {
        if (vendorData) {
            setformData({
                name: vendorData.name || "",
                email: vendorData.email || "",
                phone: vendorData.contact || "",
            });
            setProfileImage(vendorData.profilePhoto || null);
        }
    }, [vendorData]);

    // profile change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    //real time data state me update krna
    const handleInputChange = (e, fieldId) => {
        setformData({ ...formData, [fieldId]: e.target.value });
    };

    // Sirf us specific ID ko toggle karega
    const toggleEdit = (fieldId) => {
        setIsEditIndex(prev => ({
            ...prev, [fieldId]: !prev[fieldId]
        }));
    };

    const handleVerifyOtp = () => {
        if (!otp || otp.length !== 6) return toast.error("Please enter 6-digit OTP");

        verifyOtp({ email: tempEmail, otp, role: 'vendor' }, {
            onSuccess: () => {
                toast.success("Email updated and verified!");
                setShowOtpModal(false);
                setOtp("");
                toggleEdit("email");
                queryClient.invalidateQueries(["vendor", vendorId]);
            },
            onError: (err) => toast.error(err.response?.data?.message || "Invalid OTP")
        });
    };

    // after clicking save, naye data ko finalize karna
    const handleSave = (fieldId) => {

        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("email", formData.email);
        fd.append("contact", formData.phone);

        onSubmit(fd, {
            onSuccess: (res) => {
                if (res.isEmailUpdatePending) {
                    setTempEmail(res.newEmail);
                    setShowOtpModal(true);
                    toast.success("Please verify OTP sent to your new email");
                } else {
                    toggleEdit(fieldId);
                }
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Update failed");
            }
        });
    };

    // Reusable Component for Each Field
    const RenderField = (label, fieldId, type = "text") => {
        const isEditing = isEditIndex[fieldId];

        return (
            <>
                {/* input fields */}
                <div className='flex flex-col gap-1.5 md:gap-2'>

                    <div className='flex flex-row gap-5 items-center'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            {label}
                        </label>

                        <span
                            onClick={() => toggleEdit(fieldId)}
                            className={`text-pink-500 hover:text-pink-600 font-medium text-[13px] md:text-sm cursor-pointer`}>
                            {!isEditing ? t('vendorProfile.editLabel') : t('vendorProfile.cancelLabel')}
                        </span>
                    </div>

                    <div className='flex flex-row gap-5 items-center'>
                        <input
                            type="text"
                            value={formData[fieldId]}
                            onChange={(e) => handleInputChange(e, fieldId)}
                            placeholder="Sohan Sharma"
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
                                className='whitespace-nowrap shrink-0 px-4 md:px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-pink-100'>
                                {isPending ? t('vendorProfile.savingLabel') : t('vendorProfile.saveLabel')}
                            </button>
                        )}

                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            <div className='max-w-100 bg-white dark:bg-slate-900 space-y-6'>

                {/* image fields */}
                <div className="flex flex-col items-center md:items-start gap-6 mb-10 border-b border-slate-50 md:pb-8">
                    <div className="relative group">
                        {/* Profile Image Preview */}
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:opacity-90 transition-all"
                            />
                        ) : (
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-xl">
                                <HiOutlineCamera size={28} className="text-slate-400" />
                            </div>
                        )}

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
                            {t('vendorProfile.profilePhoto')}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                            {t('vendorProfile.photoHint')}
                        </p>

                        {profileFile && (
                            <button
                                onClick={() => {
                                    const fd = new FormData();
                                    fd.append("profilePhoto", profileFile);
                                    onSubmit(fd);
                                    setProfileFile(null);
                                }}
                                disabled={isPending}
                                className="mt-3 px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-pink-100 disabled:opacity-50">
                                {isPending ? t('vendorProfile.savingLabel') : t('vendorProfile.savePhoto')}
                            </button>
                        )}
                    </div>
                </div>

                {/* input fields */}
                {RenderField(t('vendorProfile.fieldFullName'), "name")}
                {RenderField(t('vendorProfile.fieldEmail'), "email", "email")}
                {RenderField(t('vendorProfile.fieldPhone'), "phone")}
            </div>

            {/* bottom section */}
            <div className="mt-12 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="p-2 bg-white rounded-full text-slate-400">
                    <HiOutlineShieldCheck size={20} />
                </div>
                <p className="text-[10px] lg:text-xs text-slate-500 font-medium">
                    {t('vendorProfile.privacyNote')} <span className="text-pink-500 cursor-pointer hover:underline">{t('vendorProfile.privacyLink')}</span>.
                </p>
            </div>

            {/* otp modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md flex flex-col items-center gap-6 my-auto">

                        <div className="text-center w-full">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                                {t('vendorProfile.otpTitle')}
                            </h2>
                            <p className="text-xs md:text-sm text-slate-500 mt-2 wrap-break-word">
                                {t('vendorProfile.otpSubtitle')} <br />
                                <b className="text-slate-700 dark:text-slate-300">{tempEmail}</b>
                            </p>
                        </div>

                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                            placeholder="000000"
                            className="w-full max-w-70 text-center text-2xl md:text-3xl tracking-[10px] md:tracking-[15px] font-bold p-3 border-2 border-slate-200 rounded-2xl focus:border-pink-500 outline-none transition-all"
                        />

                        <div className="flex gap-3 md:gap-4 w-full">
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-sm md:text-base">
                                {t('vendorProfile.otpCancel')}
                            </button>
                            <button
                                onClick={handleVerifyOtp}
                                disabled={isVerifying}
                                className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 disabled:opacity-50 text-sm md:text-base transition-all">
                                {isVerifying ? t('vendorProfile.otpVerifying') : t('vendorProfile.otpVerify')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>

    )
}

export default ProfilePersonalForm;