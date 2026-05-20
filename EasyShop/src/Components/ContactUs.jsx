
import React from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

import { useContactForm } from '../hook/useContact';
import { useCatList } from '../hook/useVendor';

function ContactUs() {

    const { mutate: submitQuery, isPending: isAdding } = useContactForm();
    const { data: categories = [], isLoading: isCatLoading, isError, error } = useCatList();

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        category: "",
        subCategory: "",
        orderId: "",
        message: ""
    });

    // handle i/p
    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // category handler
    const handleCategory = (categoryValue) => {
        setFormData(prev => ({
            ...prev,
            category: categoryValue,
            subCategory: ""
        }));
        setIsCategoryOpen(false);
    };

    // submit
    const handleSubmit = (e) => {
        e.preventDefault();

        submitQuery(formData, {
            onSuccess: (res) => {
                if (res.status) {
                    toast.success(res.message || "Query submitted successfully!");

                    setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        contact: "",
                        category: "",
                        subCategory: "",
                        orderId: "",
                        message: ""
                    });
                }
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Something went wrong. Please try again!");
            }
        });
    };

    return (
        <section className="bg-white min-h-[70vh]">

            {/* Top Section */}
            <div className="bg-linear-to-b from-pink-50 to-pink-50 py-12 md:py-24 lg:py-28 px-6 text-center overflow-hidden">

                <div className="max-w-3xl mx-auto">

                    {/* badge */}
                    <span className="inline-block px-2 py-1 md:px-4 md:py-1.5 mb-6 text-[10px] md:text-xs font-bold tracking-widest text-pink-600 uppercase bg-white rounded-full shadow-sm border border-pink-100">
                        Get In Touch
                    </span>

                    {/* Heading with better tracking */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                        Contact <span className="text-pink-500">Easy Shop</span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-lg lg:text-xl leading-relaxed font-light italic">
                        "We would love to hear from you. Our team is always here to chat."
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 md:py-16 flex flex-col md:flex-row gap-8">

                {/* left section */}
                <div className='w-full md:w-[60%]'>

                    <h1 className='text-md md:text-2xl font-bold text-start uppercase mb-4 md:mb-8 text-gray-800 tracking-tight'>
                        Submit your query
                    </h1>

                    <form
                        onSubmit={handleSubmit}
                        className='space-y-4 md:space-y-5'>

                        {/* first nd last name */}
                        <div className='flex flex-col md:flex-row gap-4'>
                            <div className='flex-1'>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder='First Name *'
                                    className='w-full border border-gray-400 py-3 px-2 md:px-4 rounded-md md:rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all'
                                    required
                                />
                            </div>

                            <div className='flex-1'>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder='Last Name *'
                                    className='w-full border border-gray-400 py-3 px-2 md:px-4 rounded-md md:rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all'
                                    required
                                />
                            </div>
                        </div>

                        {/* email mob */}
                        <div className='flex flex-col md:flex-row gap-4'>
                            <div className='flex-1'>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder='Email *'
                                    className='w-full border border-gray-400 py-3 px-2 md:px-4 rounded-md md:rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all'
                                    required
                                />
                            </div>

                            <div className='flex-1'>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleInputChange}
                                    placeholder='Mobile Number *'
                                    className='w-full border border-gray-400 py-3 px-2 md:px-4 rounded-md md:rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all'
                                    required
                                />
                            </div>
                        </div>

                        {/* category & sub category */}
                        <div className='flex flex-col md:flex-row gap-4 items-start'>
                            <div className='flex-1 w-full relative'>
                                <div className='cursor-pointer'>
                                    <div
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className={`w-full flex items-center justify-between p-3 bg-gray-50 border rounded-lg md:rounded-2xl focus:border-pink-500 focus:bg-white transition-all outline-none
                                     ${isCategoryOpen ? "border-pink-500 ring-pink-500 bg-white" : "border-gray-400"}`}
                                    >
                                        <span className={`text-sm md:text-base truncate ${formData.category ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                                            {formData.category || "Select Category *"}
                                        </span>
                                        <div className="text-gray-400">
                                            {isCategoryOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                        </div>
                                    </div>
                                </div>

                                {/* dropdown panel */}
                                {isCategoryOpen && (
                                    <div className='absolute z-50 left-0 w-full bg-white my-1 rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto'>

                                        {/* Case B: Static Options */}
                                        <div
                                            onClick={() => handleCategory("Billing & Invoice Related")}
                                            className='hover:text-pink-600 flex justify-start items-center py-2.5 px-4 hover:bg-pink-50 cursor-pointer text-sm md:text-base'>
                                            <p>Billing & Invoice Related</p>
                                        </div>

                                        <div
                                            onClick={() => handleCategory("Refund & Returns")}
                                            className='hover:text-pink-600 flex justify-start items-center py-2.5 px-4 hover:bg-pink-50 cursor-pointer text-sm md:text-base'>
                                            <p>Refund & Returns</p>
                                        </div>

                                        <div
                                            onClick={() => handleCategory("Delivery & Shipping Delay")}
                                            className='hover:text-pink-600 flex justify-start items-center py-2.5 px-4 hover:bg-pink-50 cursor-pointer text-sm md:text-base'>
                                            <p>Delivery & Shipping Delay</p>
                                        </div>

                                        <div
                                            onClick={() => handleCategory("Account & Login Issues")}
                                            className='hover:text-pink-600 flex justify-start items-center py-2.5 px-4 hover:bg-pink-50 cursor-pointer text-sm md:text-base'>
                                            <p>Account & Login Issues</p>
                                        </div>

                                        <hr className="border-gray-100" />

                                        {/* Case A: Dynamic Backend Options */}
                                        {isCatLoading ? (
                                            <div className="p-3 text-sm text-gray-400">Loading categories...</div>
                                        ) : (
                                            categories?.filter(cat => cat.isActive).map((cat, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleCategory(cat.catName)}
                                                    className='hover:text-pink-600 flex justify-start items-center py-2.5 px-4 hover:bg-pink-100 cursor-pointer text-sm md:text-base'
                                                >
                                                    <p>{cat.catName}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* sub category input block */}
                            {formData.category && !["Billing & Invoice Related", "Refund & Returns", "Delivery & Shipping Delay", "Account & Login Issues"].includes(formData.category) ? (
                                <div className='flex-1 w-full'>
                                    <input
                                        type="text"
                                        name="subCategory" 
                                        value={formData.subCategory}
                                        onChange={handleInputChange}
                                        placeholder='Sub Category *'
                                        className='w-full border border-gray-400 py-3 px-2 md:px-4 rounded-md md:rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all'
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 hidden md:block"></div>
                            )}
                        </div>

                        {/* Order Number */}
                        {formData.category !== "Account & Login Issues" && (
                            <div className=''>
                                <input
                                    type="text"
                                    name="orderId"
                                    value={formData.orderId}
                                    onChange={handleInputChange}
                                    placeholder={formData.category === "Refund & Returns" ? 'Order Number *' : 'Order Number (Optional)'}
                                    className='w-full border border-gray-400 py-3 px-2 md:px-4 rounded-md md:rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all'
                                    required={formData.category === "Refund & Returns"}
                                />
                            </div>
                        )}

                        {/* message */}
                        <div>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Write your message here *"
                                className='w-full h-30 md:h-40 border border-gray-400 py-3 px-2 md:px-4 rounded-md md:rounded-xl outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all resize-none'
                                required
                            ></textarea>
                        </div>

                        {/* button */}
                        <button
                            type="submit" 
                            disabled={isAdding}
                            className="w-full md:w-auto bg-pink-500 text-white hover:bg-pink-600 px-10 py-3 rounded-md md:rounded-full font-bold transition-all active:scale-95 cursor-pointer shadow-lg disabled:bg-gray-400"
                        >
                            {isAdding ? "Submitting..." : "Submit Query"}
                        </button>
                    </form>

                </div>

                {/* right section */}
                <div className='w-full md:w-[40%] bg-white self-start sticky top-24 p-5 md:p-8 border border-pink-100 rounded-3xl my-4 shadow-md'>

                    {/* Office Section */}
                    <div className='mb-6'>
                        <h1 className='text-md font-bold text-pink-500 tracking-widest mb-2 uppercase'>Our Office</h1>
                        <div className='space-y-0.5'>
                            <p className='text-[16px] font-semibold text-gray-800'>Easy Shop</p>
                            <p className='text-md text-gray-600 leading-relaxed'>
                                Umang Tower, 5th Floor, Mindspace,<br />
                                Off. Link Road, Mumbai, MH.
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className='mb-6'>
                        <h1 className='text-md font-bold text-pink-500 tracking-widest mb-2 uppercase'>Connect With Us</h1>
                        <div className='space-y-2'>
                            <p className='text-md text-gray-700 flex items-center gap-2'>
                                <span className='font-bold text-gray-900'>Call :</span> 0987654321
                            </p>
                            <p className='text-md text-gray-700'>
                                <span className='font-bold text-gray-900'>Email :</span> customercare@easyshop.com
                            </p>
                            <p className='text-sm text-gray-500 italic'>(Operational: 08:00 AM to 10:00 PM)</p>

                            {/* WhatsApp Button */}
                            <button className='mt-2 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-green-600 transition-all cursor-pointer'>
                                <span>WhatsApp Chat With Us</span>
                            </button>
                        </div>
                    </div>

                    {/* Grievance Section - Slightly different background to separate it */}
                    <div className='bg-pink-50 p-5 rounded-2xl border border-pink-100'>
                        <h1 className='text-[17px] font-bold text-gray-800 mb-2'>Grievance Redressal:</h1>
                        <p className='text-[15px] text-gray-500 leading-snug mb-4'>
                            In case of unsatisfactory resolution, you may contact our Grievance Officer:
                        </p>
                        <div className='space-y-1 text-md'>
                            <p className='text-gray-700'><span className='font-semibold'>Officer:</span> Sanya Malhotra</p>
                            <p className='text-gray-700'><span className='font-semibold'>Email:</span> Grievance@easyshop.com</p>
                            <p className='text-gray-700'><span className='font-semibold'>Timing:</span> Mon - Fri (10am - 5pm)</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default ContactUs;