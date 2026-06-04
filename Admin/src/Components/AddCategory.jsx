
import React, { useState } from 'react';
import { HiOutlineX, HiOutlinePhotograph } from "react-icons/hi";
import toast from 'react-hot-toast';
import { useAddCategory } from '../hooks/useCategories';
import { useTranslation } from 'react-i18next';

function AddCategory({ setCurrentPage }) {

  const { t } = useTranslation();
  const { mutate: addCategory, isPending: isAdding } = useAddCategory();

  const [selectedCatImage, setSelectedCatImage] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState("");

  const [formData, setFormData] = useState({
    catName: "",
    department: "",
    description: "",
    requiresCertificate: false, // Default false
    certificateLabel: ""
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  }

  const handleAdd = () => {

    if (!formData.catName || !formData.department || !formData.description) {
      return toast.error("All fields are required");
    }

    // Validation: Agar certificate chahiye toh label zaroori hai
    if (formData.requiresCertificate && !formData.certificateLabel) {
      return toast.error("Please provide a Certificate Label (e.g. BIS License)");
    }

    const data = new FormData();
    data.append("catName", formData.catName);
    data.append("department", formData.department);
    data.append("description", formData.description);
    data.append("requiresCertificate", formData.requiresCertificate);
    data.append("certificateLabel", formData.certificateLabel);

    if (selectedCatImage) {
      data.append("catImage", selectedCatImage);
    }

    addCategory(data, {
      onSuccess: (res) => {
        toast.success(res.message || "Category added successfully");
        setFormData({
          catName: "",
          department: "",
          description: "",
          requiresCertificate: false,
          certificateLabel: ""
        });
        removeCatImage();
        setCurrentPage("categories");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to add Category")
      }
    });
  };

  // --- Main Image Handler ---
  const handleCatImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedCatImage(file);
      // Preview create karein
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Remove Images ---
  const removeCatImage = () => {
    setSelectedCatImage(null);
    setCatImagePreview("");
  };

  return (
    <div className='bg-slate-50/50 p-4 md:p-8'>

      {/* Header */}
      <div className='max-w-4xl mx-auto p-4 md:p-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-t-xl md:rounded-t-3xl relative overflow-hidden'>
        <div className='absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl'></div>
        <div className='absolute -bottom-10 -left-10 h-24 w-24 bg-white/10 rounded-full blur-xl'></div>

        <div className='relative z-10 text-center md:text-start'>
          <h1 className='text-xl md:text-2xl font-bold text-white mb-1'>
            {t('addCategory.title')}
          </h1>
          
          <p className='text-pink-50 text-xs font-medium opacity-90'>
            {t('addCategory.subtitle')}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className='max-w-4xl mx-auto bg-white dark:bg-slate-900 p-5 md:p-8 rounded-b-xl md:rounded-b-3xl shadow-sm border border-pink-50 dark:border-slate-800'>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 '>

          {/* Category Name */}
          <div className='flex flex-col gap-1.5 md:gap-2'>
            <label htmlFor='catName' className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
              {t('addCategory.labelName')}
            </label>
            <input
              type="text"
              name='catName'
              value={formData.catName}
              onChange={handleInputChange}
              placeholder={t('addCategory.placeholderName')}
              className="p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]"
            />
          </div>

          {/* Department */}
          <div className='flex flex-col gap-1.5 md:gap-2'>
            <label htmlFor='department' className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
              {t('addCategory.labelDept')}
            </label>
            <input
              type="text"
              name='department'
              value={formData.department}
              onChange={handleInputChange}
              placeholder={t('addCategory.placeholderDept')}
              className="p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]"
            />
          </div>

          {/* 3. NEW: Certificate Toggle Section */}
          <div className='col-span-full bg-pink-50/30 dark:bg-slate-800/50 p-4 rounded-2xl border border-pink-100/50 dark:border-slate-700 mt-2'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-slate-700 dark:text-slate-200'>{t('addCategory.labelLegal')}</h3>
                <p className='text-[11px] text-slate-500'>{t('addCategory.descLegal')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresCertificate"
                  checked={formData.requiresCertificate}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* 4. NEW: Certificate Label Input */}
            {formData.requiresCertificate && (
              <div className='mt-4 animate-in fade-in slide-in-from-top-2 duration-300'>
                <label className='text-[13px] font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                  {t('addCategory.labelCertName')}
                </label>
                <input
                  type="text"
                  name='certificateLabel'
                  value={formData.certificateLabel}
                  onChange={handleInputChange}
                  placeholder={t('addCategory.placeholderCertName')}
                  className="w-full mt-1.5 p-2.5 rounded-xl border border-pink-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all"
                />
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="flex flex-col gap-3 col-span-full mt-2">
            <label htmlFor='catImage' className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">
              {t('addCategory.labelImage')} <span className="text-pink-500">{t('addCategory.required')}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              <div className="relative h-35 md:h-44 border-2 border-dashed border-pink-100 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-pink-50/10 hover:bg-pink-50/30 transition-all cursor-pointer group">
                <input
                  type="file"
                  name='catImage'
                  accept="image/*"
                  onChange={handleCatImageChange}
                  className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                <HiOutlinePhotograph className="text-3xl text-pink-400 mb-2" />
                <p className="text-xs text-pink-500 font-bold">{t('addCategory.uploadText')}</p>
              </div>

              {catImagePreview && (
                <div className="relative h-35 md:h-44 rounded-2xl overflow-hidden border border-pink-100 shadow-sm animate-in zoom-in duration-300">
                  <img src={catImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={removeCatImage} className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-pink-500 shadow-md">
                    <HiOutlineX size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className='flex flex-col gap-1.5 md:gap-2 col-span-full mt-2'>
            <label htmlFor='description' className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
              {t('addCategory.labelDesc')}
            </label>
            <textarea
              rows="4"
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('addCategory.placeholderDesc')}
              className="p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all resize-none placeholder:text-[11px] md:placeholder:text-[14px]" />
          </div>

          {/* Action Buttons */}
          <div className='col-span-full flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 md:mt-6 pt-6 border-t border-slate-50 dark:border-slate-800'>
            <button
              type="button"
              onClick={() => setCurrentPage('categories')}
              className='w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-pink-500 hover:bg-pink-100 transition-all active:scale-95 cursor-pointer'
            >
              {t('addCategory.btnCancel')}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className='w-full sm:w-auto md:px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-100 hover:shadow-pink-200 transition-all active:scale-95 cursor-pointer'
            >
              {isAdding ? t('addCategory.btnAdding') : t('addCategory.btnAdd')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCategory;