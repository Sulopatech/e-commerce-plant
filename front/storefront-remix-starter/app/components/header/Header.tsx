import { useState } from 'react';
import { Link, useLoaderData } from '@remix-run/react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { SearchBar } from '~/components/header/SearchBar';
import { useRootLoader } from '~/utils/use-root-loader';
import { UserIcon } from '@heroicons/react/24/solid';
import { useScrollingUp } from '~/utils/use-scrolling-up';
import { classNames } from '~/utils/class-names';
import { useTranslation } from 'react-i18next';
import Sulopa_Logo from '../assets/Sulopa_Whitelogo.png';

export function Header({
  onCartIconClick,
  cartQuantity,
}: {
  onCartIconClick: () => void;
  cartQuantity: number;
}) {
  const data = useRootLoader();
  const isSignedIn = !!data.activeCustomer.activeCustomer?.id;
  const isScrollingUp = useScrollingUp();
  const { t } = useTranslation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header
      className={classNames(
        isScrollingUp ? 'sticky top-0 z-10 animate-dropIn' : '',
        'bg-gradient-to-r from-zinc-700 to-gray-900 shadow-lg transform shadow-xl',
      )}
    >
      <div className="bg-zinc-100 text-gray-600 shadow-inner text-center text-sm py-2 px-2 xl:px-0">
        <div className="max-w-6xl mx-2 md:mx-auto flex items-center justify-end">
          {/* <div>
            <p className="hidden sm:block">
              {t('vendure.exclusive')}{' '}
              <a
                href="https://github.com/vendure-ecommerce/storefront-remix-starter"
                target="_blank"
                className="underline"
              >
                {t('vendure.repoLinkLabel')}
              </a>
            </p>
          </div> */}
          <div>
            <Link
              to={isSignedIn ? '/account' : '/sign-in'}
              className="flex space-x-1"
            >
              <UserIcon className="w-4 h-4"></UserIcon>
              <span>
                {isSignedIn ? t('account.myAccount') : t('account.signIn')}
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-4 flex items-center space-x-4">
        <h1 className="text-white w-10">
          <Link to="/">
            {/* <img
              // src="/Sulopa_Whitelogo.png"
              src={Sulopa_Logo}
              // style={{ height: '40px', width: '50px' }}
              width={80}
              height={61}
              alt={t('commmon.logoAlt')}
            /> */}
            <h1 className='text-28 font-bold'>Sulopa</h1>
          </Link>
        </h1>
        <div className="relative md:hidden">
          <button
            className="text-sm md:text-base text-gray-200 hover:text-white"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {t('collections')}
          </button>
          {isDropdownOpen && (
            <div className="absolute mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-100">
              {data.collections.map((collection) => (
                <Link
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                  to={'/collections/' + collection.slug}
                  prefetch="intent"
                  key={collection.id}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {collection.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="hidden md:flex space-x-4 ml-10">
          {data.collections.map((collection) => (
            <Link
              className="text-sm md:text-base text-gray-200 hover:text-white"
              to={'/collections/' + collection.slug}
              prefetch="intent"
              key={collection.id}
            >
              {collection.name}
            </Link>
          ))}
        </div>
        <div className="flex-1 md:pr-8">
          <SearchBar />
        </div>
        <div className="">
          <button
            className="relative w-9 h-9 bg-white bg-opacity-20 rounded text-white p-1"
            onClick={onCartIconClick}
            aria-label="Open cart tray"
          >
            <ShoppingBagIcon />
            {cartQuantity ? (
              <div className="absolute rounded-full -top-2 -right-2 bg-primary-600 min-w-6 min-h-6 flex items-center justify-center text-xs p-1">
                {cartQuantity}
              </div>
            ) : (
              ''
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
