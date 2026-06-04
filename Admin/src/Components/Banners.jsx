
import { useState } from 'react';
import { useGetBanners, useDeleteBanner, useUpdateBanner } from '../hooks/useBanner.js';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph, HiOutlineX, HiOutlineExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ZONES = [
    { value: 'home_hero',     label: 'Home Hero',      i18nKey: 'zoneHomeHero'     },
    { value: 'home_mid',      label: 'Home Mid',       i18nKey: 'zoneHomeMid'      },
    { value: 'category_top',  label: 'Category Top',   i18nKey: 'zoneCategoryTop'  },
    { value: 'vendor_top',    label: 'Vendor Top',     i18nKey: 'zoneVendorTop'    },
];

function Banners({ setCurrentPage }) {

    const { t } = useTranslation();
    const [selectedZone, setSelectedZone] = useState('home_hero');
    const [editingBanner, setEditingBanner] = useState(null);
    const [editImage, setEditImage] = useState(null);
    const [editPreview, setEditPreview] = useState('');
    const [bannerToDelete, setBannerToDelete] = useState(null);

    const { data: banners, isLoading } = useGetBanners(selectedZone);
    const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner();
    const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner();

    // delete
    const confirmDelete = () => {
        if (!bannerToDelete) return;

        deleteBanner(bannerToDelete, {
            onSuccess: () => {
                toast.success('Banner deleted');
                setBannerToDelete(null);
            },
            onError: () => {
                toast.error('Failed to delete banner');
                setBannerToDelete(null);
            },
        });
    };

    // edit
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditImage(file);
            setEditPreview(URL.createObjectURL(file));
        }
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('zone', editingBanner.zone);
        data.append('badge', editingBanner.badge || '');
        data.append('headingMain', editingBanner.headingMain || '');
        data.append('headingAccent', editingBanner.headingAccent || '');
        data.append('paragraph', editingBanner.paragraph || '');
        data.append('ctaText', editingBanner.ctaText || '');
        data.append('ctaLink', editingBanner.ctaLink || '');
        data.append('offerText', editingBanner.offerText || '');
        data.append('order', editingBanner.order);
        data.append('isActive', editingBanner.isActive);
        if (editImage) data.append('image', editImage);

        updateBanner({ id: editingBanner._id, formData: data }, {
            onSuccess: () => {
                toast.success('Banner updated');
                setEditingBanner(null);
                setEditImage(null);
                setEditPreview('');
            },
            onError: () => toast.error('Failed to update banner'),
        });
    };

    // toggle edit
    const handleToggleActive = (banner) => {
        const newActive = !banner.isActive;
        const data = new FormData();
        data.append('zone', banner.zone);
        data.append('isActive', String(newActive));
        updateBanner({ id: banner._id, formData: data }, {
            onSuccess: () => toast.success(newActive ? 'Banner activated' : 'Banner deactivated'),
            onError: () => toast.error('Failed to update banner'),
        });
    };

    const inputCls = 'w-full p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white placeholder:text-slate-400';

    return (
        <div className='bg-slate-50/50 p-4 md:p-8 min-h-screen text-left'>

            {/* header */}
            <div className='max-w-5xl mx-auto p-4 md:p-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-t-xl md:rounded-t-3xl relative overflow-hidden'>
                <div className='absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl'></div>
                <div className='absolute -bottom-10 -left-10 h-24 w-24 bg-white/10 rounded-full blur-xl'></div>
                <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div>
                        <h1 className='text-xl md:text-2xl font-bold text-white mb-1'>
                            {t('adminBanners.title')}
                        </h1>
                        <p className='text-pink-50 text-xs font-medium opacity-90'>
                            {t('adminBanners.subtitle')}
                        </p>
                    </div>
                    <button
                        onClick={() => setCurrentPage('add-banner')}
                        className='md:px-3 py-1.5 md:py-2.5 bg-white text-pink-500 rounded-xl text-[13px] md:text-sm font-bold hover:bg-pink-50 transition-all active:scale-95'
                    >
                        {t('adminBanners.addBanner')}
                    </button>
                </div>
            </div>

            {/* zone tabs + list */}
            <div className='max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-b-xl md:rounded-b-3xl shadow-sm border border-pink-50 dark:border-slate-800'>

                {/* zone tabs */}
                <div className='overflow-x-auto md:overflow-x-visible flex md:flex-wrap gap-2 p-4 border-b border-slate-100 dark:border-slate-800 no-scrollbar'>
                    {ZONES.map(z => (
                        <button
                            key={z.value}
                            onClick={() => setSelectedZone(z.value)}
                            className={`shrink-0 md:shrink flex-1 md:flex-none text-center px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[11px] md:text-sm font-bold transition-all whitespace-nowrap
                            ${selectedZone === z.value
                                    ? 'bg-pink-500 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-500'
                                }`}
                        >
                            {t(`adminBanners.${z.i18nKey}`)}
                        </button>
                    ))}
                </div>

                {/* banner list */}
                <div className='p-4 md:p-6 space-y-4'>
                    {isLoading && (
                        <p className='text-sm text-slate-400 text-center py-10'>{t('adminBanners.loading')}</p>
                    )}

                    {!isLoading && (!banners || banners.length === 0) && (
                        <div className='text-center py-16'>
                            <HiOutlinePhotograph className='text-5xl text-slate-200 mx-auto mb-3' />
                            <p className='text-sm text-slate-400 font-medium'>{t('adminBanners.emptyTitle')}</p>
                            <button
                                onClick={() => setCurrentPage('add-banner')}
                                className='mt-4 px-5 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition-all'
                            >
                                {t('adminBanners.addFirstBanner')}
                            </button>
                        </div>
                    )}

                    {banners?.map(banner => (
                        <div
                            key={banner._id}
                            className='flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                        >
                            <img
                                src={banner.image}
                                alt='banner'
                                className='w-full sm:w-48 h-28 object-cover rounded-xl border border-slate-100'
                            />

                            <div className='flex-1 flex flex-col justify-between'>
                                <div className='space-y-1'>

                                    {/* status + order */}
                                    <div className='flex items-center gap-2'>
                                        <button
                                            onClick={() => handleToggleActive(banner)}
                                            disabled={isUpdating}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50
                                        ${banner.isActive ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-600'}`}
                                            aria-label={banner.isActive ? t('adminBanners.ariaDeactivate') : t('adminBanners.ariaActivate')}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                                         ${banner.isActive ? 'translate-x-4' : 'translate-x-0'}`}
                                            />
                                        </button>
                                        <span className={`text-[10px] font-bold ${banner.isActive ? 'text-green-500' : 'text-slate-400'}`}>
                                            {banner.isActive ? t('adminBanners.statusActive') : t('adminBanners.statusInactive')}
                                        </span>
                                        <span className='text-[11px] text-slate-400'>{t('adminBanners.orderLabel')} {banner.order}</span>
                                    </div>

                                    {banner.badge &&
                                        <p className='text-[11px] text-pink-500 font-bold uppercase tracking-wider'>
                                            {banner.badge}
                                        </p>
                                    }

                                    {(banner.headingMain || banner.headingAccent) &&
                                        <p className='text-sm font-bold text-slate-700 dark:text-slate-200'>
                                            {banner.headingMain} <span className='text-pink-500'>{banner.headingAccent}</span>
                                        </p>
                                    }

                                    {banner.paragraph &&
                                        <p className='text-xs text-slate-400 line-clamp-2'>{banner.paragraph}</p>
                                    }

                                    {banner.offerText &&
                                        <p className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
                                            {t('adminBanners.offerLabel')} {banner.offerText}
                                        </p>
                                    }

                                    {banner.ctaText &&
                                        <p className='text-xs text-slate-400'>
                                            {t('adminBanners.btnLabel')} <span className='font-bold text-slate-600 dark:text-slate-200'>{banner.ctaText}</span>
                                            {banner.ctaLink && <span className='ml-1 text-slate-300'>→ {banner.ctaLink}</span>}
                                        </p>
                                    }
                                </div>

                                <div className='flex gap-2 mt-3'>
                                    <button
                                        onClick={() => { setEditingBanner(banner); setEditPreview(banner.image); }}
                                        className='px-3 py-1.5 text-xs font-bold text-pink-500 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all'
                                    >
                                        <HiOutlinePencil className='inline mr-1' />{t('adminBanners.editBtn')}
                                    </button>
                                    <button
                                        onClick={() => setBannerToDelete(banner._id)}
                                        disabled={isDeleting}
                                        className='px-3 py-1.5 text-xs font-bold text-red-400 bg-red-50 hover:bg-red-100 rounded-xl transition-all disabled:opacity-50'
                                    >
                                        <HiOutlineTrash className='inline mr-1' />{t('adminBanners.deleteBtn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* edit modal */}
            {editingBanner && (
                <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4'>
                    <div className='bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative'>
                        <button
                            onClick={() => { setEditingBanner(null); setEditImage(null); setEditPreview(''); }}
                            className='absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-all'
                        >
                            <HiOutlineX size={18} className='text-slate-500' />
                        </button>

                        <h2 className='text-lg font-bold text-slate-700 dark:text-slate-200 mb-5'>
                            {t('adminBanners.editModalTitle')}
                        </h2>

                        <form onSubmit={handleEditSubmit} className='space-y-3'>

                            {/* image */}
                            <div className='relative h-40 rounded-2xl overflow-hidden border border-slate-100'>
                                <img src={editPreview} alt='preview' className='w-full h-full object-cover' />
                                <label className='absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-all'>
                                    <input type='file' accept='image/*' onChange={handleEditImageChange} className='hidden' />
                                    <span className='text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-xl'>
                                        {t('adminBanners.changeImage')}
                                    </span>
                                </label>
                            </div>

                            <input
                                type='text'
                                value={editingBanner.badge || ''}
                                onChange={e => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                                placeholder={t('adminBanners.placeholderBadge')}
                                className={inputCls}
                            />

                            <div className='grid grid-cols-2 gap-3'>
                                <input
                                    type='text'
                                    value={editingBanner.headingMain || ''}
                                    onChange={e => setEditingBanner({ ...editingBanner, headingMain: e.target.value })}
                                    placeholder={t('adminBanners.placeholderHeadingMain')}
                                    className={inputCls}
                                />
                                <input
                                    type='text'
                                    value={editingBanner.headingAccent || ''}
                                    onChange={e => setEditingBanner({ ...editingBanner, headingAccent: e.target.value })}
                                    placeholder={t('adminBanners.placeholderHeadingAccent')}
                                    className={inputCls}
                                />
                            </div>

                            <textarea
                                value={editingBanner.paragraph || ''}
                                onChange={e => setEditingBanner({ ...editingBanner, paragraph: e.target.value })}
                                placeholder={t('adminBanners.placeholderParagraph')}
                                rows={2}
                                className={`${inputCls} resize-none`}
                            />

                            <input
                                type='text'
                                value={editingBanner.offerText || ''}
                                onChange={e => setEditingBanner({ ...editingBanner, offerText: e.target.value })}
                                placeholder={t('adminBanners.placeholderOfferText')}
                                className={inputCls}
                            />

                            <input
                                type='text'
                                value={editingBanner.ctaText || ''}
                                onChange={e => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                                placeholder={t('adminBanners.placeholderCtaText')}
                                className={inputCls}
                            />
                            <input
                                type='text'
                                value={editingBanner.ctaLink || ''}
                                onChange={e => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                                placeholder={t('adminBanners.placeholderCtaLink')}
                                className={inputCls}
                            />

                            <div className='flex items-center gap-3'>
                                <input
                                    type='number'
                                    value={editingBanner.order}
                                    onChange={e => setEditingBanner({ ...editingBanner, order: e.target.value })}
                                    min={0}
                                    className='w-24 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white'
                                />
                            </div>

                            <div className='flex gap-3 pt-2'>
                                <button
                                    type='button'
                                    onClick={() => { setEditingBanner(null); setEditImage(null); setEditPreview(''); }}
                                    className='flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all'
                                >
                                    {t('adminBanners.editCancel')}
                                </button>
                                <button
                                    type='submit'
                                    disabled={isUpdating}
                                    className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-br from-pink-500 to-pink-600 disabled:from-gray-300 disabled:to-gray-400 transition-all'
                                >
                                    {isUpdating ? t('adminBanners.editSaving') : t('adminBanners.editSave')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* delete modal */}
            {bannerToDelete && (
                <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in'>
                    <div className='bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-50 dark:border-slate-800'>

                        <div className='flex flex-col items-center text-center space-y-4'>
                            <div className='p-3 bg-red-50 dark:bg-red-950/50 rounded-2xl text-red-500'>
                                <HiOutlineExclamation size={32} />
                            </div>
                            <div className='space-y-1'>
                                <h3 className='text-lg font-bold text-slate-800 dark:text-slate-100'>
                                    {t('adminBanners.deleteTitle')}
                                </h3>
                                <p className='text-sm text-slate-400 dark:text-slate-400 px-2'>
                                    {t('adminBanners.deleteMessage')}
                                </p>
                            </div>
                        </div>

                        <div className='flex gap-3 mt-6'>
                            <button
                                type='button'
                                onClick={() => setBannerToDelete(null)}
                                className='flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800'
                            >
                                {t('adminBanners.deleteCancel')}
                            </button>
                            <button
                                type='button'
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-98 transition-all disabled:opacity-50 shadow-md shadow-red-100 dark:shadow-none'
                            >
                                {isDeleting ? t('adminBanners.deleteDeleting') : t('adminBanners.deleteConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Banners;