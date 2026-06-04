
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useCart } from './CartContext';
import { HiOutlineHeart } from "react-icons/hi";
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';

function CartItem() {

    const { t } = useTranslation();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const quantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const total = subtotal;

    const handleCheckout = () => {

        if (cartItems.length === 0) {
            alert("cart empty");
            return;
        }

        if (!user) {
            toast.error("Please login to place order");
            navigate('/login');
            return;
        }

        navigate("/place_order", {
            state: {
                items: cartItems,
                total: subtotal
            }
        });
    };

    return (
        <section className="w-full min-h-[70vh] bg-white py-8 md:py-16 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* heading */}
                <div className="flex flex-col items-center mb-12">
                    <h1 className='text-2xl md:text-3xl text-pink-500 font-bold tracking-tight'>
                       {t('cart.myCartItems')}
                    </h1>
                    <div className="h-1 w-15 md:w-20 bg-pink-500 rounded-full mt-2 opacity-30"></div>
                </div>

                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* LEFT: Product List */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* clear cart btn */}
                            <div className="flex justify-end">
                                <button
                                    onClick={clearCart}
                                    className="text-[11px] font-black text-red-400 hover:text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider">
                                    {t('cart.clearCart')}
                                </button>
                            </div>

                            {cartItems.map((item, index) => (
                                <div
                                    key={`${item._id}-${item.variantId || index}`}
                                    onClick={() => navigate(`/product_detail/${item._id}/${item.prodName}`)}
                                    className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start md:items-center gap-3 md:gap-4 transition-all hover:border-pink-100 cursor-pointer">

                                    <img
                                        src={item.prodImage || item.img}
                                        className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover bg-gray-50 shrink-0" />

                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="font-bold text-gray-800 text-sm md:text-base cursor-pointer truncate pr-2">
                                            {item.prodName}
                                        </h3>

                                        {/* Variant info */}
                                        {(item?.selectedColor || item?.selectedSize) && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item?.selectedColor && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-50 border border-pink-100 text-pink-500 rounded-full">
                                                        {item.selectedColor}
                                                    </span>
                                                )}
                                                {item?.selectedSize && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-full">
                                                        {t('cart.size')}: {item.selectedSize}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* price */}
                                        <div className="md:hidden mt-1">
                                            <p className="font-black text-pink-500">
                                                ₹ {item.price * (item.quantity || 1)}
                                            </p>
                                        </div>

                                        {/* quantity */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-1 py-1">

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQuantity(item._id, item.variantId, "dec");
                                                    }}
                                                    className="p-1.5 text-pink-500 hover:bg-white rounded-lg transition-all cursor-pointer">
                                                    <FaMinus size={10} />
                                                </button>

                                                <span className="px-3 font-bold text-gray-700 text-xs md:text-sm">
                                                    {item.quantity || 1}
                                                </span>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQuantity(item._id, item.variantId, "inc");
                                                    }}
                                                    className="p-1.5 text-pink-500 hover:bg-white rounded-lg transition-all cursor-pointer">
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>

                                            {/* remove button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromCart(item._id, item.variantId);
                                                }}
                                                className="text-[11px] font-black text-gray-300 hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer">
                                                {t('cart.remove')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* price */}
                                    <div className="hidden md:block text-right min-w-25">
                                        <p className="text-xl font-black text-pink-500 tracking-tight">
                                            ₹ {item.price * (item.quantity || 1)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT: Order Summary (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-5 md:p-8 rounded-[30px] shadow-lg shadow-pink-100/20 border border-pink-50 lg:sticky lg:top-24">

                                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6">
                                    {t('cart.orderSummary')}
                                </h2>

                                <div className="space-y-4 border-b border-gray-100 pb-6 text-sm text-gray-600">

                                    <div className="flex justify-between">
                                        <span>{t('cart.subtotal')}</span>
                                        <span className="font-bold text-gray-800">
                                            ₹ {subtotal}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>{t('cart.shipping')}</span>
                                        <span className="text-green-500 font-bold text-sm underline cursor-help">
                                            {t('cart.free')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">{t('cart.totalQuantity')}</span>
                                        <span className="text-gray-900">{quantity}</span>
                                    </div>

                                </div>

                                <div className="flex justify-between items-center py-6">
                                    <span className="text-base md:text-lg font-bold text-gray-800">{t('cart.totalPrice')}</span>
                                    <span className="text-xl md:text-2xl font-black text-pink-500 tracking-tighter">₹ {total}</span>
                                </div>

                                {/* checkout button */}
                                <button
                                    onClick={handleCheckout}
                                    className="w-full text-sm md:text-base bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 md:py-4 uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-[0.98] cursor-pointer">
                                    {t('cart.checkoutNow')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 min-h-100">
                        <div className="w-18 h-18 md:w-24 md:h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <HiOutlineHeart className="text-pink-300 text-3xl md:text-5xl" />
                        </div>

                        {user?.role !== 'user' ? (
                            <>
                                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
                                    {t('cart.cartNotAvailable')}
                                </h2>
                                <p className="text-sm md:text-lg text-gray-500 mt-3 mb-10 max-w-70 md:max-w-md mx-auto leading-relaxed">
                                    {t('cart.cartNotAvailableDesc')}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
                                    {t('cart.emptyCart')}
                                </h2>
                                <p className="text-sm md:text-lg text-gray-500 mt-3 mb-10 max-w-70 md:max-w-md mx-alpha leading-relaxed">
                                    {t('cart.emptyCartDesc')}
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-pink-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all cursor-pointer">
                                    {t('cart.exploreProducts')}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export default CartItem;