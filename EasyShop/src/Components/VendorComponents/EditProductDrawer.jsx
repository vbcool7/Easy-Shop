
import React, { useEffect, useState } from 'react';
import { HiOutlineX, HiOutlineSave, HiOutlineInformationCircle } from "react-icons/hi";
import { useUpdateProduct } from '../hooks/useProducts';
import toast from 'react-hot-toast';

const EditProductDrawer = ({ product, isOpen, onClose }) => {

    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

    const [mainImage, setMainImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);

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
                // Har product ke attributes alag hain, isliye direct copy karein
                attributes: product.attributes ? { ...product.attributes } : {}
            });

            setMainImage(null);
            setGalleryImages([]);
        }
    }, [product, isOpen]);

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

    const handleSubmit = () => {

        if (galleryImages.length > 5) {
            return toast.error("You can't upload more than 5 images");
        }

        if (Number(formData.price) > Number(formData.originalPrice)) {
            return toast.error("Sale price cannot be higher than MRP");
        }

        const data = new FormData();

        data.append("prodName", formData.prodName);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("originalPrice", formData.originalPrice);
        data.append("stock", formData.stock);
        data.append("status", formData.status);
        data.append("isActive", formData.isActive);

        data.append("attributes", JSON.stringify(formData.attributes));

        if (mainImage) {
            data.append("prodImage", mainImage);
        }

        if (galleryImages.length > 0) {
            galleryImages.forEach((file) => {
                data.append("prodImages", file);
            });
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
                                        className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                                        accept="image/*"
                                    />
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
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Stock</label>
                                    <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} className="w-full mt-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Attributes & Status (Mixed Grid) */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Dynamic Attributes */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attributes</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(formData.attributes).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase">{key.replace(/_/g, ' ')}</label>
                                            <input type="text" value={value} onChange={(e) => handleAttributeChange(key, e.target.value)} className="w-full mt-0.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg text-xs" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Control */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Status</h4>
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50">
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-transparent text-sm font-black text-emerald-700 dark:text-emerald-400 outline-none cursor-pointer">
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