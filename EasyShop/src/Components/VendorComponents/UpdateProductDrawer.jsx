
import React, { useEffect, useState } from 'react';
import { HiOutlineX, HiOutlineSave, HiOutlineInformationCircle } from "react-icons/hi";
import toast from 'react-hot-toast';
import { useUpdateProduct } from '../../hook/uesProducts';

const UpdateProductDrawer = ({ product, isOpen, onClose }) => {

    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

    const [mainImage, setMainImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [variantStock, setVariantStock] = useState({});
    const [colorImageFiles, setColorImageFiles] = useState({});

    const [formData, setFormData] = useState({
        prodName: "",
        description: "",
        price: "",
        originalPrice: "",
        stock: "",
        status: "",
        isActive: true,
        attributes: {}
    });

    // derived variant info from formData
    const colorAttrName = formData.attributes
        ? Object.keys(formData.attributes).find(key =>
            formData.attributes[key]?.values && formData.attributes[key]?.images
        )
        : null;

    const sizeAttrName = formData.attributes
        ? Object.keys(formData.attributes).find(key =>
            formData.attributes[key]?.values && !formData.attributes[key]?.images
        )
        : null;

    const colors = formData.attributes?.[colorAttrName]?.values || [];
    const sizes = formData.attributes?.[sizeAttrName]?.values || [];

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
                status: product.status || "",
                isActive: product.isActive ?? true,
                attributes: product.attributes ? { ...product.attributes } : {}
            });

            // pre-fill variant stock
            const existingStock = {};

            if (product.variants?.length > 0) {
                product.variants.forEach(v => {
                    if (v.color && v.size) {
                        if (!existingStock[v.color]) existingStock[v.color] = {};
                        existingStock[v.color][v.size] = v.stock;
                    } else if (v.color) {
                        if (!existingStock[v.color]) existingStock[v.color] = {};
                        existingStock[v.color]["__color__"] = v.stock;
                    } else if (v.size) {
                        if (!existingStock[v.size]) existingStock[v.size] = {};
                        existingStock[v.size]["__size__"] = v.stock;
                    }
                });
            }
            setVariantStock(existingStock);
            setColorImageFiles({});
            setMainImage(null);
            setGalleryImages([]);
        }
    }, [product, isOpen]);

    // ---- Color handlers ----
    const handleAddColor = (colorName) => {
        if (!colorName.trim()) return;
        const current = formData.attributes[colorAttrName] || { values: [], images: {}, stock: {} };
        if (current.values.includes(colorName.trim())) return;
        handleAttributeChange(colorAttrName, {
            ...current,
            values: [...current.values, colorName.trim()],
            images: { ...current.images }
        });
    };

    const handleRemoveColor = (color) => {
        const current = formData.attributes[colorAttrName];
        const updatedValues = current.values.filter(c => c !== color);
        const updatedImages = { ...current.images };
        delete updatedImages[color];

        handleAttributeChange(colorAttrName, {
            ...current,
            values: updatedValues,
            images: updatedImages
        });

        // remove from variantStock
        setVariantStock(prev => {
            const updated = { ...prev };
            delete updated[color];
            return updated;
        });

        // remove from colorImageFiles
        setColorImageFiles(prev => {
            const updated = { ...prev };
            delete updated[color];
            return updated;
        });
    };

    // ---- Size handlers ----
    const handleAddSize = (sizeName) => {
        if (!sizeName.trim()) return;
        const current = formData.attributes[sizeAttrName] || { values: [], stock: {} };
        if (current.values.includes(sizeName.trim())) return;
        handleAttributeChange(sizeAttrName, {
            ...current,
            values: [...current.values, sizeName.trim()],
            stock: { ...current.stock, [sizeName.trim()]: 0 }
        });
    };

    const handleRemoveSize = (size) => {
        const current = formData.attributes[sizeAttrName];
        const updatedValues = current.values.filter(s => s !== size);
        const updatedStock = { ...current.stock };
        delete updatedStock[size];

        handleAttributeChange(sizeAttrName, {
            ...current,
            values: updatedValues,
            stock: updatedStock
        });

        // remove from variantStock
        setVariantStock(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                if (updated[key]?.[size] !== undefined) {
                    const colorUpdated = { ...updated[key] };
                    delete colorUpdated[size];
                    updated[key] = colorUpdated;
                }
            });
            delete updated[size];
            return updated;
        });
    };

    // ---- Build variants ----
    const buildVariants = () => {
        
        if (colors.length && sizes.length) {
            return colors.flatMap(color =>
                sizes.map(size => {
                    // Yahan logic check karein
                    const rawStock = variantStock?.[color]?.[size];
                    return {
                        color,
                        size,
                        // Agar rawStock empty string hai ya undefined, toh 0 set karein
                        stock: (rawStock === "" || rawStock === undefined) ? 0 : Number(rawStock)
                    };
                })
            );
        }

        if (colors.length) {
            return colors.map(color => {
                const rawStock = variantStock?.[color]?.["__color__"];
                return {
                    color,
                    size: null,
                    stock: (rawStock === "" || rawStock === undefined) ? 0 : Number(rawStock)
                };
            });
        }

        if (sizes.length) {
            return sizes.map(size => {
                const rawStock = variantStock?.[size]?.["__size__"];
                return {
                    color: null,
                    size,
                    stock: (rawStock === "" || rawStock === undefined) ? 0 : Number(rawStock)
                };
            });
        }
        // for Simple product
        return [{
            color: null,
            size: null,
            stock: (formData.stock === "" || formData.stock === undefined) ? 0 : Number(formData.stock)
        }];
    };

    const getTotalStock = () =>
        buildVariants().reduce((sum, v) => sum + Number(v.stock || 0), 0);


    const handleMainImage = (e) => {
        if (e.target.files?.[0])
            setMainImage(e.target.files[0]);
    };

    const handleGalleryImages = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }
        setGalleryImages(files);
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

    const handleSubmit = () => {

        if (Number(formData.price) > Number(formData.originalPrice)) {
            return toast.error("Sale price cannot be higher than MRP");
        }

        const variants = buildVariants();
        const totalStock = hasColorVariant || hasSizeVariant
            ? getTotalStock()
            : Number(formData.stock || 0);

        const data = new FormData();

        data.append("prodName", formData.prodName);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("originalPrice", formData.originalPrice);
        data.append("status", formData.status);
        data.append("isActive", formData.isActive);
        data.append("stock", totalStock);
        data.append("variants", JSON.stringify(variants));
        data.append("attributes", JSON.stringify(formData.attributes));

        if (hasColorVariant) {
            data.append("colorAttrName", colorAttrName);
            data.append("colorValues", JSON.stringify(colors));
            Object.entries(colorImageFiles).forEach(([color, files]) => {
                files.forEach((file, idx) => {
                    data.append(`colorImg_${color}_${idx}`, file);
                });
            });
        }

        if (!hasColorVariant) {
            if (mainImage) data.append("prodImage", mainImage);
            if (galleryImages.length > 0) {
                galleryImages.forEach(file => data.append("prodImages", file));
            }
        }

        updateProduct({ prod_id: product._id, formData: data }, {
            onSuccess: (res) => {
                toast.success(res.message || "Product Updated Successfully");
                setMainImage(null);
                setGalleryImages([]);
                setColorImageFiles({});
                setVariantStock({});
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
                                Edit Product <span className="text-pink-500 text-xs font-bold px-2 py-0.5 bg-pink-50 rounded-full uppercase">Vendor Mode</span>
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

                        {/* Section 1: Media */}
                        {!hasColorVariant && (
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
                                                className={`w-full h-full object-cover`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                                                Cover Image
                                            </label>

                                            <input
                                                type="file"
                                                onChange={handleMainImage}
                                                className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer" accept="image/*" />
                                        </div>
                                    </div>

                                    {/* Gallery Input */}
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                                            Gallery (Multiple)
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleGalleryImages}
                                            className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer" accept="image/*" />
                                        <div className="flex gap-1.5 mt-2 overflow-x-auto py-1">
                                            {(galleryImages.length > 0 ? galleryImages : product?.prodImages || []).map((img, i) => (
                                                <div
                                                    key={i}
                                                    className="w-8 h-8 rounded-lg border overflow-hidden shrink-0 shadow-sm">
                                                    <img
                                                        src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                                                        className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* color images */}
                        {/* {hasColorVariant && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Color Images
                                </h4>

                                {colors.map(color => {
                                    const oldImages = formData.attributes?.[colorAttrName]?.images?.[color] || [];
                                    const newImages = colorImageFiles[color] || [];

                                    return (
                                        <div
                                            key={color}
                                            className="p-3 bg-slate-50 border border-pink-100 rounded-xl">
                                            <p className="text-xs font-black text-pink-600 mb-2">{color}</p>

                                            <div className="flex gap-2 flex-wrap mb-2">
                                                {oldImages.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        className="w-14 h-14 rounded-lg object-cover border" />
                                                ))}

                                                {newImages.map((file, i) => (
                                                    <img
                                                        key={`new-${i}`}
                                                        src={URL.createObjectURL(file)}
                                                        className="w-14 h-14 rounded-lg object-cover border border-pink-300" />
                                                ))}
                                            </div>

                                            <p className="text-[10px] text-slate-500 mb-2">
                                                Choose new images to replace current {color} images.
                                            </p>

                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    setColorImageFiles(prev => ({
                                                        ...prev,
                                                        [color]: files
                                                    }));
                                                }}
                                                className="text-[10px]"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )} */}

                        {/* Section 2: prod info  */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Primary Information
                            </h4>

                            {/* product name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                                        Product Name
                                    </label>
                                    <input
                                        name="prodName"
                                        type="text"
                                        value={formData.prodName}
                                        onChange={handleInputChange}
                                        className="w-full mt-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all" />
                                </div>

                                {/* Description */}
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows="4"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full mt-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all resize-none" />
                                </div>

                                {/*price */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                                        Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                            ₹
                                        </span>
                                        <input
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full mt-1 pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold" />
                                    </div>
                                </div>

                                {/* stock */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                                        Stock {(hasColorVariant || hasSizeVariant) && "(Auto)"}
                                    </label>

                                    <input
                                        name="stock"
                                        type="number"
                                        value={hasColorVariant || hasSizeVariant ? getTotalStock() : formData.stock}
                                        onChange={!hasColorVariant && !hasSizeVariant ? handleInputChange : undefined}
                                        readOnly={hasColorVariant || hasSizeVariant}
                                        className={`w-full mt-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none transition-all
                                             ${hasColorVariant || hasSizeVariant
                                                ? "bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-not-allowed"
                                                : "bg-white dark:bg-slate-900 focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500"
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Attributes & Status */}
                        <div className="">

                            {/* Dynamic Attributes */}
                            <div className="space-y-3 col-span-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Attributes
                                </h4>

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

                            {/* Color section */}
                            {colorAttrName && (
                                <div className="space-y-3 mt-5">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Color <span className="text-pink-400 normal-case font-medium">(add color + images)</span>
                                    </h4>

                                    {/* Existing colors */}
                                    {colors.map(color => {
                                        const oldImages = formData.attributes?.[colorAttrName]?.images?.[color] || [];
                                        const newFiles = colorImageFiles[color] || [];
                                        return (
                                            <div key={color} className="p-3 bg-slate-50 border border-pink-100 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black text-pink-600">{color}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveColor(color)}
                                                        className="text-red-400 text-xs font-bold hover:text-red-600"
                                                    >Remove</button>
                                                </div>

                                                {/* existing images */}
                                                <div className="flex gap-2 flex-wrap mb-2">
                                                    {oldImages.map((img, i) => (
                                                        <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover border" />
                                                    ))}
                                                    {newFiles.map((file, i) => (
                                                        <img key={`new-${i}`} src={URL.createObjectURL(file)} className="w-12 h-12 rounded-lg object-cover border border-pink-300" />
                                                    ))}
                                                </div>

                                                <p className="text-[10px] text-slate-400 mb-1">
                                                    Upload new images to replace {color} images
                                                </p>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        setColorImageFiles(prev => ({ ...prev, [color]: files }));
                                                    }}
                                                    className="text-[10px]"
                                                />

                                                {/* color stock — only if no size */}
                                                {!hasSizeVariant && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <label className="text-[11px] text-slate-400">Stock:</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={variantStock?.[color]?.["__color__"] ?? ""}
                                                            onChange={(e) => setVariantStock(prev => ({
                                                                ...prev,
                                                                [color]: { ...(prev[color] || {}), "__color__": Number(e.target.value) || 0 }
                                                            }))}
                                                            className="w-20 px-3 py-1 bg-white rounded-lg border border-pink-100 text-xs font-bold outline-none focus:border-pink-400"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Add new color */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. Red, Pink, Yellow"
                                            className="flex-1 px-3 py-2 mb-4 bg-slate-50 rounded-lg border border-slate-200 text-xs outline-none focus:border-pink-400"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                    e.preventDefault();
                                                    handleAddColor(e.target.value.trim());
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                const input = e.target.previousSibling;
                                                if (input.value.trim()) {
                                                    handleAddColor(input.value.trim());
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-3 py-2 mb-4 bg-pink-500 text-white text-xs font-bold rounded-lg hover:bg-pink-600"
                                        >Add</button>
                                    </div>
                                </div>
                            )}

                            {/* Size section */}
                            {sizeAttrName && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Size <span className="text-pink-400 normal-case font-medium">(press Enter to add)</span>
                                    </h4>

                                    {sizes.map((size, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2.5 bg-pink-50 border border-pink-100 rounded-xl">
                                            <span className="text-xs font-black text-pink-600 w-10 shrink-0">{size}</span>

                                            {/* size stock — only if no color */}
                                            {!hasColorVariant && (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <label className="text-[11px] text-slate-400 shrink-0">Stock:</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={variantStock?.[size]?.["__size__"] ?? ""}
                                                        onChange={(e) => setVariantStock(prev => ({
                                                            ...prev,
                                                            [size]: { ...(prev[size] || {}), "__size__": Number(e.target.value) || 0 }
                                                        }))}
                                                        className="w-20 px-3 py-1 bg-white rounded-lg border border-pink-100 text-xs font-bold outline-none focus:border-pink-400"
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSize(size)}
                                                className="text-red-400 hover:text-red-600 text-xs font-bold ml-auto"
                                            >✕</button>
                                        </div>
                                    ))}

                                    <input
                                        type="text"
                                        placeholder="Size — press Enter"
                                        className="w-full px-3 py-2 mb-5 bg-slate-50 rounded-lg border border-slate-200 text-xs outline-none focus:border-pink-400"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                e.preventDefault();
                                                handleAddSize(e.target.value.trim());
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {/* Color + Size matrix */}
                            {hasColorVariant && hasSizeVariant && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Variant Stock Matrix
                                    </h4>
                                    <div className="overflow-x-auto border border-pink-100 rounded-xl">
                                        <table className="w-full text-xs">
                                            <thead className="bg-pink-50">
                                                <tr>
                                                    <th className="text-left p-2 font-bold text-slate-600">
                                                        Color / Size
                                                    </th>
                                                    {sizes.map(size => (
                                                        <th
                                                            key={size}
                                                            className="p-2 font-bold text-slate-600 text-center">
                                                            {size}
                                                        </th>
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
                                                                    value={variantStock?.[color]?.[size] === "" ? "" : (variantStock?.[color]?.[size] ?? 0)}
                                                                    onChange={(e) => setVariantStock(prev => ({
                                                                        ...prev,
                                                                        [color]: {
                                                                            ...(prev[color] || {}),
                                                                            [size]: e.target.value === "" ? "" : Number(e.target.value)
                                                                        }
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
                                </div>
                            )}

                            {/* Status Control */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Product Status
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium
                                         ${formData.status === 'Approved'
                                        ? " text-green-700 "
                                        : formData.status === 'Pending'
                                            ? " text-amber-700 "
                                            : " text-red-700 "
                                    }`}>

                                    {formData.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* buttons */}
                    <div className="p-6 border-t border-pink-200 flex gap-4">

                        <button
                            onClick={onClose}
                            disabled={isUpdating}
                            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black
                        ${isUpdating ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-100 text-slate-900 cursor-pointer"}`}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isUpdating}
                            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2
                            ${isUpdating ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 text-white cursor-pointer"}`}
                        >
                            <HiOutlineSave size={18} /> {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
};

export default UpdateProductDrawer;