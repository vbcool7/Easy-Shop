
import { useState } from 'react';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import { useAddBanner } from '../hooks/useBanner.js';
import toast from 'react-hot-toast';

const ZONES = [
    { value: 'home_hero', label: 'Home Hero' },
    { value: 'home_mid', label: 'Home Mid' },
    { value: 'category_top', label: 'Category Top' },
    { value: 'vendor_top', label: 'Vendor Top' },
];

function AddBanner({ setCurrentPage }) {
    const [formData, setFormData] = useState({
        zone: 'home_hero',
        badge: '',
        headingMain: '',
        headingAccent: '',
        paragraph: '',
        ctaText: '',
        ctaLink: '',
        offerText: '',
        order: 0,
        isActive: false,
    });
    const [bannerImage, setBannerImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const { mutate, isPending } = useAddBanner();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setBannerImage(null);
        setPreviewUrl('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!bannerImage) {
            toast.error('Please upload a banner image!');
            return;
        }

        const data = new FormData();
        data.append('image', bannerImage);
        data.append('zone', formData.zone);
        data.append('badge', formData.badge);
        data.append('headingMain', formData.headingMain);
        data.append('headingAccent', formData.headingAccent);
        data.append('paragraph', formData.paragraph);
        data.append('ctaText', formData.ctaText);
        data.append('ctaLink', formData.ctaLink);
        data.append('offerText', formData.offerText);
        data.append('order', formData.order);
        data.append('isActive', formData.isActive);

        mutate(data, {
            onSuccess: (response) => {
                if (response?.success) {
                    toast.success('Banner added successfully!');
                    setFormData({
                        zone: 'home_hero',
                        badge: '',
                        headingMain: '',
                        headingAccent: '',
                        paragraph: '',
                        ctaText: '',
                        ctaLink: '',
                        offerText: '',
                        order: 0,
                        isActive: false,
                    });
                    setBannerImage(null);
                    setPreviewUrl('');
                    setCurrentPage('banners');
                }
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to add banner. Try again!');
            }
        });
    };

    return (
        <div className='bg-slate-50/50 p-4 md:p-8 min-h-screen text-left'>

            {/* header */}
            <div className='max-w-4xl mx-auto p-4 md:p-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-t-xl md:rounded-t-3xl relative overflow-hidden'>
                <div className='absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl'></div>
                <div className='absolute -bottom-10 -left-10 h-24 w-24 bg-white/10 rounded-full blur-xl'></div>
                <div className='relative z-10 text-center md:text-start'>
                    <h1 className='text-xl md:text-2xl font-bold text-white mb-1'>
                        Add New Banner
                    </h1>
                    <p className='text-pink-50 text-xs font-medium opacity-90'>
                        Upload and configure a new banner for your storefront.
                    </p>
                </div>
            </div>

            {/* form */}
            <div className='max-w-4xl mx-auto bg-white dark:bg-slate-900 p-5 md:p-8 rounded-b-xl md:rounded-b-3xl shadow-sm border border-pink-50 dark:border-slate-800'>
                <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>

                    {/* zone */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Banner Zone
                        </label>
                        <select
                            name='zone'
                            value={formData.zone}
                            onChange={handleInputChange}
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all'
                        >
                            {ZONES.map(z => (
                                <option key={z.value} value={z.value}>{z.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* order */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Display Order
                        </label>
                        <input
                            type='number'
                            name='order'
                            value={formData.order}
                            onChange={handleInputChange}
                            min={0}
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all'
                        />
                    </div>

                    {/* badge */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Badge Text <span className='text-slate-400 font-normal'>(optional)</span>
                        </label>
                        <input
                            type='text'
                            name='badge'
                            value={formData.badge}
                            onChange={handleInputChange}
                            placeholder='e.g. Limited Offer'
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]'
                        />
                    </div>

                    {/* offer text */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Offer Text <span className='text-slate-400 font-normal'>(optional)</span>
                        </label>
                        <input
                            type='text'
                            name='offerText'
                            value={formData.offerText}
                            onChange={handleInputChange}
                            placeholder='e.g. From $199 or Up to 40% off'
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]'
                        />
                    </div>

                    {/* heading main */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Heading (Main) <span className='text-slate-400 font-normal'>(optional)</span>
                        </label>
                        <input
                            type='text'
                            name='headingMain'
                            value={formData.headingMain}
                            onChange={handleInputChange}
                            placeholder='e.g. New or FRESH'
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]'
                        />
                    </div>

                    {/* heading accent */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Heading (Accent/Pink) <span className='text-slate-400 font-normal'>(optional)</span>
                        </label>
                        <input
                            type='text'
                            name='headingAccent'
                            value={formData.headingAccent}
                            onChange={handleInputChange}
                            placeholder='e.g. Products or DROPS!'
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]'
                        />
                    </div>

                    {/* paragraph */}
                    <div className='flex flex-col gap-1.5 md:gap-2 col-span-full'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Short Description <span className='text-slate-400 font-normal'>(optional)</span>
                        </label>
                        <textarea
                            name='paragraph'
                            value={formData.paragraph}
                            onChange={handleInputChange}
                            rows={2}
                            placeholder='e.g. Style that speaks for you. Explore the latest trends.'
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px] resize-none'
                        />
                    </div>

                    {/* cta text */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            CTA Button Text <span className='text-slate-400 font-normal'>(optional)</span>
                        </label>
                        <input
                            type='text'
                            name='ctaText'
                            value={formData.ctaText}
                            onChange={handleInputChange}
                            placeholder='e.g. Shop Now'
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]'
                        />
                    </div>

                    {/* cta link */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            CTA Link <span className='text-slate-400 font-normal'>(optional)</span>
                        </label>
                        <input
                            type='text'
                            name='ctaLink'
                            value={formData.ctaLink}
                            onChange={handleInputChange}
                            placeholder='e.g. /products or https://...'
                            className='p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]'
                        />
                    </div>

                    {/* image upload */}
                    <div className='flex flex-col gap-3 col-span-full mt-1'>
                        <label className='text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            Banner Image <span className='text-pink-500'>(Required — 1920x600 recommended)</span>
                        </label>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start'>
                            <div className='relative h-35 md:h-44 border-2 border-dashed border-pink-100 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-pink-50/10 hover:bg-pink-50/30 transition-all cursor-pointer'>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleImageChange}
                                    className='absolute inset-0 opacity-0 z-10 cursor-pointer'
                                />
                                <HiOutlinePhotograph className='text-3xl text-pink-400 mb-2' />
                                <p className='text-xs text-pink-500 font-bold'>Upload Banner Image</p>
                            </div>

                            {previewUrl && (
                                <div className='relative h-35 md:h-44 rounded-2xl overflow-hidden border border-pink-100 shadow-sm col-span-2'>
                                    <img src={previewUrl} alt='Preview' className='w-full h-full object-cover' />
                                    <button
                                        type='button'
                                        onClick={removeImage}
                                        className='absolute top-2 right-2 bg-white p-1.5 rounded-full text-pink-500 shadow-md hover:bg-pink-50 transition-colors'
                                    >
                                        <HiOutlineX size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* is active */}
                    <div className='col-span-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700'>
                        <input
                            type='checkbox'
                            id='isActive'
                            name='isActive'
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className='w-4 h-4 accent-pink-500'
                        />
                        <label htmlFor='isActive' className='text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer'>
                            Set as Active (visible on storefront immediately)
                        </label>
                    </div>

                    {/* actions */}
                    <div className='col-span-full flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 md:mt-6 pt-6 border-t border-slate-50 dark:border-slate-800'>
                        <button
                            type='button'
                            disabled={isPending}
                            onClick={() => setCurrentPage('banners')}
                            className='w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-pink-500 hover:bg-pink-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-transparent disabled:hover:text-slate-500'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={isPending}
                            className='w-full sm:w-auto md:px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-100 dark:shadow-none hover:shadow-pink-200 transition-all cursor-pointer active:scale-95 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none'
                        >
                            {isPending ? 'Uploading...' : 'Add Banner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBanner;