
import React from 'react';
import { HiOutlineTrash, HiOutlineShoppingCart, HiOutlineHeart } from 'react-icons/hi';
import { useGetWishList } from '../../hook/useWishList';
import { useNavigate } from 'react-router-dom';
import { useWishList } from '../WishListContext';
import { useCart } from '../CartContext';
import { useTranslation } from 'react-i18next';

function UserProfileWishList() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { removeFromWishList } = useWishList();
    const { data: wishlistItems, isLoading, isError } = useGetWishList();

    if (isLoading) return <div className="py-20 text-center text-slate-400">{t('userProfile.wishlistLoading')}</div>;
    if (isError) return <div className="py-20 text-center text-red-400">{t('userProfile.wishlistError')}</div>;

    return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {wishlistItems.map((item) => {

                const product = item.productId;

                return (
                    <div
                        key={item._id}
                        className="group bg-slate-50/50 rounded-4xl p-4 border border-transparent hover:border-pink-100 hover:bg-white hover:shadow-xl hover:shadow-pink-100/20 transition-all duration-300 relative flex flex-col justify-between h-full">

                        <div>
                            <button
                                onClick={() => removeFromWishList(product?._id)}
                                className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-sm rounded-xl text-slate-400 hover:text-red-500 shadow-sm transition-all z-10 cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                <HiOutlineTrash size={16} />
                            </button>

                            {/* Image Container */}
                            <div
                                onClick={() => navigate(`/product_detail/${product?._id}/${product?.prodName}`)}
                                className="aspect-square rounded-3xl overflow-hidden mb-4 bg-white cursor-pointer">
                                <img
                                    src={product?.prodImage}
                                    alt={product?.prodName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="space-y-1 px-1">
                                <p className="text-[10px] font-black uppercase text-pink-500 tracking-widest">
                                    {product?.stock > 0 ? t('userProfile.inStock') : t('userProfile.outOfStock')}
                                </p>

                                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-pink-600 transition-colors min-h-10">
                                    {product?.prodName}
                                </h3>
                                <p className="text-lg font-black text-slate-900">
                                    ₹{product?.price}
                                </p>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={() => addToCart(product)}
                            className="w-full mt-4 py-3 bg-pink-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-transparent transition-all active:scale-95 cursor-pointer md:bg-white md:text-slate-700 md:border-slate-100 group-hover:bg-pink-500 group-hover:text-white group-hover:border-transparent whitespace-normal px-2"
                        >
                            <HiOutlineShoppingCart size={16} />
                            <span className="text-center">{t('userProfile.addToCart')}</span>
                        </button>
                    </div>
                )
            })}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
            <div className="py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineHeart size={40} className="text-slate-200" />
                </div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                    {t('userProfile.wishlistEmptyTitle')}
                </p>
            </div>
        )}
    </div>
);
};

export default UserProfileWishList;