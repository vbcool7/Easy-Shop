
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { IoMdStar } from "react-icons/io";
import { IoBagHandleOutline } from "react-icons/io5";
import { BiPurchaseTagAlt } from "react-icons/bi";
import { CiDeliveryTruck } from "react-icons/ci";
import { PiMoneyWavyLight } from "react-icons/pi";
import { TbRefresh } from "react-icons/tb";
import { IoIosArrowForward } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";
import { IoChatbubblesOutline } from "react-icons/io5";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useCart } from './CartContext';
import { useWishList } from './WishListContext';

import Breadcrumbs from './Breadcrumbs';
import ProductDetailSimilarProd from './ProductDetailSimilarProd';
import ProductDetailReview from './ProductDetailReview';
import EasyShopLoader from './EasyShopLoader';
import UserChat from './UserChat';

import { useProductDetail } from '../hook/uesProducts';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

function ProductDetail() {

    const { prodId, prodName } = useParams();
    const { addToCart } = useCart();
    const { wishListItems, addToWishList } = useWishList();

    const { user } = useAuthStore();
    const navigate = useNavigate();

    const { data: product, isLoading, isError } = useProductDetail(prodId);

    const [mainImage, setMainImage] = useState(null);
    const [isSellerInfoOpen, setIsSellerInfoOpen] = useState(false);
    const [isSpecificationOpen, setIsSpecificationOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [pincode, setPincode] = useState("");
    const [estimatedDate, setEstimatedDate] = useState("");
    const [qty, setQty] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // detect variants
    const colorAttr = product?.attributes?.Color;
    const sizeAttr = product?.attributes?.Size;
    const hasColorVariant = colorAttr?.values?.length > 0;
    const hasSize = sizeAttr?.values?.length > 0;

    // selected color/size state — change from index to actual value
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    // set default color on product load
    useEffect(() => {
        if (product) {
            setMainImage(product.prodImage);
            if (hasColorVariant) {
                setSelectedColor(colorAttr.values[0]);
            }
        }
    }, [prodId, product]);

    const colorStock = colorAttr?.stock || {};
    const sizeStock = sizeAttr?.stock || {};

    const hasColorStock = hasColorVariant && Object.keys(colorStock).length > 0;
    const hasSizeStock = hasSize && Object.keys(sizeStock).length > 0;

    const currentStock = hasColorStock && selectedColor
        ? colorStock[selectedColor] ?? 0
        : hasSizeStock && selectedSize
            ? sizeStock[selectedSize] ?? 0
            : product?.stock ?? 0;


    // when color changes → update images
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setQty(1);

        const colorImages = colorAttr?.images?.[color] || [];
        if (colorImages.length > 0) {
            setMainImage(colorImages[0]);
        }
    };

    // get current thumbnails based on selected color
    const currentThumbnails = hasColorVariant && selectedColor
        ? (colorAttr?.images?.[selectedColor] || [])
        : (product?.prodImages || []);

    // set main image when product loads
    useEffect(() => {
        if (product) {
            setMainImage(product.prodImage);
        }
    }, [prodId, product]);

    const breadcrumbItems = [
        { label: "Home", path: "/" },
        {
            label: product?.subCatId?.subCatName || "Shop",
            path: `/all_products/${product?.catId?._id}/${product?.catId?.catName}?subCatId=${product?.subCatId?._id}`
        },
        { label: product?.prodName || "Product" }
    ];

    // wishlist
    const isFavorite = wishListItems.some((wishItem) => {
        const wishId = wishItem.productId?._id || wishItem._id || wishItem.id;
        const currentProdId = product?._id || product?.id;
        const idMatch = wishId === currentProdId;

        // if product has color variants, also check color matches
        if (hasColorVariant) {
            return idMatch && wishItem.selectedColor === selectedColor;
        }
        return idMatch;
    });

    const handleAddToWishList = (e) => {
        e.stopPropagation();

        addToWishList({
            ...product,
            id: product?._id || product?.id,
            prodImage: mainImage,  // use currently displayed image
            selectedColor: selectedColor || null,
            selectedSize: selectedSize || null
        });
    };

    const handleAddToCart = () => {
        if (hasSize && !selectedSize) {
            toast.error("Please select a size");
            return;
        }
        // check size stock
        if (hasSize && selectedSize) {
            const sizeStock = sizeAttr?.stock?.[selectedSize] ?? 0;
            if (sizeStock === 0) {
                toast.error(`${selectedSize} is out of stock`);
                return;
            }
        }
        addToCart({
            ...product,
            id: product._id || product.id,
            selectedColor: selectedColor || null,
            selectedSize: selectedSize || null,
            prodImage: mainImage
        });
    };

    // handle Buy-Now
    const handleBuyNow = () => {

        if (!user) {
            toast.error("Please login to place order");
            navigate('/login');
            return;
        }

        if (hasSize && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        const checkOutData = {
            items: [{
                id: product._id,
                name: product.prodName,
                price: product.price,
                quantity: qty,
                img: mainImage,
                selectedColor: selectedColor || null,
                selectedSize: selectedSize || null,
            }],
            total: product.price * qty,
            isDirectBuy: true
        };
        navigate('/place_order', { state: checkOutData });
    };

    // pincode check — no change needed
    const handleCheck = () => {
        const pinRegex = /^[1-9][0-9]{5}$/;
        if (!pinRegex.test(pincode)) {
            alert("Please enter a valid 6-digit pincode");
            setShowDetails(false);
            return;
        }
        if (pincode.length === 6) {
            let days = 5;
            if (pincode.startsWith('11')) days = 2;
            if (pincode.startsWith('40') || pincode.startsWith('45')) days = 3;
            const deliveryDateObj = new Date();
            deliveryDateObj.setDate(deliveryDateObj.getDate() + days);
            const formattedDate = deliveryDateObj.toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short'
            });
            setEstimatedDate(formattedDate);
            setShowDetails(true);
        }
    };

    const handleInc = () => {
        if (qty < currentStock) {
            setQty(qty + 1);
        } else {
            toast.error(`Only ${currentStock} items available`);
        }
    };

    const handleDec = () => {
        if (qty > 1)
            setQty(qty - 1);
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setQty(1);
    }

    // chat btn
    const handleChatWithSeller = () => {
        if (!user) {
            toast.error("Please login to chat with seller");
            navigate('/login');
            return;
        } else if (!product?.vendorId?._id) {
            return;
        } else {
            setIsChatOpen(true);
        }
    }

    if (isLoading) return <EasyShopLoader />;
    if (isError || !product) return <div className="p-20 text-center">Product Not Found!</div>;

    return (
        <section className="w-full pb-5 pt-2 px-4 lg:px-6">

            {/* home cat name and product name */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* main section */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 ">

                {/* left side - image section*/}
                <div className='w-full md:w-[60%] flex flex-col-reverse lg:flex-row gap-4 h-fit md:sticky md:top-24'>

                    {/* Thumbnails List: Mobile/Tablet par Horizontal, Desktop (lg) par Vertical */}
                    <div className='flex flex-row lg:flex-col gap-3 w-full lg:w-20 overflow-x-auto lg:overflow-y-auto no-scrollbar py-2 lg:py-0'>
                        {currentThumbnails.map((img, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setMainImage(img)}
                                onClick={() => setMainImage(img)}
                                className={`w-20 h-20 lg:w-full lg:h-24 border-2 cursor-pointer rounded-sm lg:rounded-md overflow-hidden transition-all shrink-0
                                ${mainImage === img ? 'border-pink-500' : 'border-transparent'}`}
                            >
                                <img
                                    src={img}
                                    alt="thumb"
                                    className='w-full h-full object-cover' />
                            </div>
                        ))}
                    </div>

                    {/* Main Big Image */}
                    <div className='flex-1 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-100 overflow-hidden relative group cursor-zoom-in'>

                        <div className='w-full h-full aspect-square lg:aspect-4/3 '>
                            <img
                                key={mainImage}
                                src={mainImage}
                                alt={product?.prodName}
                                className='w-full h-full  object-cover transition-transform duration-700 lg:group-hover:scale-110'
                            />
                        </div>

                        {/* Wishlist Button */}
                        <button
                            onClick={handleAddToWishList}
                            className={`absolute top-3 right-3 md:top-5 md:right-5 z-20 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-90 border cursor-pointer
                                ${isFavorite
                                    ? 'bg-pink-500 text-white border-pink-500'
                                    : 'bg-white/70 backdrop-blur-md text-gray-600 border-white hover:bg-white hover:text-pink-500'}`}
                        >
                            <div className="transition-transform duration-300 ">
                                {isFavorite ? <GoHeartFill className='text-xl ' /> : <GoHeart className='text-xl ' />}
                            </div>
                        </button>

                        {/* Mobile Badge: Sirf desktop se niche dikhega */}
                        <div className="lg:hidden absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                            {product?.prodImages?.indexOf(mainImage) + 1} / {product?.prodImages?.length}
                        </div>
                    </div>
                </div>

                {/* right side - detail section*/}
                <div className='w-full md:w-[40%] flex flex-col gap-2 md:gap-4'>

                    {/* heading and desc */}
                    <div className='flex flex-col gap-1'>
                        <h1 className='text-[20px] md:text-3xl text-gray-800 font-semibold leading-tight'>
                            {product?.prodName}
                        </h1>
                        <p className='line-clamp-1 text-sm md:text-[18px] text-gray-500 font-normal leading-relaxed'>
                            {product?.description}
                        </p>
                    </div>

                    {/* Rating Badge */}
                    <div className='flex items-center gap-2 w-fit px-2 py-1 mt-2 cursor-pointer transition-all duration-300'>
                        <div className='flex items-center font-bold bg-pink-100 text-pink-500 rounded-full px-2'>

                            <span className='text-xs md:text-[16px]'>
                                {product?.averageRating}
                            </span>
                            <IoMdStar className='text-pink-500 text-[18px]' />

                        </div>
                        <p className='text-xs md:text-[14px] text-gray-500 font-medium'>
                            22 Ratings
                        </p>
                    </div>

                    <hr className='my-1 md:my-2 border-gray-300' />

                    {/* Price Tag */}
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-black text-[20px] md:text-2xl font-semibold">
                            ₹{product?.price}
                        </span>

                        <div className='flex items-center gap-1 text-gray-500'>
                            <span className='text-sm md:text-lg font-normal'>
                                MRP
                            </span>
                            <span className="text-sm md:text-lg line-through">
                                ₹{product?.originalPrice}
                            </span>
                        </div>

                        <span className="text-green-600 text-lg md:text-xl font-bold">
                            (10% OFF)
                        </span>
                    </div>

                    <p className='text-sm md:text-[15px] text-gray-500'>
                        inclusive of all taxes
                    </p>

                    <hr className='my-1 md:my-2 border-gray-300' />

                    {/* Color Selector */}
                    {hasColorVariant && (
                        <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-800 mb-2">
                                Color: <span className="text-pink-500 font-bold">{selectedColor}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {colorAttr.values.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handleColorSelect(color)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer
                                            ${selectedColor === color
                                                ? 'border-pink-500 bg-pink-50 text-pink-600'
                                                : 'border-gray-200 text-gray-600 hover:border-pink-300'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selector */}
                    {hasSize && (
                        <div className="mb-3">

                            <p className="text-sm font-semibold text-gray-800 mb-2">
                                Size: <span className="text-pink-500 font-bold">{selectedSize || 'Select Size'}</span>

                                {/* Low stock warning */}
                                {selectedSize && sizeAttr?.stock?.[selectedSize] > 0 && sizeAttr?.stock?.[selectedSize] <= 5 && (
                                    <span className="ml-2 text-orange-500 text-xs font-bold">
                                        Only {sizeAttr.stock[selectedSize]} left!
                                    </span>
                                )}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sizeAttr.values.map((size) => {
                                    const sizeStock = sizeAttr?.stock?.[size] ?? 0;
                                    const isOutOfStock = sizeStock === 0;

                                    return (
                                        <button
                                            key={size}
                                            onClick={() => !isOutOfStock && handleSizeSelect(size)}
                                            disabled={isOutOfStock}
                                            className={`px-3 h-10 rounded-lg text-xs font-bold border-2 transition-all relative
                                                ${isOutOfStock
                                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                                                    : selectedSize === size
                                                        ? 'border-pink-500 bg-pink-500 text-white cursor-pointer'
                                                        : 'border-gray-200 text-gray-600 hover:border-pink-300 cursor-pointer'
                                                }`}
                                        >
                                            {isOutOfStock ? (
                                                <span className="flex flex-col items-center leading-tight">
                                                    <span className="line-through">{size}</span>
                                                    <span className="text-[8px] text-red-400 font-black">Out</span>
                                                </span>
                                            ) : size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* quantity section */}
                    <div className='mt-1 md:mt-0 flex flex-row items-start md:flex-col gap-2 md:gap-0'>
                        <span className="text-[16px] md:text-xl text-black font-semibold">
                            Quantity
                        </span>

                        <div className="flex items-center justify-between w-28 md:w-32 text-gray-700 border-2 border-gray-200 rounded-lg py-1 px-1 md:py-2 md:px-2 md:my-4">

                            <button
                                onClick={handleDec}
                                className="p-1 text-pink-500 font-bold hover:bg-pink-50 rounded-md transition-colors cursor-pointer">
                                <FaMinus className="text-xs md:text-sm" />
                            </button>

                            <span className="px-2 font-bold text-sm md:text-base">
                                {qty}
                            </span>

                            <button
                                onClick={handleInc}
                                className="p-1 text-pink-500 font-bold hover:bg-pink-50 rounded-md transition-colors cursor-pointer">
                                <FaPlus className="text-xs md:text-sm" />
                            </button>
                        </div>

                        {/* max stock hint */}
                        <p className="text-[11px] text-gray-400 font-medium">
                            {currentStock} in stock
                            {hasSize && selectedSize ? ` for size ${selectedSize}` : ""}
                            {hasColorStock && selectedColor && !hasSizeStock ? ` for ${selectedColor}` : ""}
                        </p>

                    </div>

                    <hr className='my-1 md:my-2 border-gray-300' />

                    {/* cart and buy buttons */}
                    <div className='my-3 flex flex-col sm:flex-row items-stretch gap-3 md:gap-4'>

                        <div className="hidden sm:flex flex-1 items-center gap-3">
                            <button
                                onClick={handleAddToCart}
                                className='flex-1 py-3.5 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md active:scale-95 transition-all font-bold uppercase text-sm'
                            >
                                <IoBagHandleOutline className='text-xl' />
                                <span>Add to Bag</span>
                            </button>

                            <button
                                onClick={handleBuyNow}
                                className='flex-1 py-3.5 flex items-center justify-center gap-2 border border-pink-500 text-pink-500 rounded-md hover:bg-pink-50 active:scale-95 transition-all font-bold uppercase text-sm'
                            >
                                <BiPurchaseTagAlt className='text-xl' />
                                <span>Buy Now</span>
                            </button>
                        </div>

                        {/* Mobile View (Stacked for better reach) */}
                        <div className="flex sm:hidden flex-col gap-3">
                            <button
                                onClick={handleAddToCart}
                                className='w-full py-3.5 flex items-center justify-center gap-2 bg-pink-500 text-white rounded-md active:scale-95 transition-all font-bold uppercase text-sm shadow-sm'
                            >
                                <IoBagHandleOutline className='text-lg' />
                                Add to Bag
                            </button>

                            <button
                                onClick={handleBuyNow}
                                className='w-full py-3.5 flex items-center justify-center gap-2 border border-pink-500 text-pink-500 rounded-md active:scale-95 transition-all font-bold uppercase text-sm'
                            >
                                <BiPurchaseTagAlt className='text-lg' />
                                Buy Now
                            </button>
                        </div>
                    </div>

                    {/* chat with seller button */}
                    <button
                        onClick={handleChatWithSeller}
                        disabled={!product?.vendorId?._id}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-6 border-2 border-pink-500 text-pink-500 font-bold rounded-lg transition-all duration-300 hover:bg-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-200 active:scale-[0.98] group cursor-pointer">
                        <IoChatbubblesOutline className="text-lg md:text-xl group-hover:scale-110 transition-transform" />
                        <span className="tracking-wide uppercase text-xs md:text-sm">
                            Chat with Seller
                        </span>
                    </button>

                    {/* delivery info */}
                    <div className='my-4 md:my-2'>
                        <span className="text-[16px] md:text-xl text-black font-semibold">
                            Ship To
                        </span>

                        <div className='flex overflow-hidden pt-3 md:pt-4'>
                            <input
                                type="text"
                                placeholder='Enter a pin code'
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                className='px-3 py-2.5 md:py-2 border border-gray-400 outline-none w-full text-sm placeholder:text-gray-400 rounded-l-md focus:border-pink-500 transition-colors'
                            />
                            <button
                                onClick={handleCheck}
                                className='bg-pink-500 hover:bg-pink-600 px-5 py-2.5 md:py-2 text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-r-md shrink-0'>
                                Check
                            </button>
                        </div>
                    </div>

                    {/* support section */}
                    {showDetails && (
                        <div className='my-2 space-y-2 p-3 md:p-0'>

                            <div className='flex items-start md:items-center gap-3'>
                                <CiDeliveryTruck className='text-2xl md:text-3xl text-gray-600 shrink-0' />
                                <h1 className='text-sm md:text-md text-gray-700 leading-tight'>
                                    Delivery by <strong>{estimatedDate}</strong>
                                </h1>
                            </div>

                            <div className='flex items-start md:items-center gap-3'>
                                <PiMoneyWavyLight className='text-2xl md:text-3xl text-gray-600 shrink-0' />
                                <h1 className='text-sm md:text-md text-gray-700 leading-tight'>
                                    Cash on Delivery | <span className='text-green-600 font-semibold'>Available</span>
                                </h1>
                            </div>

                            <div className='flex items-start md:items-center gap-3'>
                                <TbRefresh className='text-2xl md:text-3xl text-gray-600 shrink-0' />
                                <h1 className='text-sm md:text-md text-gray-700 leading-tight'>
                                    7 Days Return and Replacement available
                                </h1>
                            </div>
                        </div>
                    )}

                    <hr className='my-1 md:my-2 border-gray-300' />

                    {/* seller info */}
                    <div className='my-2'>
                        <span className="text-[16px] md:text-xl text-black font-semibold">
                            Sold By
                        </span>

                        <div
                            onClick={() => setIsSellerInfoOpen(!isSellerInfoOpen)}
                            className='w-full flex justify-between items-center border border-gray-400 hover:border-pink-300 px-2 py-3 md:py-2 mt-4 rounded-lg cursor-pointer'>
                            <h1 className='text-[12px] md:text-[14px] font-bold text-pink-500 hover:text-pink-600'>
                                {product.vendorId.storeName}
                            </h1>
                            <IoIosArrowForward className='text-lg hover:text-pink-500 transition-transform' />
                        </div>
                    </div>

                    {/* Product Detail Attributes — Accordion Style */}
                    {product?.attributes && Object.keys(product.attributes).length > 0 && (
                        <div className='my-3'>
                            <div
                                onClick={() => setIsSpecificationOpen(!isSpecificationOpen)}
                                className='flex justify-between items-center py-3 cursor-pointer group'
                            >
                                <span className="text-[16px] md:text-xl text-black font-semibold group-hover:text-pink-500 transition-colors">
                                    Product Details
                                </span>
                                <div className="text-xl text-gray-600">
                                    {isSpecificationOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                </div>
                            </div>

                            {isSpecificationOpen && (
                                <div className='animate-fadeIn'>
                                    {Object.entries(product.attributes).map(([key, value], index) => (
                                        <div key={index} className='flex py-2 gap-4 items-center'>
                                            <div className='w-[40%]'>
                                                <p className='text-xs md:text-sm bg-pink-50 text-pink-500 font-semibold px-2 py-1.5 rounded-md'>
                                                    {key}
                                                </p>
                                            </div>
                                            <div className='w-[60%]'>
                                                <p className='text-xs md:text-sm text-gray-700 font-medium px-2'>
                                                    {Array.isArray(value) ? value.join(', ') : value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <hr className='my-1 md:my-2 border-gray-300' />

                    {/* visit shop btn */}
                    <div className='my-4 flex flex-col w-full space-y-3 border-2 border-pink-100 bg-pink-50/30 p-5 rounded-2xl'>
                        {/* Brand Name */}
                        <h1 className='text-md md:text-lg font-bold text-gray-800 uppercase tracking-tight'>
                            {product.vendorId.storeName}
                        </h1>

                        {/* Description */}
                        <p className='text-xs md:text-sm text-gray-600 leading-relaxed'>
                            {product.vendorId.aboutShop}
                        </p>

                        {/* Visit Shop Button */}
                        <button
                            onClick={() => navigate(`/shop/${product?.vendorId?._id}`, {
                                state: {
                                    storeName: product?.vendorId?.storeName,
                                    storeLogo: product?.vendorId?.storeLogo,
                                    aboutShop: product?.vendorId?.aboutShop,
                                    city: product?.vendorId?.city,
                                    state: product?.vendorId?.state,
                                }
                            })}
                            className='mt-2 py-2.5 text-sm md:text-md border-2 border-pink-500 rounded-xl text-pink-500 font-bold hover:bg-pink-500 hover:text-white transition-all duration-300 cursor-pointer uppercase'>
                            Visit Shop
                        </button>
                    </div>

                </div>
            </div>

            {/*===== review products ======*/}
            <ProductDetailReview
                prodId={prodId}
            />

            {/*====== similar products ========*/}
            <ProductDetailSimilarProd
                prodId={prodId}
            />

            {/*========= chat ========*/}
            {product?.vendorId?._id && (
                <UserChat
                    isOpen={isChatOpen}
                    setIsOpen={setIsChatOpen}
                    vendorId={product.vendorId._id}
                />
            )}

            {/*========= about shop popup section=========== */}
            <div
                className={`fixed inset-0 flex justify-center items-center bg-[#00000080] backdrop-blur-sm z-50 px-4 transition-all duration-500 
                ${isSellerInfoOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>

                <div
                    className={`bg-white p-6 rounded-xl shadow-2xl h-auto w-[60%] 
                    transition-all duration-500 transform 
                    ${isSellerInfoOpen ? "translate-y-0 scale-100" : "-translate-y-100 scale-90"}`}>

                    <div className="w-full">

                        {/* icon and heading */}
                        <div className='flex justify-between'>
                            <h1 className='text-[23px] font-semibold'>
                                Seller Information
                            </h1>
                            <IoCloseSharp
                                onClick={() => setIsSellerInfoOpen(false)}
                                className="text-[20px] text-gray-600 cursor-pointer" />
                        </div>

                        <hr className='my-2 border-gray-300' />

                        {/* about seller */}
                        <div className='pt-4'>
                            <h1 className='text-md font-semibold py-2 uppercase'>
                                {product?.vendorId?.storeName}
                            </h1>
                            <p className='text-gray-500'>
                                {product?.vendorId?.aboutShop}
                            </p>
                        </div>

                        <div className='pt-6 border-t border-gray-100 mt-4'>

                            <div className='mb-4'>
                                <p className='text-md font-semibold text-gray-900'>Seller Code :</p>
                                <p className='text-gray-500 font-mono text-sm'>
                                    {/* Vendor DB ki ID access kar rahe hain */}
                                    {product?.vendorId?._id?.slice(-6).toUpperCase() || '---'}
                                </p>
                            </div>

                            {/* Seller Contact & Address */}
                            <div className='mb-2'>
                                <p className='text-md font-semibold text-gray-900'>
                                    Sold By & Contact Address:
                                </p>
                                <p className='text-pink-600 font-medium mb-1'>
                                    {product?.vendorId?.shopName || product?.vendorId?.name}
                                </p>
                                <p className='text-gray-500 leading-relaxed text-sm'>
                                    {/* Dynamic Address Fields */}
                                    {product?.vendorId?.address}, <br />
                                    {product?.vendorId?.city}, {product?.vendorId?.state} - {product?.vendorId?.pincode}
                                </p>
                            </div>

                            <div className='pt-6 text-[16px]'>
                                <p className='text-pink-600 font-semibold'>
                                    Email : {product.vendorId.businessEmail}
                                </p>
                                <p className='text-pink-600 font-semibold'>
                                    Contact : {product.vendorId.businessContact}
                                </p>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

        </section>
    )
}

export default ProductDetail;