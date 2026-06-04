
import { useNavigate } from 'react-router-dom';
import { useActiveSubCategories } from '../hook/useSubCategories';

import { useTranslation } from 'react-i18next';

function HomeProdGrid() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: subCategories, isLoading, isError } = useActiveSubCategories();
    const activeSubCats = subCategories || [];

    const handleNavigate = (item) => {
        if (!item?._id) return;
        navigate(`/all_products/${item.catId._id}/${item.catId.catName}?subCatId=${item._id}`);
    };

    if (isLoading) return <p className="text-center py-10">{t('home.loadingCollections')}</p>;
    if (isError) return <p className="text-center py-10 text-red-500">{t('home.somethingWrong')}</p>;

   return (
  <section className="w-full px-4 sm:px-5 lg:px-6 py-8 md:py-16">
    <div className="mx-auto max-w-6xl">

      {/* heading */}
      <div className="mb-8 flex flex-col items-center text-center md:mb-12">
        <h2 className="max-w-88 wrap-break-words text-center text-2xl font-bold leading-tight tracking-tight text-gray-800 sm:max-w-xl md:max-w-3xl md:text-4xl">
          {t('home.shopByCategory')}
        </h2>

        <div className="mt-3 h-1 w-20 rounded-full bg-pink-500 md:h-1.5"></div>

        <p className="mt-4 max-w-84  wrap-break-words text-center text-[11px] uppercase leading-relaxed tracking-widest text-gray-500 sm:max-w-2xl sm:text-xs md:text-sm">
          {t('home.exploreCollections')}
        </p>
      </div>

      {/* The Grid Layout */}
      <div className="grid auto-rows-[16rem] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[11rem] lg:auto-rows-[12rem]">

        {/* 1. Big Vertical Box */}
        <div
          onClick={() => handleNavigate(activeSubCats[0])}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 sm:col-span-2 md:row-span-2 md:rounded-3xl"
        >
          {activeSubCats[0] && (
            <img
              src={activeSubCats[0].subCatImage}
              alt={activeSubCats[0].subCatName}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}

          <div className="absolute inset-0 bg-black/25 transition-all duration-300 group-hover:bg-black/40"></div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:py-5 sm:px-3 text-white md:p-8">
            <h3 className="max-w-full wrap-break-words text-xl md:text-2xl font-bold leading-tight">
              {activeSubCats[0]?.subCatName}
            </h3>

            <button className="mt-4 min-h-10 max-w-full rounded-full bg-white px-3 md:px-5 md:py-2 text-center text-xs md:text-sm font-bold leading-tight text-black transition-colors hover:bg-pink-500 hover:text-white">
              {t('home.explore')}
            </button>
          </div>
        </div>

        {/* 2. Horizontal Wide Box */}
        <div
          onClick={() => handleNavigate(activeSubCats[1])}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 sm:col-span-2 md:rounded-3xl"
        >
          {activeSubCats[1] && (
            <img
              src={activeSubCats[1].subCatImage}
              alt={activeSubCats[1].subCatName}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}

          <div className="absolute inset-0 bg-black/25 transition-all duration-300 group-hover:bg-black/40"></div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:py-5 sm:px-3 text-white">
            <h3 className="max-w-full wrap-break-words text-xl md:text-2xl font-bold leading-tight">
              {activeSubCats[1]?.subCatName}
            </h3>

            <span className="mt-2 block max-w-full wrap-break-words text-sm font-bold leading-tight text-pink-400">
              {t('home.shopNowLink')}
            </span>
          </div>
        </div>

        {[2, 3, 4, 5].map((catIndex) => (
          <div
            key={catIndex}
            onClick={() => handleNavigate(activeSubCats[catIndex])}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 md:rounded-3xl"
          >
            {activeSubCats[catIndex] && (
              <img
                src={activeSubCats[catIndex].subCatImage}
                alt={activeSubCats[catIndex].subCatName}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}

            <div className="absolute inset-0 bg-black/20 transition-all duration-300 group-hover:bg-black/35"></div>

            <div className="absolute inset-x-0 bottom-0 p-5 sm:py-5 sm:px-3 text-white ">
              <h3 className="max-w-full wrap-break-words text-xl font-bold leading-tight">
                {activeSubCats[catIndex]?.subCatName}
              </h3>

              <p className="mt-1 max-w-full wrap-break-words text-xs font-bold leading-tight text-pink-400">
                {t('home.exclusiveStyles')}
              </p>
            </div>
          </div>
        ))}

        {/* 7. Wide Box */}
        <div
          onClick={() => handleNavigate(activeSubCats[6])}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 sm:col-span-2 md:rounded-3xl"
        >
          {activeSubCats[6] && (
            <img
              src={activeSubCats[6].subCatImage}
              alt={activeSubCats[6].subCatName}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}

          <div className="absolute inset-0 bg-black/20 transition-all duration-300 group-hover:bg-black/35"></div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:py-5 sm:px-3 text-white">
            <h3 className="max-w-full wrap-break-words text-xl md:text-2xl font-bold leading-tight">
              {activeSubCats[6]?.subCatName}
            </h3>

            <p className="mt-1 max-w-full wrap-break-words text-xs font-bold leading-tight text-pink-400">
              {t('home.exclusiveStyles')}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}

export default HomeProdGrid;