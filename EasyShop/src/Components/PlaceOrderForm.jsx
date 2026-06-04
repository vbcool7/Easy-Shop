
import React, { useState } from 'react'
import { IoLockClosed } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaCcVisa } from "react-icons/fa";
import { FaCcMastercard } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import UpiImg from '../assets/Images/UpiImg.png';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useCreateRazorpayOrder, usePlaceCartOrder, usePlaceDirectOrder, useVerifyPayment } from '../hook/useOrders';

function PlaceOrderForm() {

    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isopenCod, setIsOpenCod] = useState(false);
    const [isopenOnline, setIsOpenOnline] = useState(false);

    const isDirectBuy = location.state?.isDirectBuy;
    const directProdId = location.state?.items?.[0]?.id;
    const directQty = location.state?.items?.[0]?.quantity;
    const directSelectedColor = location.state?.items?.[0]?.selectedColor || null;
    const directSelectedSize = location.state?.items?.[0]?.selectedSize || null;

    const [shippingAddress, setShippingAddress] = useState({
        name: "",
        contact: "",
        pincode: "",
        address: "",
        city: "",
        state: ""
    });

    const { mutate: createRazorpayOrder, isPending: isRazorpayPending } = useCreateRazorpayOrder();
    const { mutate: verifyPayment, isPending: isVerifyPending } = useVerifyPayment();

    const { mutate: placeCartOrder, isPending: isCartPending } = usePlaceCartOrder();
    const { mutate: placeDirectOrder, isPending: isDirectPending } = usePlaceDirectOrder();

    const isPending = isCartPending || isDirectPending || isRazorpayPending || isVerifyPending;

    const displayItems = location.state?.items || cartItems;  // if data coe from 'Buy Now' then take it, otherwise cart data take
    const subtotal = displayItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const totalQuantity = displayItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const finalTotal = subtotal;

    // handle i/p
    const handleInputChange = (e) => {
        setShippingAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // 1. helper fun for Script load
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true); // if already loaded then not load again
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // order place
    const handlePlaceOrder = async () => {

        const { name, contact, pincode, address, city, state } = shippingAddress;

        if (!name || !contact || !pincode || !address || !city || !state) {
            toast.error("Please fill all shipping address fields");
            return;
        }

        if (contact.length !== 10) {
            toast.error("Please enter valid phone number");
            return;
        }

        if (pincode.length !== 6) {
            toast.error("Please enter valid 6-digit pincode");
            return;
        }

        // cod
        if (paymentMethod === "COD") {
            if (isDirectBuy) {
                placeDirectOrder({
                    prod_id: directProdId,
                    quantity: directQty,
                    shippingAddress,
                    paymentMethod: "COD",
                    selectedColor: directSelectedColor,
                    selectedSize: directSelectedSize
                }, {
                    onSuccess: () => {
                        setShippingAddress({ name: "", contact: "", pincode: "", address: "", city: "", state: "" });
                        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ec4899', '#f472b6', '#db2777'] });
                        setIsOpenCod(true);
                    }
                });
            } else {
                placeCartOrder({ shippingAddress, paymentMethod: "COD" }, {
                    onSuccess: () => {
                        clearCart();
                        setShippingAddress({ name: "", contact: "", pincode: "", address: "", city: "", state: "" });
                        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ec4899', '#f472b6', '#db2777'] });
                        setIsOpenCod(true);
                    }
                });
            }
            return;
        }

        const isLoaded = await loadRazorpayScript();

        if (!isLoaded) {
            alert("Razorpay SDK failed to load");
            return;
        }

        // online - razorpay
        createRazorpayOrder(finalTotal, {
            onSuccess: (razorpayData) => {
                const options = {
                    key: razorpayData.keyId,
                    amount: razorpayData.amount,
                    currency: razorpayData.currency,
                    name: "EasyShop",
                    description: "Order Payment",
                    order_id: razorpayData.orderId,

                    handler: function (response) {
                        // payment success — now verify + save order
                        const orderItems = isDirectBuy
                            ? [{
                                productId: directProdId,
                                quantity: directQty,
                                price: displayItems[0].price,
                                selectedColor: directSelectedColor,
                                selectedSize: directSelectedSize,
                                variantId: displayItems[0].variantId,
                                vendorId: displayItems[0].vendorId
                            }]
                            : cartItems.map(item => ({
                                productId: item._id,
                                quantity: item.quantity,
                                price: item.price,
                                selectedColor: item.selectedColor || null,
                                selectedSize: item.selectedSize || null,
                                variantId: item.variantId,
                                vendorId: item.vendorId
                            }));

                        verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            cartData: {
                                shippingAddress,
                                orderItems,
                                totalAmount: finalTotal
                            },
                            orderType: isDirectBuy ? 'direct' : 'cart'
                        }, {
                            onSuccess: () => {
                                if (!isDirectBuy) clearCart();
                                setShippingAddress({ name: "", contact: "", pincode: "", address: "", city: "", state: "" });
                                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ec4899', '#f472b6', '#db2777'] });
                                setIsOpenCod(true); // reuse success modal
                            }
                        });
                    },
                    prefill: {
                        name: shippingAddress.name,
                        contact: shippingAddress.contact
                    },
                    theme: { color: "#ec4899" },
                    modal: {
                        ondismiss: () => toast.error("Payment cancelled")
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        });
    };

    return (
        <section className="w-full min-h-[70vh] pb-5 pt-2 px-4 lg:px-6">

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 md:py-5 lg:py-15">

                {/* left - form section */}
                <div className="w-full lg:w-[60%] space-y-8 order-2 lg:order-1">
                    <section className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">

                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                            {t('placeOrder.shippingAddress')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Full Name */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('placeOrder.fullName')}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={shippingAddress.name}
                                    onChange={handleInputChange}
                                    placeholder={t('placeOrder.namePlaceholder')}
                                    className='w-full mt-1 text-sm md:text-base border border-gray-300 py-3 px-4 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all bg-gray-50/50'
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('placeOrder.phoneNumber')}</label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={shippingAddress.contact}
                                    onChange={handleInputChange}
                                    placeholder={t('placeOrder.phonePlaceholder')}
                                    className='w-full mt-1 text-sm md:text-base border border-gray-300 py-3 px-4 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all bg-gray-50/50'
                                />
                            </div>

                            {/* Pincode */}
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('placeOrder.pincode')}</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={shippingAddress.pincode}
                                    onChange={handleInputChange}
                                    placeholder={t('placeOrder.pincodePlaceholder')}
                                    className='w-full mt-1 text-sm md:text-base border border-gray-300 py-3 px-4 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all bg-gray-50/50'
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('placeOrder.address')}</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={shippingAddress.address}
                                    onChange={handleInputChange}
                                    placeholder={t('placeOrder.addressPlaceholder')}
                                    className='w-full mt-1 text-sm md:text-base border border-gray-300 py-3 px-4 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all bg-gray-50/50'
                                />
                            </div>

                            {/* City */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('placeOrder.city')}</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleInputChange}
                                    placeholder={t('placeOrder.cityPlaceholder')}
                                    className='w-full mt-1 text-sm md:text-base border border-gray-300 py-3 px-4 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all bg-gray-50/50'
                                />
                            </div>

                            {/* state */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('placeOrder.state')}</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={shippingAddress.state}
                                    onChange={handleInputChange}
                                    placeholder={t('placeOrder.statePlaceholder')}
                                    className='w-full mt-1 text-sm md:text-base border border-gray-300 py-3 px-4 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all bg-gray-50/50'
                                />
                            </div>
                        </div>
                    </section>

                    {/* Payment Section */}
                    <section className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">

                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 md:w-2 md:h-8 bg-pink-500 rounded-full"></span>
                            {t('placeOrder.paymentMethod')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* COD Option */}
                            <div
                                onClick={() => setPaymentMethod("COD")}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 
                                    ${paymentMethod === 'COD' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                    ${paymentMethod === 'COD' ? 'border-pink-500' : 'border-gray-300'}`}>
                                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-pink-500 rounded-full"></div>}
                                </div>
                                <div>
                                    <p className="text-sm md:text-base font-bold text-gray-900">{t('placeOrder.cod')}</p>
                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">{t('placeOrder.codDesc')}</p>
                                </div>
                            </div>

                            {/* Online Option */}
                            <div
                                onClick={() => setPaymentMethod("Online")}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 
                                    ${paymentMethod === 'Online' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                    ${paymentMethod === 'Online' ? 'border-pink-500' : 'border-gray-300'}`}>
                                    {paymentMethod === 'Online' && <div className="w-2.5 h-2.5 bg-pink-500 rounded-full"></div>}
                                </div>
                                <div>
                                    <p className="text-sm md:text-base font-bold text-gray-900">{t('placeOrder.online')}</p>
                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">{t('placeOrder.onlineDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Place Order Button - mobile*/}
                    <div className='lg:hidden'>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isPending}
                            className={`w-full text-sm md:text-base bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-3xl mt-8 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-pink-200
                            ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            {isPending ? t('placeOrder.placingOrder') : t('placeOrder.confirmOrder')}
                        </button>

                        {/* Security Note */}
                        <p className="text-center text-gray-400 text-[9px] md:text-[12px] mt-6 flex items-center justify-center gap-1">
                            <IoLockClosed /> {t('placeOrder.securePayment')}
                        </p>
                    </div>
                </div>

                {/* right - summary */}
                <div className="w-full lg:w-[40%] order-1 lg:order-2">
                    <div className="bg-white p-5 md:p-8 rounded-4xl md:rounded-[2.5rem] sticky top-24 border border-pink-50 shadow-2xl shadow-pink-100/30">

                        <h2 className="text-xl md:text-2xl font-extrabold mb-6 md:mb-8 text-gray-900 flex justify-between items-start md:items-center gap-2">
                            <span className="truncate">{t('placeOrder.orderSummary')}</span>
                            <span className="text-[10px] md:text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500 whitespace-nowrap shrink-0">
                                {totalQuantity} {t('placeOrder.items')}
                            </span>
                        </h2>

                        <div className="max-h-52 md:max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-4">
                            {displayItems && displayItems.map((item) => (
                                <div
                                    key={item._id || item.id || item.variantId}
                                    className="flex items-center gap-3 md:gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">

                                    {/* image */}
                                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                        <img
                                            src={item.prodImage || item.img}
                                            alt={item.prodName || item.name}
                                            className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 min-w-0">

                                        {/* prod name */}
                                        <h4 className="text-[13px] font-bold text-gray-800 truncate mb-1">
                                            {item.prodName || item.name}
                                        </h4>

                                        {/* prod info */}
                                        <div className="flex flex-wrap gap-1">
                                            {item.selectedColor && (
                                                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-600 truncate max-w-25">
                                                    {item.selectedColor}
                                                </span>
                                            )}

                                            {item.selectedSize && (
                                                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-600 whitespace-nowrap">
                                                    {t('placeOrder.size')}: {item.selectedSize}
                                                </span>
                                            )}

                                            <span className="text-[10px] font-bold bg-pink-100 px-2 py-1 rounded-lg text-pink-600 uppercase tracking-wider whitespace-nowrap">
                                                {t('placeOrder.qty')}: {item.quantity || 1}
                                            </span>
                                        </div>

                                    </div>

                                    <p className="text-sm font-bold text-gray-900 whitespace-nowrap shrink-0">
                                        ₹{item.price * (item.quantity || 1)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            
                            <div className="flex justify-between items-center text-gray-500 font-medium text-xs md:text-sm gap-4">
                                <span className="truncate">{t('placeOrder.subtotal')}</span>
                                <span className="text-gray-900 whitespace-nowrap">₹{subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center gap-4 text-xs md:text-sm text-gray-500 font-medium">
                                <span className="truncate">{t('placeOrder.shipping')}</span>
                                <span className="text-green-500 font-bold text-sm underline cursor-help whitespace-nowrap shrink-0">
                                    {t('placeOrder.free')}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-6 pt-6">
                                
                                <div className="flex justify-between items-center gap-4">
                                    <div className="min-w-0">
                                        <p className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest font-black font-sans truncate">
                                            {t('placeOrder.grandTotal')}
                                        </p>
                                        <p className="text-2xl md:text-4xl font-black text-gray-900 mt-1 whitespace-nowrap">
                                            ₹{finalTotal.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="mt-6 md:mt-8 space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={t('placeOrder.couponPlaceholder')}
                                    className="flex-1 min-w-0 bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-pink-500 focus:bg-white transition-all"
                                />
            
                                <button className="bg-gray-900 text-white text-[10px] font-bold px-4 py-3 rounded-2xl hover:bg-black transition-all shrink-0 whitespace-nowrap">
                                    {t('placeOrder.apply')}
                                </button>
                            </div>
                        </div>

                        {/* Place Order button - desktop */}
                        <div className='hidden lg:block'>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPending}
                                className={`w-full text-sm md:text-base bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-3xl mt-8 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-pink-200
                  ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                
                                <span className="px-2 text-center line-clamp-1">
                                    {isPending ? t('placeOrder.placingOrder') : t('placeOrder.confirmOrder')}
                                </span>
                            </button>

                            {/* Security Note */}
                            <p className="text-center text-gray-400 text-[9px] mt-6 flex items-center justify-center gap-1 px-2">
                                <span className="shrink-0"><IoLockClosed /></span>
                                <span className="truncate">{t('placeOrder.securePayment')}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* cod payment pop-up */}
                {isopenCod && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                        <div className="bg-white p-8 rounded-[3rem] text-center max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">

                            <div
                                onClick={() => setIsOpenCod(false)}
                                className="text-gray-400 hover:text-black text-xl flex justify-end cursor-pointer items-center">
                                <FaTimes />
                            </div>

                            <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                <FaCheckCircle />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">{t('placeOrder.orderPlaced')}</h2>
                            <p className="text-gray-500 text-sm mb-8">{t('placeOrder.orderSuccess')}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold hover:bg-pink-600 hadow-lg shadow-pink-200 cursor-pointer transition-all active:scale-95"
                            >
                                {t('placeOrder.continueShopping')}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </section>
    )
}

export default PlaceOrderForm;