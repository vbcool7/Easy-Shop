
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { useTranslation } from 'react-i18next';

const businessMenu = [
    { id: 1, businessName: "Individual / Sole Proprietorship" },
    { id: 2, businessName: "Private Limited Company" },
    { id: 3, businessName: "Partnership Firm" },
    { id: 4, businessName: "Limited Liability Partnership (LLP)" },
    { id: 5, businessName: "Manufacturer" },
    { id: 6, businessName: "Wholesaler / Distributor" }
];

function VendorBusinessInfo({ prev, next, formData, setFormData, categories, isCatLoading }) {

    const { t } = useTranslation();
    const [isBusinessOpen, setIsBusinessOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCat, setSelectedCat] = useState(null);

    // input handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //common for all uploads
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleBusiness = (businessName) => {
        setFormData(prev => ({ ...prev, businessType: businessName }));
        setIsBusinessOpen(false);
    };

    const handleCategory = (cat) => {
        setFormData(prev => ({
            ...prev,
            category: cat.catName,
            categoryLicenseUpload: null
        }));
        setSelectedCat(cat);
        setIsCategoryOpen(false);
    };

    // submit
    const countinueToAccountDetail = () => {

        // 1. Basic Required Fields
        const requiredFields = [
            'storeName', 'aboutShop', 'businessEmail', 'businessContact',
            'businessType', 'category', 'address',
            'city', 'pincode', 'state', 'businessPAN'
        ];

        for (const field of requiredFields) {
            if (!formData[field]) {
                return toast.error(`${field.replace(/([A-Z])/g, ' $1')} is required`);
            }
        }

        // 2. Logo Check
        if (!formData.storeLogo) {
            return toast.error("Please upload store logo");
        }

        // 3. Conditional License Check (Only if the category requires one)
        if (selectedCat?.requiresCertificate && !formData.categoryLicenseUpload) {
            return toast.error(`Please upload ${selectedCat.certificateLabel}`);
        }

        // 4. PAN Card File Check
        if (!formData.panCardUpload) {
            return toast.error("Please upload Business PAN Card");
        }

        // 5. Conditional GST Check (Only if GST number is provided)
        if (formData.gstNumber && formData.gstNumber.length > 0) {
            if (formData.gstNumber.length !== 15) {
                return toast.error("GST Number must be 15 characters");
            }
            if (!formData.gstDocumentUpload) {
                return toast.error("Please upload GST Certificate");
            }
        }

        // If all pass
        next();
    };

    return (
        <section className="w-full">

            {/* heading */}
            <div className='mb-8 text-center md:text-left'>
                <h1 className='text-xl md:text-2xl font-bold text-gray-800 tracking-tight'>
                    {t('vendorSignup.businessInfo')}
                </h1>

                <div className='w-12 h-1 bg-pink-500 rounded-full mt-1 mx-auto md:ml-0'></div>

                <p className='text-gray-500 text-xs md:text-sm mt-2'>
                    {t('vendorSignup.businessSubtitle')}
                </p>
            </div>

            {/* Store Logo Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 p-5 sm:p-6 bg-pink-50/50 rounded-2xl border border-dashed border-pink-200 transition-all">

                {/* Hidden File Input */}
                <input
                    type="file"
                    id='storeLogo'
                    name='storeLogo'
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <label
                    htmlFor="storeLogo"
                    className="w-20 h-20 bg-white border-2 border-gray-100 rounded-full flex flex-col items-center justify-center text-gray-400 text-[10px] sm:text-xs text-center p-3 cursor-pointer hover:border-pink-500 hover:text-pink-500 transition-all shadow-sm shrink-0 active:scale-95"
                >
                    <span className="font-bold">
                        {t('vendorSignup.uploadLogo')}
                    </span>
                </label>

                <div className="text-center sm:text-left overflow-hidden w-full">
                    <span className="block font-bold text-gray-700 text-sm md:text-base truncate">
                        {formData.storeLogo ? formData.storeLogo.name : t('vendorSignup.storeLogo')}
                    </span>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-tight">
                        {t('vendorSignup.logoDesc')} <br className="sm:hidden" /> (PNG/JPG)
                    </p>
                </div>
            </div>

            {/* form section */}
            <div className='grid md:grid-cols-2 gap-5 md:gap-6'>

                {/* Store Name */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='storeName'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.storeName')}
                    </label>
                    <input
                        type="text"
                        name='storeName'
                        value={formData.storeName || ""}
                        onChange={handleChange}
                        placeholder={t('vendorSignup.storeNamePlaceholder')}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* About Shop */}
                <div className='flex flex-col gap-1.5 md:col-span-2'>
                    <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.aboutShop')}
                    </label>
                    <textarea
                        name='aboutShop'
                        value={formData.aboutShop || ""}
                        onChange={handleChange}
                        rows="3"
                        placeholder={t('vendorSignup.aboutShopPlaceholder')}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all resize-none" />
                    <span className='text-[10px] text-gray-400 ml-1'>
                        {t('vendorSignup.aboutShopHint')}
                    </span>
                </div>

                {/* business email */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='businessEmail'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('vendorSignup.businessEmail')}</label>
                    <input
                        type="email"
                        name='businessEmail'
                        value={formData.businessEmail || ""}
                        onChange={handleChange}
                        placeholder={t('vendorSignup.businessEmail')}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* business contact */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='businessContact'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">{t('vendorSignup.businessContact')}</label>
                    <input
                        type="text"
                        name='businessContact'
                        value={formData.businessContact || ""}
                        onChange={handleChange}
                        placeholder={t('vendorSignup.businessContact')}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* Business type dropdown */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='businessType'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.businessType')}
                    </label>

                    <div className='cursor-pointer'>
                        <div
                            onClick={() => setIsBusinessOpen(!isBusinessOpen)}
                            className={`w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white transition-all outline-none
                                ${isBusinessOpen
                                    ? "border-pink-500 ring-pink-500 bg-white"
                                    : "border-gray-200"}`
                            }
                        >
                            <span className={`text-sm md:text-base truncate 
                                ${formData.businessType ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                                {formData.businessType || t('vendorSignup.selectBusiness')}
                            </span>

                            <div className="text-gray-400 group-hover:text-pink-500">
                                {isBusinessOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </div>
                        </div>
                    </div>

                    {/* dropdown */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out cursor-pointer
                            ${isBusinessOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <div className='bg-white my-2 rounded-2xl'>
                            {businessMenu.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleBusiness(item.businessName)}
                                    className='hover:text-pink-600 flex justify-start items-center py-2 px-2 hover:bg-pink-100'
                                >
                                    <p>{item.businessName}</p>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>

                {/* Category dropdown */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='category'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.category')}
                    </label>

                    <div className='cursor-pointer'>
                        <div
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className={`w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white transition-all outline-none
                                    ${isCategoryOpen
                                    ? "border-pink-500 ring-pink-500 bg-white"
                                    : "border-gray-200"}`
                            }
                        >

                            <span className={`text-sm md:text-base truncate 
                                ${formData.category ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                                {formData.category || t('vendorSignup.selectCategory')}
                            </span>

                            <div className="text-gray-400 group-hover:text-pink-500">
                                {isCategoryOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </div>
                        </div>
                    </div>

                    {/* dropdown */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out cursor-pointer
                            ${isCategoryOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <div className='bg-white my-2 rounded-2xl'>
                            {isCatLoading ? (
                                <div className="p-3 text-sm text-gray-400">
                                    {t('vendorSignup.loadingCategories')}
                                </div>
                            ) : (
                                categories?.filter(cat => cat.isActive).map((cat, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleCategory(cat)}  // pass full cat object
                                        className='hover:text-pink-600 flex justify-start items-center py-2 px-2 hover:bg-pink-100'
                                    >
                                        <p>{cat.catName}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* license upload*/}
                {selectedCat?.requiresCertificate && (
                    <div className='relative flex flex-col gap-1.5'>
                        <label
                            htmlFor='categoryLicenseUpload'
                            className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                            {selectedCat.certificateLabel}
                        </label>

                        <div className="relative">
                            {/* Input ko 'peer' banaya aur z-index diya taaki click pakde */}
                            <input
                                type="file"
                                name='categoryLicenseUpload'
                                accept='image/*'
                                onChange={handleFileChange}
                                className='absolute inset-0 opacity-0 cursor-pointer z-10 peer'
                            />

                            <div className="w-full p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl flex gap-2 items-center outline-none transition-all peer-focus:border-pink-500">
                                <button className="text-sm md:text-base border border-pink-100 rounded-sm px-2 text-pink-600 bg-pink-50 pointer-events-none">
                                    Upload
                                </button>
                                <span className='text-sm md:text-base text-gray-500 truncate'>
                                    {formData.categoryLicenseUpload ? formData.categoryLicenseUpload.name : t('vendorSignup.noFile')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* business address */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='address'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.businessAddress')}
                    </label>
                    <input
                        type="text"
                        name='address'
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder={t('vendorSignup.addressPlaceholder')}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />

                    <span className='text-[11px] text-gray-500 ml-1 tracking-wide'>
                        {t('vendorSignup.addressHint')}
                        </span>
                </div>

                {/* city */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='city'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.city')} 
                    </label>
                    <input
                        type="text"
                        name='city'
                        value={formData.city || ""}
                        onChange={handleChange}
                        placeholder={t('vendorSignup.cityPlaceholder')}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* state */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='state'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.state')}
                    </label>
                    <input
                        type="text"
                        name='state'
                        value={formData.state || ""}
                        onChange={handleChange}
                        placeholder={t('vendorSignup.statePlaceholder')}
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* pincode */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='pincode'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.pinCode')}
                    </label>
                    <input
                        type="text"
                        name='pincode'
                        value={formData.pincode || ""}
                        onChange={handleChange}
                        placeholder="123456"
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* pan num */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='businessPAN'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.businessPAN')}
                        </label>
                    <input
                        type="text"
                        name='businessPAN'
                        value={formData.businessPAN || ""}
                        onChange={handleChange}
                        placeholder="ABCDE1234F"
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* pan upload */}
                <div className='relative flex flex-col gap-1.5'>
                    <label
                        htmlFor='panCardUpload'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.businessPANUpload')}
                    </label>

                    <div className="relative">
                        <input
                            type="file"
                            name='panCardUpload'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='absolute inset-0 opacity-0 cursor-pointer z-10 peer'
                        />

                        <div className="w-full p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl flex gap-2 items-center outline-none transition-all peer-focus:border-pink-500">
                            <button className="text-sm md:text-base border border-pink-100 rounded-sm px-2 text-pink-600 bg-pink-50 pointer-events-none">
                               {t('vendorSignup.upload')}
                            </button>
                            <span className='text-sm md:text-base text-gray-500 truncate'>
                                {formData.panCardUpload ? formData.panCardUpload.name : t('vendorSignup.noFile')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* gst */}
                <div className='flex flex-col gap-1.5'>
                    <label
                        htmlFor='gstNumber'
                        className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                        {t('vendorSignup.gstNumber')}
                    </label>
                    <input
                        type="text"
                        name='gstNumber'
                        value={formData.gstNumber}
                        onChange={handleChange}
                        maxLength={15}
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full p-3 text-sm md:text-base placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* gst upload */}
                {(formData.gstNumber?.length === 15) && (
                    <div className='relative flex flex-col gap-1.5'>
                        <label
                            htmlFor='gstDocumentUpload'
                            className="text-xs md:text-sm font-semibold text-gray-600 ml-1 tracking-wide">
                            {t('vendorSignup.gstUpload')}
                        </label>

                        <div className="relative">
                            <input
                                type="file"
                                name='gstDocumentUpload'
                                accept='image/*'
                                onChange={handleFileChange}
                                className='absolute inset-0 opacity-0 cursor-pointer z-10 peer'
                            />

                            <div className="w-full p-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-2xl flex gap-2 items-center outline-none transition-all peer-focus:border-pink-500">
                                <button className="text-sm md:text-base border border-pink-100 rounded-sm px-2 text-pink-600 bg-pink-50 pointer-events-none">
                                   {t('vendorSignup.upload')}
                                </button>
                                <span className='text-sm md:text-base text-gray-500 truncate'>
                                    {formData.gstDocumentUpload ? formData.gstDocumentUpload.name : t('vendorSignup.noFile')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* button */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-10">

                <button
                    onClick={prev}
                    className="w-full text-start sm:w-auto text-gray-500 hover:text-pink-500 px-6 py-3 hover:bg-pink-50 rounded-xl font-bold transition-all cursor-pointer text-sm md:text-base"
                >
                    {t('vendorSignup.back')}
                </button>

                <button
                    onClick={countinueToAccountDetail}
                    className="w-full sm:w-auto bg-pink-500 text-white px-8 py-3.5 md:py-3 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 md:hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm md:text-base"
                >
                    {t('vendorSignup.continueAccount')}
                </button>

            </div>

        </section>
    )
}

export default VendorBusinessInfo;