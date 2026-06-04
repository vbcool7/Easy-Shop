
import React, { useEffect, useState } from 'react'
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useNavigate, useParams } from 'react-router-dom';

import { useSubCatByCategory } from '../hook/useSubCategories';
import { useProductFilterOptions } from '../hook/uesProducts';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

function ProductsFilterPart({ activeCatId, catName, onFilterChange, defaultSubCat }) {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [selectedSubCat, setSelectedSubCat] = useState(defaultSubCat || null);
    const [selectedAttrs, setSelectedAttrs] = useState({});
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [sort, setSort] = useState('');
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [isSubCatOpen, setIsSubCatOpen] = useState(true);
    const [openAttrSections, setOpenAttrSections] = useState({});

    const { data: subCats, isLoading } = useSubCatByCategory(activeCatId);
    const { data: filterOptions } = useProductFilterOptions(activeCatId, selectedSubCat);

    // Only reset if activeCatId actually changed, not on first mount
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return; // skip reset on first mount
        }
        // reset only when category actually changes
        setSelectedSubCat(null);
        setSelectedAttrs({});
        setMinPrice(0);
        setMaxPrice(10000);
        setSort('');
    }, [activeCatId]);

    // wrap onFilterChange call
    const handleFilterChange = useCallback(() => {
        const timer = setTimeout(() => {
            onFilterChange({
                subCatId: selectedSubCat,
                minPrice: minPrice > 0 ? minPrice : undefined,
                maxPrice: maxPrice < 10000 ? maxPrice : undefined,
                sort,
                attributes: Object.fromEntries(
                    Object.entries(selectedAttrs).filter(([_, v]) => v !== undefined)
                )
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedSubCat, selectedAttrs, minPrice, maxPrice, sort]);

    useEffect(() => {
        return handleFilterChange();
    }, [handleFilterChange]);

    // clear attrs when subcat changes
    const handleSubCatChange = (subCatId) => {
        setSelectedSubCat(prev => prev === subCatId ? null : subCatId);
        setSelectedAttrs({});
        setOpenAttrSections({});
    };

    return (
        <section className="w-full px-4">

            {/* cat name on top */}
            <div className='text-pink-500 text-[18px] md:text-[25px] font-semibold'>
                {catName}
            </div>

            {/* Active filter chips + clear button*/}
            <div className='flex flex-wrap gap-2 mb-4'>
                {selectedSubCat && (
                    <span className='flex items-center gap-1 bg-pink-100 text-pink-500 text-xs font-bold px-3 py-1 rounded-full'>
                        {subCats?.find(s => s._id === selectedSubCat)?.subCatName}
                        <button onClick={() => setSelectedSubCat(null)}>×</button>
                    </span>
                )}

                {Object.entries(selectedAttrs).map(([key, val]) => (
                    <span key={key} className='flex items-center gap-1 bg-pink-100 text-pink-500 text-xs font-bold px-3 py-1 rounded-full'>
                        {key}: {val}
                        <button onClick={() => {
                            const updated = { ...selectedAttrs };
                            delete updated[key];
                            setSelectedAttrs(updated);
                        }}>×</button>
                    </span>
                ))}

                {(selectedSubCat || Object.keys(selectedAttrs).length > 0) && (
                    <button
                        onClick={() => { setSelectedSubCat(null); setSelectedAttrs({}); }}
                        className='text-xs text-pink-400 font-bold underline'>
                        {t('filters.clearAll')}
                    </button>
                )}
            </div>

            {/* Sort */}
            <div className='mb-4'>
                <label className='text-sm font-bold text-slate-600'>{t('filters.sortBy')}</label>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className='w-full mt-2 p-2 border border-slate-200 rounded-lg text-sm outline-none'>
                    <option value=''>{t('filters.default')}</option>
                    <option value='priceLow'>{t('filters.priceLow')}</option>
                    <option value='priceHigh'>{t('filters.priceHigh')}</option>
                </select>
            </div>

            {/* Subcategory filter */}
            <div className='mb-4'>
                <button
                    onClick={() => setIsSubCatOpen(!isSubCatOpen)}
                    className='w-full flex justify-between items-center text-sm font-bold text-slate-700 py-2'>
                    {t('filters.subcategory')}
                    <span>{isSubCatOpen ? '▲' : '▼'}</span>
                </button>
                {isSubCatOpen && (
                    <div className='mt-2 space-y-2'>
                        {subCats?.map((subCat) => (
                            <label key={subCat._id} className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='radio'
                                    name='subCat'
                                    checked={selectedSubCat === subCat._id}
                                    onChange={() => handleSubCatChange(subCat._id)}
                                    className='accent-pink-500'
                                />
                                <span className='text-sm text-slate-600'>
                                    {subCat.subCatName}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div className='mb-4 border-b border-slate-100 pb-4'>
                <button
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                    className='w-full flex justify-between items-center text-sm font-bold text-slate-700 py-2'>
                    {t('filters.price')}
                    <span>{isPriceOpen ? '▲' : '▼'}</span>
                </button>
                {isPriceOpen && (
                    <div className='mt-3 space-y-3'>
                        <div className='flex justify-between text-xs text-slate-500'>
                            <span>₹{minPrice}</span>
                            <span>₹{maxPrice}</span>
                        </div>

                        <input
                            type='range'
                            min={0}
                            max={10000}
                            step={100}
                            value={minPrice}
                            onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                            className='w-full accent-pink-500' />

                        <input
                            type='range'
                            min={0}
                            max={10000}
                            step={100}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                            className='w-full accent-pink-500' />
                    </div>
                )}
            </div>

            {/* --- DYNAMIC LOGIC --- */}
            {filterOptions && Object.entries(filterOptions).map(([attrName, values]) => {

                const safeValues = Array.isArray(values) ? values : [];

                if (safeValues.length === 0) return null;

                return (
                    <div key={attrName} className='mb-4 border-b border-slate-100 pb-4'>
                        <button
                            onClick={() => setOpenAttrSections(prev => ({
                                ...prev,
                                [attrName]: !prev[attrName]
                            }))}
                            className='w-full flex justify-between items-center text-sm font-bold text-slate-700 py-2'
                        >
                            {attrName}
                            <span>{openAttrSections[attrName] ? '▲' : '▼'}</span>
                        </button>

                        {openAttrSections[attrName] && (
                            <div className='mt-2 space-y-2'>
                                {safeValues.map((val) => (
                                    <label key={`${attrName}-${val}`} className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={selectedAttrs[attrName] === val}
                                            onChange={() => setSelectedAttrs(prev => ({
                                                ...prev,
                                                [attrName]: prev[attrName] === val ? undefined : val
                                            }))}
                                            className='accent-pink-500'
                                        />
                                        <span className='text-sm text-slate-600'>
                                            {String(val)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
            {/* --- DYNAMIC LOGIC END --- */}

        </section>
    )
}

export default ProductsFilterPart;