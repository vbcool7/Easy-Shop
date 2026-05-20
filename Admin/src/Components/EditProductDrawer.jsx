
import React, { useEffect, useState } from 'react';
import { HiOutlineX, HiOutlineSave, HiOutlineInformationCircle } from "react-icons/hi";
import { useUpdateProduct, useUpdateProductStatus } from '../hooks/useProducts';
import toast from 'react-hot-toast';

const EditProductDrawer = ({ product, isOpen, onClose }) => {

    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    const { mutate: toggleStatus, isPending: isStatusUpdating } = useUpdateProductStatus();

    const [mainImage, setMainImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [variantStock, setVariantStock] = useState({});

    // status toggle
    const statusStyles = {
        Approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Pending: 'bg-amber-50  text-amber-600  border-amber-200',
        Rejected: 'bg-rose-50   text-rose-600   border-rose-200',
    };

    const [formData, setFormData] = useState({
        prodName: "",
        description: "",
        price: "",
        originalPrice: "",
        stock: "",
        status: "Pending",
        isActive: true,
        attributes: {}
    });

    // derived variant info from product
    const colorAttrName = product?.attributes
        ? Object.keys(product.attributes).find(key =>
            product.attributes[key]?.values && product.attributes[key]?.images
        )
        : null;

    const sizeAttrName = product?.attributes
        ? Object.keys(product.attributes).find(key =>
            product.attributes[key]?.values && !product.attributes[key]?.images
        )
        : null;

    const colors = formData.attributes?.[colorAttrName]?.values || [];
    const sizes = formData.attributes?.[sizeAttrName]?.values || [];
    const colorImages = formData.attributes?.[colorAttrName]?.images || {};

    // colors images
    colors.map(color => {
        const images = colorImages[color] || [];

        return (
            <div key={color}>
                <h5>{color}</h5>

                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`${color}-${index}`}
                    />
                ))}
            </div>
        );
    });

    const hasColorVariant = colors.length > 0;
    const hasSizeVariant = sizes.length > 0;

    // Refill Logic
    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                prodName: product.prodName || "",
                description: product.description || "",
                price: product.price || "",
                originalPrice: product.originalPrice || "",
                stock: product.stock || "",
                status: product.status || "Pending",
                isActive: product.isActive ?? true,
                // each prod have differ attr then copy it
                attributes: product.attributes ? { ...product.attributes } : {}
            });

            // pre-fill variant stock from existing variants
            const existingVariantStock = {};
            if (product.variants?.length > 0) {
                product.variants.forEach(v => {
                    if (v.color && v.size) {
                        if (!existingVariantStock[v.color]) existingVariantStock[v.color] = {};
                        existingVariantStock[v.color][v.size] = v.stock;
                    } else if (v.color) {
                        if (!existingVariantStock[v.color]) existingVariantStock[v.color] = {};
                        existingVariantStock[v.color]['__color__'] = v.stock;
                    } else if (v.size) {
                        if (!existingVariantStock[v.size]) existingVariantStock[v.size] = {};
                        existingVariantStock[v.size]['__size__'] = v.stock;
                    }
                });
            }
            setVariantStock(existingVariantStock);
            setMainImage(null);
            setGalleryImages([]);
        }
    }, [product, isOpen]);

    const buildVariants = () => {
        if (colors.length && sizes.length) {
            return colors.flatMap(color =>
                sizes.map(size => ({
                    color,
                    size,
                    stock: Number(variantStock?.[color]?.[size] || 0)
                }))
            );
        }
        if (colors.length) {
            return colors.map(color => ({
                color,
                size: null,
                stock: Number(variantStock?.[color]?.['__color__'] || 0)
            }));
        }
        if (sizes.length) {
            return sizes.map(size => ({
                color: null,
                size,
                stock: Number(variantStock?.[size]?.['__size__'] || 0)
            }));
        }
        return [{ color: null, size: null, stock: Number(formData.stock || 0) }];
    };

    const getTotalStock = () => {
        return buildVariants().reduce((sum, v) => sum + Number(v.stock || 0), 0);
    };

    const handleMainImage = (e) => {
        if (e.target.files && e.target.files[0]) {
            setMainImage(e.target.files[0]);
        }
    };

    const handleGalleryImages = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            if (selectedFiles.length > 5) {
                toast.error("Maximum 5 images allowed");
                e.target.value = "";
                setGalleryImages([]);
                return;
            }
            setGalleryImages(selectedFiles);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAttributeChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [key]: value }
        }));
    };

    // toggle status
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        const previousStatus = formData.status || product?.status || "Pending";

        setFormData(prev => ({
            ...prev,
            status: newStatus
        }));

        toggleStatus(
            { product_id: product._id, status: newStatus },
            {
                onSuccess: (res) => {
                    toast.success(res.message || "Status updated");
                },
                onError: (err) => {
                    toast.error(err.response?.data?.message || "Failed to update status");

                    setFormData(prev => ({
                        ...prev,
                        status: previousStatus
                    }));
                }
            }
        );
    };

    const handleSubmit = () => {

        if (Number(formData.price) > Number(formData.originalPrice)) {
            return toast.error("Sale price cannot be higher than MRP");
        }

        const hasVariants = hasColorVariant || hasSizeVariant;
        const variants = buildVariants();
        const totalStock = hasVariants
            ? getTotalStock()
            : Number(formData.stock || 0);

        const data = new FormData();
        data.append("prodName", formData.prodName);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("originalPrice", formData.originalPrice);
        data.append("stock", totalStock);
        data.append("status", formData.status);
        data.append("isActive", formData.isActive);
        data.append("variants", JSON.stringify(variants));
        data.append("attributes", JSON.stringify(formData.attributes));

        if (hasColorVariant) {
            data.append("colorAttrName", colorAttrName);
            data.append("colorValues", JSON.stringify(colors));
        }

        if (mainImage) data.append("prodImage", mainImage);
        if (galleryImages.length > 0) {
            galleryImages.forEach(file => data.append("prodImages", file));
        }

        updateProduct({ prod_id: product._id, formData: data }, {
            onSuccess: (res) => {
                toast.success(res.message || "Product Update Successfull");
                setMainImage(null);
                setGalleryImages([]);
                onClose();
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Failed to update");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 
                ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`fixed inset-y-0 right-0 z-70 w-full max-w-xl bg-white dark:bg-slate-950 shadow-2xl transform transition-transform duration-500 ease-in-out 
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                Edit Product <span className="text-pink-500 text-xs font-bold px-2 py-0.5 bg-pink-50 rounded-full uppercase">Admin Mode</span>
                            </h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                                ID: {product?._id}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full">
                            <HiOutlineX size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                        {/* Section 1: Media (Compact Grid) */}
                        <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Media Assets
                            </h4>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Main Image */}
                                <div className="flex items-center gap-3">
                                    <div className="relative w-16 h-16 shrink-0 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden bg-white">
                                        <img
                                            src={mainImage ? URL.createObjectURL(mainImage) : product?.prodImage}
                                            className={`w-full h-full object-cover ${!mainImage && 'opacity-50'}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Cover Image</label>
                                        <input type="file" onChange={handleMainImage} className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer" accept="image/*" />
                                    </div>
                                </div>

                                {/* Gallery Input */}
                                <div>
                                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Gallery (Multiple)</label>
                                    <input type="file" multiple onChange={handleGalleryImages} className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer" accept="image/*" />
                                    <div className="flex gap-1.5 mt-2 overflow-x-auto py-1">
                                        {(galleryImages.length > 0 ? galleryImages : product?.prodImages || []).map((img, i) => (
                                            <div key={i} className="w-8 h-8 rounded-lg border overflow-hidden shrink-0 shadow-sm">
                                                <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* if color img available */}
                                {hasColorVariant && (
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase block">
                                            Color Images
                                        </label>

                                        {colors.map((color) => {
                                            const images = formData.attributes?.[colorAttrName]?.images?.[color] || [];

                                            return (
                                                <div key={color} className="p-3 bg-white border border-slate-100 rounded-xl">
                                                    <p className="text-xs font-black text-pink-600 mb-2">
                                                        {color}
                                                    </p>

                                                    <div className="flex gap-2 overflow-x-auto">
                                                        {images.map((img, index) => (
                                                            <img
                                                                key={index}
                                                                src={img}
                                                                alt={`${color}-${index}`}
                                                                className="w-14 h-14 rounded-lg object-cover border border-pink-100"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Section 2: Basic Info (2-Column Grid) */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Primary Information
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Product Name</label>
                                    <input name="prodName" type="text" value={formData.prodName} onChange={handleInputChange} className="w-full mt-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all" />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                                    <textarea rows="2" name="description" value={formData.description} onChange={handleInputChange} className="w-full mt-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all resize-none" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                        <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="w-full mt-1 pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                                        Stock {(hasColorVariant || hasSizeVariant) && '(Auto)'}
                                    </label>
                                    <input
                                        name="stock"
                                        type="number"
                                        value={hasColorVariant || hasSizeVariant ? getTotalStock() : formData.stock}
                                        onChange={!hasColorVariant && !hasSizeVariant ? handleInputChange : undefined}
                                        readOnly={hasColorVariant || hasSizeVariant}
                                        className={`w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold
                                            ${hasColorVariant || hasSizeVariant
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-white dark:bg-slate-900'}`
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Attributes & Status (Mixed Grid) */}
                        <div className="grid grid-cols-2 gap-6">

                            {/* Dynamic Attributes */}
                            <div className="space-y-3 col-span-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attributes</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(formData.attributes).map(([key, value]) => {
                                        // skip color and size variant attributes
                                        if (typeof value === 'object' && value !== null) return null;
                                        return (
                                            <div key={key} className="flex flex-col">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase">{key}</label>
                                                <input
                                                    type="text"
                                                    value={value || ""}
                                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                                    className="w-full mt-0.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Variant Stock Matrix */}
                            {(hasColorVariant || hasSizeVariant) && (
                                <div className="col-span-2 space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Variant Stock
                                    </h4>

                                    {/* Color + Size matrix */}
                                    {hasColorVariant && hasSizeVariant && (
                                        <div className="overflow-x-auto border border-pink-100 rounded-xl">
                                            <table className="w-full text-xs">
                                                <thead className="bg-pink-50">
                                                    <tr>
                                                        <th className="text-left p-2 font-bold text-slate-600">Color / Size</th>
                                                        {sizes.map(size => (
                                                            <th key={size} className="p-2 font-bold text-slate-600 text-center">{size}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {colors.map(color => (
                                                        <tr key={color} className="border-t border-pink-50">
                                                            <td className="p-2 font-bold text-pink-600 text-xs">{color}</td>
                                                            {sizes.map(size => (
                                                                <td key={`${color}-${size}`} className="p-1">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={variantStock?.[color]?.[size] ?? ""}
                                                                        onChange={(e) => setVariantStock(prev => ({
                                                                            ...prev,
                                                                            [color]: { ...(prev[color] || {}), [size]: Number(e.target.value) || 0 }
                                                                        }))}
                                                                        className="w-16 mx-auto block px-2 py-1.5 bg-white rounded-lg border border-pink-100 text-xs font-bold text-center outline-none focus:border-pink-400"
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Color only */}
                                    {hasColorVariant && !hasSizeVariant && (
                                        <div className="space-y-2">
                                            {colors.map(color => (
                                                <div key={color} className="flex items-center gap-3 p-2.5 bg-pink-50 border border-pink-100 rounded-xl">
                                                    <span className="text-xs font-black text-pink-600 flex-1">{color}</span>
                                                    <label className="text-[11px] text-slate-400 font-medium">Stock:</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={variantStock?.[color]?.['__color__'] ?? ""}
                                                        onChange={(e) => setVariantStock(prev => ({
                                                            ...prev,
                                                            [color]: { ...(prev[color] || {}), '__color__': Number(e.target.value) || 0 }
                                                        }))}
                                                        className="w-20 px-3 py-1 bg-white rounded-lg border border-pink-100 text-xs font-bold outline-none focus:border-pink-400"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Size only */}
                                    {hasSizeVariant && !hasColorVariant && (
                                        <div className="space-y-2">
                                            {sizes.map(size => (
                                                <div key={size} className="flex items-center gap-3 p-2.5 bg-pink-50 border border-pink-100 rounded-xl">
                                                    <span className="text-xs font-black text-pink-600 w-10">{size}</span>
                                                    <label className="text-[11px] text-slate-400 font-medium">Stock:</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={variantStock?.[size]?.['__size__'] ?? ""}
                                                        onChange={(e) => setVariantStock(prev => ({
                                                            ...prev,
                                                            [size]: { ...(prev[size] || {}), '__size__': Number(e.target.value) || 0 }
                                                        }))}
                                                        className="w-20 px-3 py-1 bg-white rounded-lg border border-pink-100 text-xs font-bold outline-none focus:border-pink-400"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status Control */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Product Status
                                </h4>
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50">
                                    <select
                                        value={formData.status || "Pending"}
                                        disabled={isUpdating || isStatusUpdating}
                                        onChange={handleStatusChange}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-pointer outline-none transition-all
                                        ${statusStyles[formData.status] || statusStyles.Pending}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-pink-200 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-slate-100 rounded-2xl text-xs font-black">
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isUpdating}
                            className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2"
                        >
                            <HiOutlineSave size={18} /> {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditProductDrawer;