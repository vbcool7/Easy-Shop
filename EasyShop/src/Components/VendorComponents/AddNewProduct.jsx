
import React from 'react';
import { useEffect, useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi";

import { HiOutlineCloudUpload, HiOutlineX, HiOutlinePhotograph } from "react-icons/hi";
import { useAddProduct, useVendorCategories, useVendorSubCategories } from '../../hook/uesProducts';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

function AddNewProduct({ setCurrentPage }) {

    const { user } = useAuthStore();
    // const vendorCategoryType = user?.category;

    // const { data: categories, isLoading: catLoading } = useVendorCategories();
    const { data: subCategories = [], isLoading } = useVendorSubCategories(user?.category);
    const { mutate: addProduct, isPending: isAdding } = useAddProduct();

    const [selectedSubCat, setSelectedSubCat] = useState(null);
    const [isSubOpen, setIsSubOpen] = useState(false);

    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState("");
    const [galleryImages, setGalleryImages] = useState([]);
    const MAX_GALLERY_IMAGES = 5;

    const [formData, setFormData] = useState({
        prodName: "",
        description: "",
        price: "",
        originalPrice: "",
        stock: "",
        attributes: {},
        variantStock: {}
    });

    const handleSubCategory = (subCatItem) => {
        setSelectedSubCat(subCatItem);
        setIsSubOpen(false);

        const initialAttributes = {};

        subCatItem.allowedAttributes?.forEach(attr => {
            if (attr.hasVariants && attr.type === "color") {
                initialAttributes[attr.name] = { values: [], images: {}, stock: {} };
            } else if (attr.hasVariants && attr.type === "size") {
                initialAttributes[attr.name] = { values: [], stock: {} };
            } else {
                initialAttributes[attr.name] = "";
            }
        });

        setFormData(prev => ({
            ...prev,
            stock: "",
            attributes: initialAttributes,
            variantStock: {}
        }));

        removeMainImage();
        setGalleryImages([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const hasColorVariant = selectedSubCat?.allowedAttributes?.some(
        attr => attr.hasVariants && attr.type === "color"
    );

    const hasSizeVariant = selectedSubCat?.allowedAttributes?.some(
        attr => attr.hasVariants && attr.type === "size"
    );

    const colorAttrName = selectedSubCat?.allowedAttributes?.find(
        attr => attr.hasVariants && attr.type === "color"
    )?.name;

    const sizeAttrName = selectedSubCat?.allowedAttributes?.find(
        attr => attr.hasVariants && attr.type === "size"
    )?.name;

    const colors = formData.attributes[colorAttrName]?.values || [];
    const sizes = formData.attributes[sizeAttrName]?.values || [];

    const vendorAddedColors = hasColorVariant && colors.length > 0;
    const vendorAddedSizes = hasSizeVariant && sizes.length > 0;

    const autoCalculatedStock = vendorAddedColors || vendorAddedSizes;

    const getVariantStockValue = (color, size) => {
        if (color && size) {
            return formData.variantStock?.[color]?.[size] ?? "";
        }

        if (color) {
            return formData.attributes[colorAttrName]?.stock?.[color] ?? "";
        }

        if (size) {
            return formData.attributes[sizeAttrName]?.stock?.[size] ?? "";
        }

        return formData.stock ?? "";
    };

    const updateVariantStock = (color, size, value) => {
        const stockValue = value === "" ? "" : Number(value);

        if (color && size) {
            setFormData(prev => ({
                ...prev,
                variantStock: {
                    ...prev.variantStock,
                    [color]: {
                        ...(prev.variantStock?.[color] || {}),
                        [size]: stockValue
                    }
                }
            }));
            return;
        }

        if (color) {
            const current = formData.attributes[colorAttrName];
            handleAttributeChange(colorAttrName, {
                ...current,
                stock: {
                    ...current.stock,
                    [color]: stockValue
                }
            });
            return;
        }

        if (size) {
            const current = formData.attributes[sizeAttrName];
            handleAttributeChange(sizeAttrName, {
                ...current,
                stock: {
                    ...current.stock,
                    [size]: stockValue
                }
            });
        }
    };

    const buildVariants = () => {
        if (colors.length && sizes.length) {
            return colors.flatMap(color =>
                sizes.map(size => ({
                    color,
                    size,
                    stock: Number(formData.variantStock?.[color]?.[size] || 0)
                }))
            );
        }

        if (colors.length) {
            return colors.map(color => ({
                color,
                size: null,
                stock: Number(formData.attributes[colorAttrName]?.stock?.[color] || 0)
            }));
        }

        if (sizes.length) {
            return sizes.map(size => ({
                color: null,
                size,
                stock: Number(formData.attributes[sizeAttrName]?.stock?.[size] || 0)
            }));
        }

        return [{
            color: null,
            size: null,
            stock: Number(formData.stock || 0)
        }];
    };

    const getTotalStock = () => {
        return buildVariants().reduce(
            (sum, item) => sum + Number(item.stock || 0),
            0
        );
    };

    const validateVariantStock = () => {
        if (colors.length && sizes.length) {
            for (const color of colors) {
                for (const size of sizes) {
                    const value = formData.variantStock?.[color]?.[size];

                    if (value === undefined || value === null || value === "") {
                        toast.error(`Please enter stock for ${color} / ${size}`);
                        return false;
                    }
                }
            }

            return true;
        }

        if (colors.length) {
            for (const color of colors) {
                const value = formData.attributes[colorAttrName]?.stock?.[color];

                if (value === undefined || value === null || value === "") {
                    toast.error(`Please enter stock for ${color}`);
                    return false;
                }
            }

            return true;
        }

        if (sizes.length) {
            for (const size of sizes) {
                const value = formData.attributes[sizeAttrName]?.stock?.[size];

                if (value === undefined || value === null || value === "") {
                    toast.error(`Please enter stock for size ${size}`);
                    return false;
                }
            }

            return true;
        }

        return true;
    };

    const handleAdd = () => {
        if (
            !formData.prodName ||
            (!autoCalculatedStock && formData.stock === "") ||
            !formData.description ||
            !formData.price ||
            !formData.originalPrice
        ) {
            return toast.error("All fields are required");
        }

        if (Number(formData.price) > Number(formData.originalPrice)) {
            return toast.error("Sale price cannot be more than MRP");
        }

        if (vendorAddedColors) {
            const colorData = formData.attributes[colorAttrName];

            for (const color of colorData.values) {
                const imgs = colorData.images?.[color];

                if (!imgs || imgs.length === 0) {
                    return toast.error(`Please upload at least one image for ${color}`);
                }
            }
        } else {
            if (!mainImage) return toast.error("Main Image is required");
            if (galleryImages.length === 0) return toast.error("At least one Gallery Image is required");
        }

        const attributesToValidate = selectedSubCat?.allowedAttributes || [];

        for (const attr of attributesToValidate) {
            const value = formData.attributes[attr.name];

            if (attr.hasVariants && (attr.type === "color" || attr.type === "size")) {
                continue;
            }

            if (!value || value.trim() === "") {
                return toast.error(`Please enter ${attr.name} attribute`);
            }
        }

        if (!validateVariantStock()) return;

        const variants = buildVariants();
        const totalStock = variants.reduce(
            (sum, item) => sum + Number(item.stock || 0),
            0
        );

        const data = new FormData();
        data.append("prodName", formData.prodName);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("originalPrice", formData.originalPrice);
        data.append("stock", totalStock);
        data.append("variants", JSON.stringify(variants));

        if (vendorAddedColors) {
            const colorData = formData.attributes[colorAttrName];

            const attributesForJSON = {};

            Object.entries(formData.attributes).forEach(([key, val]) => {
                if (key === colorAttrName) {
                    attributesForJSON[key] = {
                        values: val.values,
                        images: {}
                    };
                } else if (val?.values) {
                    attributesForJSON[key] = {
                        values: val.values
                    };
                } else {
                    attributesForJSON[key] = val;
                }
            });

            data.append("attributes", JSON.stringify(attributesForJSON));
            data.append("colorAttrName", colorAttrName);
            data.append("colorValues", JSON.stringify(colorData.values));

            colorData.values.forEach((color) => {
                const files = colorData.images?.[color] || [];
                files.forEach((file, idx) => {
                    data.append(`colorImg_${color}_${idx}`, file);
                });
            });
        } else {
            data.append("attributes", JSON.stringify(formData.attributes));
            if (mainImage) data.append("prodImage", mainImage);
            galleryImages.forEach((item) => data.append("prodImages", item.file));
        }

        addProduct({ subCat_id: selectedSubCat?._id, formData: data }, {
            onSuccess: (res) => {
                toast.success(res.message || "Product Successfully Added");

                setFormData({
                    prodName: "",
                    stock: "",
                    description: "",
                    price: "",
                    originalPrice: "",
                    attributes: {},
                    variantStock: {}
                });

                removeMainImage();
                setGalleryImages([]);
                setCurrentPage("All Products");
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Failed to add product");
            }
        });
    };

    const handleAttributeChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [name]: value }
        }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setMainImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (galleryImages.length + files.length > MAX_GALLERY_IMAGES) {
            alert(`You can only upload up to ${MAX_GALLERY_IMAGES} gallery images.`);
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryImages(prev => [...prev, { file, preview: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMainImage = () => {
        setMainImage(null);
        setMainImagePreview("");
    };

    const removeGalleryImage = (index) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className='min-h-screen bg-slate-50/50 p-4 md:p-8'>

            {/* Header */}
            <div className='max-w-4xl mx-auto p-4 md:p-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-t-xl md:rounded-t-3xl relative overflow-hidden'>
                {/* Decorative Circles */}
                <div className='absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl'></div>
                <div className='absolute -bottom-10 -left-10 h-24 w-24 bg-white/10 rounded-full blur-xl'></div>

                <div className='relative z-10 text-center md:text-start'>
                    <h1 className='text-xl md:text-2xl font-bold text-white mb-1'>Product Inventory Portal</h1>
                    <p className='text-pink-50 text-xs font-medium opacity-90'>
                        Complete the form below to showcase your product to millions.
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <div className='max-w-4xl mx-auto bg-white dark:bg-slate-900 p-5 md:p-8 rounded-b-xl md:rounded-b-3xl shadow-sm border border-pink-50 dark:border-slate-800'>

                {/* Category  */}
                <div className='mb-6 md:mb-8'>
                    <label className='ml-1 text-[12px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5 md:mb-2 block'>
                        Your Selected Category
                    </label>

                    <div className="w-full bg-slate-100 dark:bg-slate-800/50 px-4 md:px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                <HiOutlineInformationCircle className="text-pink-500" size={18} />
                            </div>
                            <div>
                                <span className="text-slate-800 dark:text-white font-bold text-sm md:text-base">
                                    {user?.category || 'General'}
                                </span>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                    Fixed based on your profile
                                </p>
                            </div>
                        </div>
                        <HiOutlineLockClosed className="text-slate-300" size={16} />
                    </div>
                </div>

                {/* sub cat */}
                <div className='mb-6 md:mb-8 '>
                    <label className='ml-1 text-[12px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5 md:mb-2 block'>
                        Select Sub-Category {isLoading && <span className="text-pink-400 animate-pulse text-[10px] ml-2">(Loading...)</span>}
                    </label>

                    <button
                        type="button"
                        disabled={isLoading || subCategories.length === 0}
                        onClick={() => setIsSubOpen(!isSubOpen)}
                        className={`w-full bg-slate-50 dark:bg-slate-800 px-4 md:px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl flex justify-between items-center transition-all border text-sm md:text-base
                        ${isSubOpen ? 'border-pink-400 ring-2 ring-pink-50' : 'border-transparent hover:border-pink-200'} 
                        ${(isLoading || subCategories.length === 0) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span className={`${selectedSubCat ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-400'} text-[11px] md:text-[14px] truncate mr-2`}>
                            {selectedSubCat ? selectedSubCat.subCatName : (subCategories.length === 0 ? 'No sub-categories available' : 'Choose sub-category...')}
                        </span>

                        <div className="shrink-0">
                            {isSubOpen ? <IoIosArrowUp className='text-pink-500' /> : <IoIosArrowDown className='text-slate-400' />}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isSubOpen && (
                        <div className='w-full mt-2 bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-2xl border border-pink-50 dark:border-slate-700 py-2 overflow-hidden animate-in fade-in zoom-in duration-200'>
                            <div className='max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700'>
                                {subCategories.length > 0 ? (
                                    subCategories.map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => handleSubCategory(item)}
                                            className='px-4 md:px-5 py-3 hover:bg-pink-50 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-pink-600 font-medium transition-colors text-[11px] md:text-[14px] border-b border-slate-50 dark:border-slate-800 last:border-none'
                                        >
                                            {item.subCatName}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-5 py-3 text-slate-400 text-xs italic text-center">
                                        No sub-categories found for this category.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {selectedSubCat && (
                    <div className="animate-in slide-in-from-top-4 duration-300">

                        {/* 2. Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                            {/* prod name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    name="prodName"
                                    value={formData.prodName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Premium Cotton Diapers"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all text-sm placeholder:text-[11px] md:placeholder:text-[14px]"
                                />
                            </div>

                            {/* stock - always visible */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={autoCalculatedStock ? getTotalStock() : formData.stock}
                                    onChange={!autoCalculatedStock ? handleInputChange : undefined}

                                    readOnly={autoCalculatedStock}
                                    placeholder="0"
                                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 text-sm
                                    ${autoCalculatedStock ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'focus:border-pink-400 outline-none'}`}
                                />
                                {autoCalculatedStock && (
                                    <p className="text-[11px] text-slate-400 ml-1">
                                        Auto calculated from variant stocks
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-pink-50/30 p-4 rounded-2xl border border-pink-100">

                            {/* selling price */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">
                                    Selling Price (₹)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring focus:ring-pink-400 text-sm placeholder:text-[11px] md:placeholder:text-[14px]"
                                />
                            </div>

                            {/* original price */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-500 ml-1">
                                    MRP / Original Price (₹)
                                </label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring focus:ring-pink-400 text-sm placeholder:text-[11px] md:placeholder:text-[14px]"
                                />
                            </div>

                            {/* description */}
                            <div className='flex flex-col gap-1.5 md:gap-2 col-span-full mt-2'>
                                <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                                    Description
                                </label>
                                <textarea
                                    rows="4"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Briefly describe this category..."
                                    className="p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring focus:ring-pink-400 dark:text-white text-sm transition-all resize-none placeholder:text-[11px] md:placeholder:text-[14px]" />
                            </div>
                        </div>

                        {/* 4. DYNAMIC ATTRIBUTES SECTION - if color/size */}
                        {selectedSubCat.allowedAttributes?.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                                    Specifications for {selectedSubCat.subCatName}
                                </h3>

                                <div className="space-y-6">
                                    {selectedSubCat.allowedAttributes.map((attr) => (
                                        <div key={attr._id}>

                                            {/* TEXT — no change */}
                                            {!attr.hasVariants && (
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[12px] font-medium text-slate-500 ml-1">
                                                        {attr.name} {attr.unit && `(${attr.unit})`}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Enter ${attr.name.toLowerCase()}...`}
                                                        value={formData.attributes[attr.name] || ""}
                                                        onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:border-pink-400 outline-none text-sm"
                                                    />
                                                </div>
                                            )}

                                            {/* SIZE — tag input with stock */}
                                            {attr.hasVariants && attr.type === 'size' && (
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[12px] font-medium text-slate-500 ml-1">
                                                        {attr.name} <span className="text-pink-400">(press Enter to add)</span>
                                                    </label>

                                                    {/* Size tags with stock input */}
                                                    <div className="space-y-2 mb-2">
                                                        {(formData.attributes[attr.name]?.values || []).map((size, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center gap-3 p-2.5 bg-pink-50 border border-pink-100 rounded-xl">

                                                                {/* Size name */}
                                                                <span className="text-xs font-black text-pink-600 w-10 shrink-0">
                                                                    {size}
                                                                </span>

                                                                {/* Stock input */}
                                                                {!vendorAddedColors && (
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <label className="text-[11px] text-slate-400 font-medium shrink-0">
                                                                            Stock:
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            placeholder="0"
                                                                            value={getVariantStockValue(null, size)}
                                                                            onChange={(e) => updateVariantStock(null, size, e.target.value)}
                                                                            className="w-20 px-3 py-1 bg-white rounded-lg border border-pink-100 text-xs font-bold outline-none focus:border-pink-400"
                                                                        />
                                                                    </div>
                                                                )}


                                                                {/* Remove size */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = formData.attributes[attr.name];
                                                                        const updatedValues = current.values.filter((_, idx) => idx !== i);
                                                                        const updatedStock = { ...current.stock };
                                                                        delete updatedStock[size];
                                                                        handleAttributeChange(attr.name, {
                                                                            ...current,
                                                                            values: updatedValues,
                                                                            stock: updatedStock
                                                                        });
                                                                    }}
                                                                    className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0"
                                                                >✕</button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Add new size input */}
                                                    <input
                                                        type="text"
                                                        placeholder="Size — press Enter"
                                                        className="w-full px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:border-pink-400 outline-none text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                                e.preventDefault();
                                                                const current = formData.attributes[attr.name] || { values: [], stock: {} };
                                                                const newSize = e.target.value.trim();
                                                                if (!current.values.includes(newSize)) {
                                                                    handleAttributeChange(attr.name, {
                                                                        ...current,
                                                                        values: [...current.values, newSize],
                                                                        stock: { ...current.stock, [newSize]: 0 }
                                                                    });
                                                                }
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* COLOR — add color + upload images + stock */}
                                            {attr.hasVariants && attr.type === 'color' && (
                                                <div className="flex flex-col gap-3">
                                                    <label className="text-[12px] font-medium text-slate-500 ml-1">
                                                        {attr.name} <span className="text-pink-400">(add color + images)</span>
                                                    </label>

                                                    {/* Existing colors */}
                                                    {(formData.attributes[attr.name]?.values || []).map((color, i) => (
                                                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm font-bold text-slate-700">{color}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = formData.attributes[attr.name];
                                                                        const updatedValues = current.values.filter((_, idx) => idx !== i);
                                                                        const updatedImages = { ...current.images };
                                                                        const updatedStock = { ...current.stock };
                                                                        delete updatedImages[color];
                                                                        delete updatedStock[color];
                                                                        handleAttributeChange(attr.name, {
                                                                            values: updatedValues,
                                                                            images: updatedImages,
                                                                            stock: updatedStock
                                                                        });
                                                                    }}
                                                                    className="text-red-400 text-xs font-bold hover:text-red-600"
                                                                >Remove</button>
                                                            </div>

                                                            {/* Stock input for this color */}
                                                            {!vendorAddedSizes && (
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <label className="text-[11px] text-slate-400 font-medium shrink-0">
                                                                        Stock:
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        placeholder="0"
                                                                        value={getVariantStockValue(color, null)}
                                                                        onChange={(e) => updateVariantStock(color, null, e.target.value)}
                                                                        className="w-20 px-3 py-1 bg-white rounded-lg border border-pink-100 text-xs font-bold outline-none focus:border-pink-400"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Image upload for this color */}
                                                            <div className="flex flex-col gap-2">
                                                                <p className="text-[11px] text-slate-400 font-medium">
                                                                    Upload images for {color}
                                                                </p>
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const files = Array.from(e.target.files);
                                                                        const current = formData.attributes[attr.name];
                                                                        handleAttributeChange(attr.name, {
                                                                            ...current,
                                                                            images: {
                                                                                ...current.images,
                                                                                [color]: files
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="text-xs text-slate-500"
                                                                />
                                                                <div className="flex gap-2 flex-wrap mt-1">
                                                                    {formData.attributes[attr.name]?.images?.[color]?.map((file, idx) => (
                                                                        <img
                                                                            key={idx}
                                                                            src={URL.createObjectURL(file)}
                                                                            className="w-14 h-14 object-cover rounded-lg border border-pink-100"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Add new color input */}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Red, Pink, Yellow"
                                                            className="flex-1 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:border-pink-400 outline-none text-sm"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                                    e.preventDefault();
                                                                    const current = formData.attributes[attr.name] || { values: [], images: {}, stock: {} };
                                                                    if (!current.values.includes(e.target.value.trim())) {
                                                                        handleAttributeChange(attr.name, {
                                                                            ...current,
                                                                            values: [...current.values, e.target.value.trim()],
                                                                            stock: { ...current.stock, [e.target.value.trim()]: 0 }
                                                                        });
                                                                    }
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                const input = e.target.previousSibling;
                                                                if (input.value.trim()) {
                                                                    const current = formData.attributes[attr.name] || { values: [], images: {}, stock: {} };
                                                                    if (!current.values.includes(input.value.trim())) {
                                                                        handleAttributeChange(attr.name, {
                                                                            ...current,
                                                                            values: [...current.values, input.value.trim()],
                                                                            stock: { ...current.stock, [input.value.trim()]: 0 }
                                                                        });
                                                                    }
                                                                    input.value = '';
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-lg hover:bg-pink-600"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {vendorAddedColors && vendorAddedSizes && (
                                    <div className="mt-8">
                                        <h4 className="text-sm font-bold text-slate-800 mb-3">
                                            Variant Stock Matrix
                                        </h4>

                                        <div className="overflow-x-auto border border-pink-100 rounded-xl">
                                            <table className="w-full min-w-130 text-xs">
                                                <thead className="bg-pink-50">
                                                    <tr>
                                                        <th className="text-left p-3 font-bold text-slate-600">
                                                            Color / Size
                                                        </th>
                                                        {sizes.map((size) => (
                                                            <th key={size} className="p-3 font-bold text-slate-600 text-center">
                                                                {size}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {colors.map((color) => (
                                                        <tr key={color} className="border-t border-pink-50">
                                                            <td className="p-3 font-bold text-pink-600">
                                                                {color}
                                                            </td>

                                                            {sizes.map((size) => (
                                                                <td key={`${color}-${size}`} className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        placeholder="0"
                                                                        value={getVariantStockValue(color, size)}
                                                                        onChange={(e) => updateVariantStock(color, size, e.target.value)}
                                                                        className="w-20 mx-auto block px-3 py-2 bg-white rounded-lg border border-pink-100 text-xs font-bold text-center outline-none focus:border-pink-400"
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        {/* 5. upload image section - if color/size not select */}
                        {!vendorAddedColors && (
                            <div className="bg-white dark:bg-slate-900">

                                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 md:mb-6">
                                    Product Media
                                </h2>

                                <div className="space-y-6 md:space-y-8">

                                    {/* --- Main Product Image --- */}
                                    <div className="flex flex-col gap-3">

                                        <label className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400">
                                            Main Product Image <span className="text-pink-500">(Required)</span>
                                        </label>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">

                                            {/* Upload image */}
                                            <div className="relative h-45 md:h-52 border-2 border-dashed border-pink-100 dark:border-slate-700 rounded-2xl md:rounded-4xl flex flex-col items-center justify-center bg-pink-50/10 hover:bg-pink-50/30 transition-all cursor-pointer group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleMainImageChange}
                                                    className="absolute inset-0 opacity-0 z-10 cursor-pointer" />

                                                <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                                                    <HiOutlinePhotograph className="text-4xl text-pink-400 mb-2" />
                                                    <p className="text-xs text-pink-500 font-bold">Upload Main Image</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 italic text-center px-4">Best size: 1080x1080px</p>
                                                </div>
                                            </div>

                                            {/* Preview Box */}
                                            {mainImagePreview && (
                                                <div className="relative h-45 md:h-52 rounded-2xl md:rounded-4xl overflow-hidden border border-pink-100 dark:border-slate-800 shadow-sm group animate-in fade-in zoom-in duration-300">

                                                    <img
                                                        src={mainImagePreview}
                                                        alt="Main Preview"
                                                        className="w-full h-full object-cover" />

                                                    <button
                                                        type="button"
                                                        onClick={removeMainImage}
                                                        className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full text-pink-500 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <HiOutlineX size={16} />
                                                    </button>
                                                    <span className="absolute bottom-3 left-3 bg-pink-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold shadow-lg">Primary</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gallery Images */}
                                    <div className="flex flex-col gap-3">

                                        {/* heading */}
                                        <div className="flex justify-between items-center mb-1">

                                            <label className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                Additional Gallery Images
                                            </label>

                                            <span className="text-[10px] md:text-xs text-center font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                {galleryImages.length} / {MAX_GALLERY_IMAGES} slots
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">

                                            {/* Gallery Upload Box */}
                                            <div className={`aspect-square border-2 border-dashed border-pink-100 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-pink-50/10 hover:bg-pink-50/30 transition-all relative 
                                    ${galleryImages.length >= MAX_GALLERY_IMAGES ? 'hidden' : 'flex'}`}>

                                                <input
                                                    type="file"
                                                    multiple accept="image/*"
                                                    onChange={handleGalleryImageChange}
                                                    disabled={galleryImages.length >= MAX_GALLERY_IMAGES}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" />

                                                <HiOutlineCloudUpload className="text-3xl text-pink-400 mb-1" />
                                                <p className="text-[10px] text-pink-500 font-bold">Add Images</p>
                                            </div>

                                            {/* Gallery Previews */}
                                            {galleryImages.map((img, i) => (
                                                <div
                                                    key={i}
                                                    className="relative aspect-square rounded-2xl overflow-hidden border border-pink-50 dark:border-slate-800 shadow-sm group animate-in fade-in duration-300">
                                                    <img
                                                        src={img.preview}
                                                        alt={`Gallery Preview ${i + 1}`}
                                                        className="w-full h-full object-cover" />

                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(i)}
                                                        className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-slate-800/90 p-1 rounded-full text-red-500 shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <HiOutlineX size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='col-span-full flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 md:mt-6 pt-6 border-t border-slate-50 dark:border-slate-800'>
                            <button
                                type="button"
                                onClick={() => setCurrentPage('All Products')}
                                className='w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-pink-500 hover:bg-pink-100 transition-all active:scale-95 cursor-pointer'
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={isAdding}
                                className={`w-full sm:w-auto md:px-10 py-2.5 rounded-xl text-sm font-bold text-white transition-all
                                    ${isAdding
                                        ? 'bg-slate-300 shadow-none cursor-not-allowed opacity-70'
                                        : 'bg-linear-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-100 hover:shadow-pink-200 active:scale-95 cursor-pointer'
                                    }`}
                            >
                                {isAdding ? "Publishing..." : "Publish Product"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddNewProduct;