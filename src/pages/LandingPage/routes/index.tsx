import { useSpinDelay } from 'spin-delay'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { useLogout, useUser } from '~/lib/auth'
import { useUserInfo } from '~/cloud/orgManagement/api/userAPI'
import { SectionIntro } from '../components/section-introduction'
import { SectionSolution } from '../components/section-solution'
import { SectionProduct } from '../components/section-product'
import { SectionOrder } from '../components/section-order'
import { SectionOrder1 } from '../components/section-order-1'
import { SectionClient } from '../components/section-client'
import { QandA } from '../components/section-Q&A'
import { SectionNews } from '../components/section-news'
import { SectionFooter } from '../components/footer'
import { SectionPackageData } from '../components/section-package-data'
import { PATHS } from '~/routes/PATHS'
import { Button } from '~/components/Button'
import { API_URL } from '~/config'
import storage from '~/utils/storage'
import { scrollToIntro } from '~/utils/misc'
import { ContentLayout } from '~/layout/ContentLayout'
import { Link } from '~/components/Link'
import { Spinner } from '~/components/Spinner'

import bannerLandingPage from '~/assets/images/landingpage/banner-landingpage.png'
import { GroupSlideTop, SidebarDropDownIcon } from '~/components/SVGIcons'
import defaultUserIcon from '~/assets/icons/default-user.svg'

export function LandingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: userDataFromStorage } = useUser()
  const { data: userInfoData, isLoading: userInfoIsLoading } = useUserInfo({
    config: {
      useErrorBoundary: false,
      suspense: false,
      enabled: !!storage.getToken(),
    },
  })
  const logout = useLogout()

  const [showScrollButton, setShowScrollButton] = useState(false)
  const introRef: RefObject<HTMLDivElement> = useRef(null)
  const PackOfDataRef: RefObject<HTMLDivElement> = useRef(null)
  const solutionRef: RefObject<HTMLDivElement> = useRef(null)
  const ProductRef: RefObject<HTMLDivElement> = useRef(null)
  const OrderRef: RefObject<HTMLDivElement> = useRef(null)
  const FAQRef: RefObject<HTMLDivElement> = useRef(null)
  const Order1Ref: RefObject<HTMLDivElement> = useRef(null)

  const currentYear = new Date().getFullYear()
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButton(true)
      } else {
        setShowScrollButton(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const showSpinner = useSpinDelay(userInfoIsLoading, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <ContentLayout title={t('landingpage:title')}>
      <div className="h-[500px]">
        <div
          className="h-full"
          style={{
            backgroundImage: `url(${bannerLandingPage})`,
          }}
        >
          <div className="px-4 py-2">
            <div className="flex h-20 px-48">
              <div className="flex items-center">
                <a href="/" className="text-5xl font-bold text-white">
                  {t('landingpage:logo')}
                </a>
              </div>
              <div className="flex w-full justify-center">
                <div className="flex justify-start">
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(introRef)}
                  >
                    <button>{t('landingpage:introduction')}</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(PackOfDataRef)}
                  >
                    <button>{t('landingpage:pack_of_data')}</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(ProductRef)}
                  >
                    <button>{t('landingpage:product')}</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(OrderRef)}
                  >
                    <button>{t('landingpage:Platform_IoT')}</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(Order1Ref)}
                  >
                    <button>{t('landingpage:CMP_system')}</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(FAQRef)}
                  >
                    <button>{t('landingpage:FAQ')}</button>
                  </div>
                </div>
              </div>
              {userInfoIsLoading && userInfoData != null ? (
                <div className="flex items-center justify-center">
                  <Spinner
                    showSpinner={showSpinner}
                    size="md"
                    className="text-white"
                  />
                </div>
              ) : userInfoData == null ? (
                <div className="ml-auto flex">
                  <div className="flex min-w-fit items-center justify-center text-white">
                    <Button
                      type="button"
                      className="w-full border-none bg-transparent px-1 font-bold text-white"
                      variant="primary"
                      onClick={() => navigate(PATHS.LOGIN)}
                    >
                      {t('user:login')}
                    </Button>
                  </div>
                  <div className="mx-1 flex min-w-fit items-center justify-center text-white">
                    <Button
                      type="button"
                      className="w-full rounded-r-lg rounded-tl-lg bg-red-950 px-5 text-left font-bold text-white"
                      variant="primary"
                      onClick={() => navigate(PATHS.REGISTER)}
                    >
                      {t('landingpage:register_now')}
                    </Button>
                  </div>
                </div>
              ) : (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    asChild
                    className="flex items-center gap-x-2"
                  >
                    <div className="ml-auto flex">
                      <div className="flex w-max ">
                        <img
                          src={`${
                            userInfoData?.profile?.profile_image !== ''
                              ? `${API_URL}/file/${userInfoData?.profile?.profile_image}`
                              : defaultUserIcon
                          }`}
                          alt="User's avatar"
                          className="aspect-square w-10 rounded-full p-1 ring-2 ring-gray-300 dark:ring-gray-500"
                          onError={e => {
                            const target = e.target as HTMLImageElement
                            target.onerror = null
                            target.src = defaultUserIcon
                          }}
                        />

                        <div className="mx-4 flex cursor-pointer items-center justify-center">
                          <p className="mr-2 text-white">
                            {t('nav:hello')}{' '}
                            {userInfoData?.name ||
                              userInfoData?.email?.split('@')[0]}
                          </p>
                          <SidebarDropDownIcon
                            width={12}
                            height={7}
                            viewBox="0 0 12 7"
                            className="text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="flex max-h-[360px] w-[220px] flex-col gap-y-3 overflow-y-auto rounded-md bg-white p-3 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                      sideOffset={5}
                    >
                      <Link
                        to="https://iot.viettel.vn/"
                        target="_blank"
                        className="cursor-pointer"
                      >
                        <DropdownMenu.Item className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                          {t('user:cmp')}
                        </DropdownMenu.Item>
                      </Link>
                      <Link to={PATHS.USER_INFO} className="cursor-pointer">
                        <DropdownMenu.Item className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                          {t('user:user_info')}
                        </DropdownMenu.Item>
                      </Link>
                      <DropdownMenu.Item className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                        {userDataFromStorage ? (
                          <p
                            className="cursor-pointer"
                            onClick={() => {
                              navigate(PATHS.CHANGEPASSWORD)
                            }}
                          >
                            {t('user:change_password')}
                          </p>
                        ) : null}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="rounded-md p-2 hover:bg-primary-300 hover:bg-opacity-25 focus-visible:border-none focus-visible:outline-none">
                        <p
                          className="cursor-pointer"
                          onClick={() => logout.mutate({})}
                        >
                          {t('user:logout')}
                        </p>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              )}
            </div>

            <div className="mt-[1rem] flex h-8 max-w-full items-center justify-center">
              <div className="rounded-r-lg rounded-tl-lg border-[1.75px] border-solid border-[#DBFF00] px-5 py-2">
                <a
                  href="http://www.vietteliot2023.com"
                  className="flex text-center text-2xl font-bold text-[#DBFF00]"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('landingpage:viettel_M2M')}
                  {currentYear}{' '}
                  <i className="mt-1 pl-4 text-base text-[(219,255,0,1)]">
                    {'>>'}
                  </i>
                </a>
              </div>
            </div>
            <div className="mt-[4.5rem] flex max-w-full items-center justify-center text-white">
              <h2 className="text-[56px] font-bold">
                {t('landingpage:service_transmit_data')}
              </h2>
            </div>
            <div className="flex max-w-full items-center justify-center">
              <div className="mt-[3.5rem] flex w-1/2 items-center justify-center pl-20 text-white">
                <p className="text-base">
                  M2M là công nghệ cho phép các thiết bị có thể trao đổi với các
                  hệ thống thông qua kết nối mạng. Dịch vụ data M2M: Là dịch vụ
                  trong đó sim data được sử dụng để truyền tải dữ liệu.
                </p>
              </div>
            </div>
            <div className="mt-3 flex max-w-full items-center justify-center gap-4">
              <div className="mx-1 flex min-w-fit items-center justify-center text-white">
                <Button
                  onClick={() => scrollToIntro(ProductRef)}
                  type="button"
                  className="w-full rounded-r-lg rounded-tl-lg bg-red-950 bg-opacity-50 px-8 text-left  font-bold text-white hover:bg-white  hover:text-slate-950"
                  variant="primary"
                >
                  {t('landingpage:product')}
                </Button>
              </div>
              <div className="mx-1 flex min-w-fit items-center justify-center text-white">
                <Button
                  type="button"
                  className="w-full rounded-r-lg rounded-tl-lg bg-red-950 bg-opacity-50 px-8 text-left font-bold text-white  hover:bg-white hover:text-slate-950 "
                  variant="primary"
                  onClick={() => scrollToIntro(OrderRef)}
                >
                  {t('landingpage:Platform_IoT')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative top-[-74px] z-40" ref={introRef}>
        <SectionIntro solutionRef={solutionRef} />
      </div>
      <div ref={solutionRef}>
        <SectionSolution />
      </div>
      <div className="h-fit bg-white" ref={PackOfDataRef}>
        <SectionPackageData />
      </div>
      <div ref={ProductRef}>
        <SectionProduct />
      </div>
      <div ref={OrderRef}>
        <SectionOrder />
      </div>
      <div ref={Order1Ref}>
        <SectionOrder1 />
      </div>
      <div>
        <SectionClient />
      </div>
      <div ref={FAQRef}>
        <QandA />
      </div>
      {/* <div>
          <SectionNews></SectionNews>
        </div> */}
      <div>
        <SectionFooter />
      </div>
      <div>
        {showScrollButton && (
          <button
            className="fixed bottom-[10px] right-[10px]"
            onClick={scrollToTop}
          >
            <GroupSlideTop
              width={49}
              height={49}
              viewBox="0 0 49 49"
              className=""
            />
          </button>
        )}
      </div>
    </ContentLayout>
  )
}
