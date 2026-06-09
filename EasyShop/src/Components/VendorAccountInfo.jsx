
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { RxCross2 } from "react-icons/rx";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import confetti from 'canvas-confetti';
import { useVendorSignup } from '../hook/useAuth';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function VendorAccountInfo({ prev, formData, setFormData }) {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [checkedTerms, setCheckedTerms] = useState(false);
    const [checkedAgreement, setCheckedAgreement] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);
    const [isAggrementOpen, setIsAggrementOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { mutate: signupVendor, isPending: isRegistering } = useVendorSignup();

    const login = useAuthStore((state) => state.login);

    // input handler
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'accNumber') {
            setFormData({ ...formData, accNumber: value.replace(/\D/g, '').slice(0, 18) });
            return;
        }

        if (name === 'ifsc') {
            setFormData({ ...formData, ifsc: value.toUpperCase().slice(0, 11) });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    //common for all uploads
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    // validation
    const required =
        formData.accHolder &&
        formData.bank &&
        formData.accNumber &&
        formData.ifsc &&
        formData.bankDocumentUpload &&
        checkedTerms &&
        checkedAgreement;

    // empty i/p fields on submit
    const initialVendorState = {
        name: "",
        email: "",
        contact: "",
        password: "",
        confirmPassword: "",
        profilePhoto: null,

        storeLogo: null,
        storeName: "",
        aboutShop: "",
        businessEmail: "",
        businessContact: "",
        businessType: "",
        category: "",
        categoryLicenseUpload: null,
        address: "",
        city: "",
        state: "",
        pincode: "",
        businessPAN: "",
        panCardUpload: null,
        gstNumber: "",
        gstDocumentUpload: null,

        accHolder: "",
        bank: "",
        accNumber: "",
        ifsc: "",
        bankDocumentUpload: null,
        otp: ""
    };

    // submit
    const handleSubmit = () => {

        if (!formData.accHolder?.trim()) return toast.error("Account holder name is required");
        if (!formData.bank?.trim()) return toast.error("Bank name is required");

        if (!formData.accNumber?.trim()) return toast.error("Account number is required");
        if (!/^\d{9,18}$/.test(formData.accNumber)) return toast.error("Account number must be 9 to 18 digits");

        if (!formData.ifsc?.trim()) return toast.error("IFSC code is required");
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) return toast.error("Enter a valid IFSC code (e.g. SBIN0001234)");

        if (!formData.bankDocumentUpload) return toast.error("Please upload bank document");

        if (!checkedTerms) return toast.error("Please accept the terms and conditions");
        if (!checkedAgreement) return toast.error("Please accept the vendor agreement");

        const data = new FormData();

        // STEP 1: Personal Info
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("contact", formData.contact);
        data.append("password", formData.password);
        if (formData.profilePhoto) data.append("profilePhoto", formData.profilePhoto);

        // STEP 2: Business Info
        data.append("storeName", formData.storeName);
        data.append("aboutShop", formData.aboutShop);
        data.append("businessEmail", formData.businessEmail);
        data.append("businessContact", formData.businessContact);
        data.append("businessType", formData.businessType);
        data.append("category", formData.category);
        data.append("address", formData.address);
        data.append("city", formData.city);
        data.append("state", formData.state);
        data.append("pincode", formData.pincode);
        data.append("businessPAN", formData.businessPAN);
        data.append("gstNumber", formData.gstNumber);

        // Files (Step 2)
        if (formData.storeLogo) data.append("storeLogo", formData.storeLogo);
        if (formData.panCardUpload) data.append("panCardUpload", formData.panCardUpload);
        if (formData.categoryLicenseUpload) data.append("categoryLicenseUpload", formData.categoryLicenseUpload);
        if (formData.gstDocumentUpload) data.append("gstDocumentUpload", formData.gstDocumentUpload);

        // STEP 3: Account Info & OTP
        data.append("accHolder", formData.accHolder);
        data.append("bank", formData.bank);
        data.append("accNumber", formData.accNumber);
        data.append("ifsc", formData.ifsc);

        // File (Step 3)
        if (formData.bankDocumentUpload) data.append("bankDocumentUpload", formData.bankDocumentUpload);

        signupVendor(data, {
            onSuccess: (res) => {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 999,
                    colors: ['#ec4899', '#f472b6', '#db2777']
                });

                // fill token in zustand store
                login(res.vendor, res.token);

                setFormData(initialVendorState);
                setIsSubmitted(true);

            },
            onError: (err) => toast.error(err.response?.data?.message || "Failed in signup")
        })
    };

    return (
        <section className="w-full">

            {/* heading */}
            <div className='mb-8 text-center md:text-left'>
                <h1 className='text-xl md:text-2xl font-bold text-gray-800 tracking-tight'>
                    {t('vendorSignup.accountInfo')}
                </h1>

                <div className='w-12 h-1 bg-pink-500 rounded-full mt-1 mx-auto md:ml-0'></div>

                <p className='text-gray-500 text-xs md:text-sm mt-2'>
                    {t('vendorSignup.accountSubtitle')}
                </p>
            </div>

            {/* form section */}
            <div className='grid md:grid-cols-2 gap-5 md:gap-6'>

                {/* account Name */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='accHolder'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('vendorSignup.accHolder')}</label>
                    <input
                        inputMode="numeric"
                        name="accHolder"
                        value={formData.accHolder}
                        onChange={handleChange}
                        placeholder="e.g. Rahul"
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* bank name */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='bank'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('vendorSignup.bankName')}</label>
                    <input
                        type="text"
                        name="bank"
                        value={formData.bank}
                        onChange={handleChange}
                        placeholder="e.g. State Bank"
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* acoount num */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='accNumber'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('vendorSignup.accNumber')}</label>
                    <input
                        type="text"
                        name="accNumber"
                        value={formData.accNumber}
                        onChange={handleChange}
                        placeholder="e.g. 12 or 18 digits"
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* ifsc */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='ifsc'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('vendorSignup.ifsc')}</label>
                    <input
                        type="text"
                        name="ifsc"
                        value={formData.ifsc}
                        onChange={handleChange}
                        placeholder="e.g. 11 digits"
                        style={{ textTransform: 'uppercase' }}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* cancelled cheque upload */}
                <div className='relative flex flex-col gap-1.5'>
                    <label
                        htmlFor='bankDocumentUpload'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('vendorSignup.bankDoc')}</label>

                    <div className="relative">
                        {/* Input ko 'peer' banaya aur z-index diya taaki click pakde */}
                        <input
                            type="file"
                            id='bankDocumentUpload'
                            name='bankDocumentUpload'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='absolute inset-0 opacity-0 cursor-pointer z-10 peer'
                        />

                        {/* Niche wale div mein 'peer-focus' add kiya hai */}
                        <div className="w-full p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl flex gap-2 items-center outline-none transition-all peer-focus:border-pink-500">
                            <button className="text-sm md:text-base border border-pink-100 rounded-sm px-2 text-pink-600 bg-pink-50 pointer-events-none">
                                {t('vendorSignup.upload')}
                            </button>
                            <span className='flex-1 text-sm md:text-base text-gray-500 truncate'>
                                {formData.bankDocumentUpload ? formData.bankDocumentUpload.name : t('vendorSignup.noFile')}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {t('vendorSignup.bankDocHint')}
                    </p>
                </div>
            </div>

            {/* conditions */}
            <div className='space-y-4 mt-10 md:mt-16'>

                {/* 1st condition */}
                <div className='flex gap-2 md:gap-4'>
                    <input
                        type="checkbox"
                        checked={checkedTerms}
                        onChange={(e) => setCheckedTerms(e.target.checked)}
                        className='accent-pink-500 cursor-pointer' />

                    <p className='text-xs md:text-[15px] text-gray-600'>
                        {t('vendorSignup.terms1Start')} <span
                            onClick={() => setIsTermsOpen(!isTermsOpen)}
                            className="text-pink-600 font-semibold hover:underline cursor-pointer">
                            {t('vendorSignup.termsOfService')} </span>{t('vendorSignup.and')} <span
                                onClick={() => setIsPolicyOpen(!isPolicyOpen)}
                                className="text-pink-600 font-semibold hover:underline cursor-pointer"> {t('vendorSignup.privacyPolicy')} </span>{t('vendorSignup.terms1End')}
                    </p>
                </div>

                {/* 2nd condition */}
                <div className='flex gap-2 md:gap-4'>
                    <input
                        type="checkbox"
                        checked={checkedAgreement}
                        onChange={(e) => setCheckedAgreement(e.target.checked)}
                        className='accent-pink-500 cursor-pointer' />

                    <p className='text-xs md:text-[15px] text-gray-600'>
                        {t('vendorSignup.terms2Start')} <span
                            onClick={() => setIsAggrementOpen(!isAggrementOpen)}
                            className="text-pink-600 font-semibold hover:underline cursor-pointer">
                            {t('vendorSignup.sellerAgreement')} </span> {t('vendorSignup.terms2End')}</p>
                </div>
            </div>

            {/* button */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-10">
                <button
                    onClick={prev}
                    className="w-full text-start sm:w-auto text-gray-500 hover:text-pink-500 px-6 py-3 hover:bg-pink-50 rounded-xl font-bold transition-all cursor-pointer text-sm md:text-base">
                    {t('vendorSignup.back')}
                </button>

                <button
                    onClick={() => handleSubmit()}
                    disabled={!required || isRegistering}
                    className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold shadow-lg transition-all not-only-of-type:
                        ${required && !isRegistering
                            ? "bg-pink-500 text-white shadow-pink-200 hover:bg-pink-600 hover:scale-105 active:scale-95 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                        }`}
                >
                    {isRegistering ? t('vendorSignup.submitting') : t('vendorSignup.submit')}
                </button>
            </div>

            {/* submit popup */}
            {isSubmitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 lg:px-6">
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
                            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight leading-tight">
                                {t('vendorSignup.welcomeTitle')}
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed px-2 italic">
                                {t('vendorSignup.welcomeDesc')}
                            </p>
                        </div>

                        <div className="md:pt-4 space-y-4">

                            <button
                                onClick={() => navigate('/vendor_dashboard')}
                                className="w-full text-sm md:text-base bg-slate-900 hover:bg-black text-white font-bold py-3 md:py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
                            >
                                {t('vendorSignup.goToDashboard')}
                            </button>

                            <button
                                onClick={() => navigate('/vendor_profile')}
                                className="w-full text-sm md:text-base bg-white border-2 border-slate-100 text-slate-600 font-bold py-3 rounded-2xl transition-all hover:bg-slate-50 cursor-pointer"
                            >
                                {t('vendorSignup.completeProfile')}
                            </button>
                        </div>

                        <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            {t('vendorSignup.verificationEmail')}
                        </p>
                    </div>
                </div>
            )}

            {/* terms popup section */}
            <div
                className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-100 px-4 py-6 transition-all duration-500 
                     ${isTermsOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div
                    className={`bg-white rounded-3xl shadow-2xl relative transition-all duration-500 transform flex flex-col w-full max-w-4xl max-h-[60vh] md:max-h-[80vh]
                        ${isTermsOpen ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}
                >
                    {/* Fixed Header with Close Button */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-3xl sticky top-0 z-10">
                        <h1 className="text-pink-500 text-xl md:text-3xl font-bold">
                            {t('vendorSignup.termsTitle')}
                        </h1>
                        <button
                            onClick={() => setIsTermsOpen(false)}
                            className="p-2 hover:bg-pink-50 rounded-full transition-colors group"
                        >
                            <RxCross2 className='text-2xl text-gray-400 group-hover:text-pink-500' />
                        </button>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 text-gray-700 leading-relaxed">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="shrink-0 bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                                Acceptance of Terms
                            </h2>
                            <p className="pl-10 text-sm md:text-base text-gray-600">
                                By registering as a vendor on our platform, you agree to abide by these Terms of Service...
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="shrink-0 bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                                Account Responsibilities
                            </h2>
                            <ul className="pl-10 space-y-3 list-disc marker:text-pink-500 text-sm md:text-base">
                                <li>
                                    <span className="font-semibold text-gray-800">Accuracy:</span> provide accurate information...
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Security:</span> maintain confidentiality...
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                                Product Listings and Quality
                            </h2>
                            <ul className="pl-9 space-y-3 list-disc marker:text-pink-500">
                                <li>
                                    <span className="font-semibold text-gray-800">Authenticity:</span> All products listed must be genuine. Selling counterfeit, stolen, or unauthorized replicas is strictly prohibited and will lead to immediate account termination.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Content:</span> You must provide high-quality images and honest descriptions. Misleading customers regarding product features, size, or condition is a violation of our policy.
                                </li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
                                Returns and Refunds
                            </h2>
                            <ul className="pl-9 space-y-3 list-disc marker:text-pink-500">
                                <li>
                                    <span className="font-semibold text-gray-800">Return Policy:</span> Vendors must honor the platform’s return policy. If a product is returned due to a defect or "wrong item sent," the vendor will bear the return shipping costs.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Customer Support:</span> Vendors agree to cooperate with the platform's support team to resolve any customer disputes amicably.
                                </li>
                            </ul>
                        </section>
                    </div>

                    {/* Footer (Optional): Jab user scroll karke niche aaye toh "Agree" button dikhane ke liye */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl text-center">
                        <button
                            onClick={() => setIsTermsOpen(false)}
                            className="bg-pink-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-pink-600 transition-all"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>

            {/* seller aggrement popup section */}
            <div
                className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-100 px-4 py-6 transition-all duration-500 
                     ${isAggrementOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div
                    className={`bg-white rounded-3xl shadow-2xl relative transition-all duration-500 transform flex flex-col w-full max-w-4xl max-h-[60vh] md:max-h-[80vh]
                        ${isAggrementOpen ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}
                >
                    {/* Fixed Header with Close Button */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-3xl sticky top-0 z-10">
                        <h1 className="text-pink-500 text-xl md:text-3xl font-bold">
                            {t('vendorSignup.agreementTitle')}
                        </h1>
                        <button
                            onClick={() => setIsAggrementOpen(false)}
                            className="p-2 hover:bg-pink-50 rounded-full transition-colors group"
                        >
                            <RxCross2 className='text-2xl text-gray-400 group-hover:text-pink-500' />
                        </button>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 text-gray-700 leading-relaxed">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="shrink-0 bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                                Acceptance of Terms
                            </h2>
                            <p className="pl-10 text-sm md:text-base text-gray-600">
                                By registering as a vendor on our platform, you agree to abide by these Terms of Service...
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="shrink-0 bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                                Account Responsibilities
                            </h2>
                            <ul className="pl-10 space-y-3 list-disc marker:text-pink-500 text-sm md:text-base">
                                <li>
                                    <span className="font-semibold text-gray-800">Accuracy:</span> provide accurate information...
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Security:</span> maintain confidentiality...
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                                Product Listings and Quality
                            </h2>
                            <ul className="pl-9 space-y-3 list-disc marker:text-pink-500">
                                <li>
                                    <span className="font-semibold text-gray-800">Authenticity:</span> All products listed must be genuine. Selling counterfeit, stolen, or unauthorized replicas is strictly prohibited and will lead to immediate account termination.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Content:</span> You must provide high-quality images and honest descriptions. Misleading customers regarding product features, size, or condition is a violation of our policy.
                                </li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
                                Returns and Refunds
                            </h2>
                            <ul className="pl-9 space-y-3 list-disc marker:text-pink-500">
                                <li>
                                    <span className="font-semibold text-gray-800">Return Policy:</span> Vendors must honor the platform’s return policy. If a product is returned due to a defect or "wrong item sent," the vendor will bear the return shipping costs.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Customer Support:</span> Vendors agree to cooperate with the platform's support team to resolve any customer disputes amicably.
                                </li>
                            </ul>
                        </section>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl text-center">
                        <button
                            onClick={() => setIsAggrementOpen(false)}
                            className="bg-pink-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-pink-600 transition-all"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>

            {/* privacy policy popup section */}
            <div
                className={`fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-100 px-4 py-6 transition-all duration-500 
                     ${isPolicyOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div
                    className={`bg-white rounded-3xl shadow-2xl relative transition-all duration-500 transform flex flex-col w-full max-w-4xl max-h-[60vh] md:max-h-[80vh]
                        ${isPolicyOpen ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}
                >
                    {/* Fixed Header with Close Button */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-3xl sticky top-0 z-10">
                        <h1 className="text-pink-500 text-xl md:text-3xl font-bold">
                            {t('vendorSignup.policyTitle')}
                        </h1>
                        <button
                            onClick={() => setIsPolicyOpen(false)}
                            className="p-2 hover:bg-pink-50 rounded-full transition-colors group"
                        >
                            <RxCross2 className='text-2xl text-gray-400 group-hover:text-pink-500' />
                        </button>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 text-gray-700 leading-relaxed">

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="shrink-0 bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                                Acceptance of Terms
                            </h2>
                            <p className="pl-10 text-sm md:text-base text-gray-600">
                                By registering as a vendor on our platform, you agree to abide by these Terms of Service...
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
                                <span className="shrink-0 bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                                Account Responsibilities
                            </h2>
                            <ul className="pl-10 space-y-3 list-disc marker:text-pink-500 text-sm md:text-base">
                                <li>
                                    <span className="font-semibold text-gray-800">Accuracy:</span> provide accurate information...
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Security:</span> maintain confidentiality...
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                                Product Listings and Quality
                            </h2>
                            <ul className="pl-9 space-y-3 list-disc marker:text-pink-500">
                                <li>
                                    <span className="font-semibold text-gray-800">Authenticity:</span> All products listed must be genuine. Selling counterfeit, stolen, or unauthorized replicas is strictly prohibited and will lead to immediate account termination.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Content:</span> You must provide high-quality images and honest descriptions. Misleading customers regarding product features, size, or condition is a violation of our policy.
                                </li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
                                Returns and Refunds
                            </h2>
                            <ul className="pl-9 space-y-3 list-disc marker:text-pink-500">
                                <li>
                                    <span className="font-semibold text-gray-800">Return Policy:</span> Vendors must honor the platform’s return policy. If a product is returned due to a defect or "wrong item sent," the vendor will bear the return shipping costs.
                                </li>
                                <li>
                                    <span className="font-semibold text-gray-800">Customer Support:</span> Vendors agree to cooperate with the platform's support team to resolve any customer disputes amicably.
                                </li>
                            </ul>
                        </section>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl text-center">
                        <button
                            onClick={() => setIsPolicyOpen(false)}
                            className="bg-pink-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-pink-600 transition-all"
                        >
                            {t('vendorSignup.iUnderstand')}
                        </button>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default VendorAccountInfo;