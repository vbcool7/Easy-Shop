
import React from 'react'
import Logo from '../assets/Images/Logo.png';
import { HiOutlineRefresh } from "react-icons/hi";
import { PiCurrencyDollarBold } from "react-icons/pi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { GoVerified } from "react-icons/go";
import MasterCardiconImg from '../assets/Images/MasterCardiconImg.png';
import RupayiconImg from '../assets/Images/RupayiconImg.png';
import UPIiconImg from '../assets/Images/UPIiconImg.png';
import VISAiconImg from '../assets/Images/VISAiconImg.png';
import { IoLogoInstagram } from "react-icons/io";
import { CiFacebook } from "react-icons/ci";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaWhatsapp } from "react-icons/fa6";
import { CiLinkedin } from "react-icons/ci";
import { NavLink, useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

function Footer() {

    const { t } = useTranslation();

    return (
  <section className="w-full bg-[#18181B] px-4 sm:px-5 lg:px-6">
    <div className="mx-auto max-w-6xl">
      {/* 1st section */}
      <div className="grid grid-cols-1 gap-6 border-b border-gray-700/50 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* Feature 1 */}
        <div className="flex min-w-0 flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
          <HiOutlineRefresh className="shrink-0 text-4xl text-pink-500" />
          <div className="min-w-0">
            <p className="wrap-break-words text-sm font-bold uppercase leading-tight tracking-tight text-gray-200">
              {t('footer.easyReturns')}
            </p>
            <p className="mt-1 wrap-break-words text-xs leading-snug text-gray-300">
              {t('footer.easyReturnsDesc')}
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex min-w-0 flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
          <PiCurrencyDollarBold className="shrink-0 text-4xl text-pink-500" />
          <div className="min-w-0">
            <p className="wrap-break-words text-sm font-bold uppercase leading-tight tracking-tight text-gray-200">
              {t('footer.securePayment')}
            </p>
            <p className="mt-1 wrap-break-words text-xs leading-snug text-gray-300">
              {t('footer.securePaymentDesc')}
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex min-w-0 flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
          <HiOutlineLocationMarker className="shrink-0 text-4xl text-pink-500" />
          <div className="min-w-0">
            <p className="wrap-break-words text-sm font-bold uppercase leading-tight tracking-tight text-gray-200">
              {t('footer.expressPickup')}
            </p>
            <p className="mt-1 wrap-break-words text-xs leading-snug text-gray-300">
              {t('footer.expressPickupDesc')}
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="flex min-w-0 flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
          <GoVerified className="shrink-0 text-4xl text-pink-500" />
          <div className="min-w-0">
            <p className="wrap-break-words text-sm font-bold uppercase leading-tight tracking-tight text-gray-200">
              {t('footer.authenticProducts')}
            </p>
            <p className="mt-1 wrap-break-words text-xs leading-snug text-gray-300">
              {t('footer.authenticProductsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* 2nd section */}
      <div className="my-5 grid grid-cols-1 gap-10 border-b border-gray-700/50 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* logo */}
        <div className="min-w-0 space-y-4">
          <img src={Logo} alt="Logo" className="h-12 w-auto object-contain" />

          <p className="max-w-xs wrap-break-words text-sm leading-relaxed text-gray-300">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Quick Links */}
        <div className="min-w-0 space-y-4">
          <h1 className="wrap-break-words text-xl font-bold leading-tight text-gray-200">
            {t('footer.quickLinks')}
          </h1>

          <div className="flex min-w-0 flex-col gap-2 text-gray-300">
            <NavLink to="/" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.home')}
            </NavLink>
            <NavLink to="/about_us" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.aboutUs')}
            </NavLink>
            <NavLink to="/blog" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.blog')}
            </NavLink>
            <NavLink to="/contact_us" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.contact')}
            </NavLink>
          </div>
        </div>

        {/* Policies */}
        <div className="min-w-0 space-y-4">
          <h1 className="wrap-break-words text-xl font-bold leading-tight text-gray-200">
            {t('footer.policies')}
          </h1>

          <div className="flex min-w-0 flex-col gap-2 text-gray-300">
            <NavLink to="/faqs" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.faqs')}
            </NavLink>
            <NavLink to="/terms_policy" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.termsOfUse')}
            </NavLink>
            <NavLink to="/privacy_policy" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.privacyPolicy')}
            </NavLink>
            <NavLink to="/delivery_policy" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.deliveryPolicy')}
            </NavLink>
            <NavLink to="/exchange_policy" className={({ isActive }) => `wrap-break-words transition-all duration-300 ${isActive ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              {t('footer.exchangeReturn')}
            </NavLink>
          </div>
        </div>

        {/* Customer / Contact */}
        <div className="min-w-0 space-y-4">
          <h1 className="wrap-break-words text-xl font-bold leading-tight text-gray-200">
            {t('footer.contactUs')}
          </h1>

          <div className="flex min-w-0 flex-col gap-2 text-gray-300">
            <p className="wrap-break-words text-[14px] leading-relaxed">
              {t('footer.contactDesc')}
            </p>
            <p className="wrap-break-words transition-all duration-300 hover:text-pink-500">
              easyshop@shop.com
            </p>
            <p className="wrap-break-words transition-all duration-300 hover:text-pink-500">
              +11 222 333 444
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-2 pt-3 text-gray-300">
            <p className="wrap-break-words text-[14px] leading-relaxed">
              {t('footer.address')}
            </p>
            <p className="wrap-break-words transition-all duration-300 hover:text-pink-500">
              123, Address.
            </p>
          </div>
        </div>
      </div>

      {/* 3rd section */}
      <div className="flex flex-col items-start gap-8 pb-10 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        {/* newsletter */}
        <div className="order-1 flex w-full min-w-0 flex-col lg:order-3 lg:max-w-sm">
          <h1 className="mb-3 wrap-break-words text-sm font-bold uppercase leading-tight tracking-tight text-gray-200">
            {t('footer.newsletter')}
          </h1>

          <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-md sm:flex-row">
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder')}
              className="min-h-10 min-w-0 border border-gray-400 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-gray-400 sm:border-r-0"
            />

            <button className="min-h-10 shrink-0 bg-pink-500 px-4 py-2 text-xs font-bold uppercase leading-tight tracking-widest text-white transition-colors hover:bg-pink-600">
              {t('footer.subscribe')}
            </button>
          </div>
        </div>

        {/* payment section */}
        <div className="order-2 min-w-0 lg:order-1">
          <h1 className="mb-2 wrap-break-words text-sm font-bold uppercase leading-tight tracking-tight text-gray-200">
            {t('footer.payment')}
          </h1>

          <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 px-2 py-1">
            <img src={MasterCardiconImg} alt="MasterCard" className="h-10 w-10 object-contain" />
            <img src={RupayiconImg} alt="Rupay" className="h-10 w-10 object-contain" />
            <img src={VISAiconImg} alt="VISA" className="h-10 w-10 object-contain" />
            <img src={UPIiconImg} alt="UPI" className="h-10 w-10 object-contain" />
          </div>
        </div>

        {/* social icons */}
        <div className="order-3 min-w-0 lg:order-2">
          <h1 className="mb-2 wrap-break-words text-sm font-bold uppercase leading-tight tracking-tight text-gray-200">
            {t('footer.connectWithUs')}
          </h1>

          <div className="flex flex-wrap gap-3">
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl bg-pink-500 shadow-md transition-transform hover:scale-110">
              <IoLogoInstagram className="text-2xl text-white" />
            </div>
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl bg-pink-500 shadow-md transition-transform hover:scale-110">
              <CiFacebook className="text-2xl text-white" />
            </div>
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl bg-pink-500 shadow-md transition-transform hover:scale-110">
              <AiOutlineYoutube className="text-2xl text-white" />
            </div>
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl bg-pink-500 shadow-md transition-transform hover:scale-110">
              <FaWhatsapp className="text-2xl text-white" />
            </div>
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl bg-pink-500 shadow-md transition-transform hover:scale-110">
              <CiLinkedin className="text-3xl text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr className="border-t border-gray-400 md:mt-10" />

    {/* Copyright Section */}
    <div className="border-t border-gray-800/50 py-4 text-center">
      <p className="wrap-break-words px-4 text-[12px] leading-relaxed tracking-wide text-gray-400 md:text-sm">
        © 2026 <span className="font-semibold text-pink-500">Easy Shop</span>.
        <span className="mt-1 block md:ml-1 md:mt-0 md:inline">
          {t('footer.allRightsReserved')}
        </span>
      </p>
    </div>
  </section>
);
}

export default Footer;