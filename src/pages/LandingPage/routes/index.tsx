import { useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'

import { logoutFn } from '~/lib/auth'
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
import { PATHS } from '~/routes/PATHS'
import { Button } from '~/components/Button'
import { API_URL } from '~/config'

import bannerLandingPage from '~/assets/images/landingpage/banner-landingpage.png'
import { GroupSlideTop } from '~/components/SVGIcons'

import defaultUserIcon from '~/assets/icons/default-user.svg'

export function LandingPage() {
  const navigate = useNavigate()

  const { data: userInfoData } = useUserInfo({
    config: {
      useErrorBoundary: false,
    },
  })

  const [showScrollButton, setShowScrollButton] = useState(false)
  const introRef: RefObject<HTMLDivElement> = useRef(null)
  const PackOfDataRef: RefObject<HTMLDivElement> = useRef(null)
  const ProductRef: RefObject<HTMLDivElement> = useRef(null)
  const OrderRef: RefObject<HTMLDivElement> = useRef(null)
  const FAQRef: RefObject<HTMLDivElement> = useRef(null)
  const Order1Ref: RefObject<HTMLDivElement> = useRef(null)

  const scrollToIntro = (Ref: RefObject<HTMLDivElement>) => {
    Ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

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
  return (
    <>
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
                  viettel
                </a>
              </div>
              <div className="ml-auto flex">
                <div className="flex justify-start">
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(introRef)}
                  >
                    <button>Giới thiệu</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(PackOfDataRef)}
                  >
                    <button>Gói cước</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(ProductRef)}
                  >
                    <button>Sản phẩm</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(OrderRef)}
                  >
                    <button>Platform IoT</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(Order1Ref)}
                  >
                    <button>Hệ thống CMP</button>
                  </div>
                  <div
                    className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white"
                    onClick={() => scrollToIntro(FAQRef)}
                  >
                    <button>FAQ</button>
                  </div>
                  <div className="flex min-w-fit items-center justify-center px-3 text-base font-bold text-white">
                    Tài khoản
                  </div>
                </div>
              </div>
              {userInfoData != null ? (
                <div className="ml-auto flex">
                  <div
                    className="flex min-w-fit items-center justify-center text-white"
                    onClick={() => {
                      console.log(userInfoData)
                    }}
                  >
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
                    <div
                      className="mx-4 text-base font-bold text-white"
                      onClick={() => {
                        logoutFn()
                      }}
                    >
                      <button>Đăng Xuất</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ml-auto flex">
                  <div className="flex min-w-fit items-center justify-center text-white">
                    <Button
                      type="button"
                      className="w-full border-none bg-transparent px-1 font-bold text-white"
                      variant="primary"
                      onClick={() => navigate(PATHS.LOGIN)}
                    >
                      Đăng nhập
                    </Button>
                  </div>
                  <div className="mx-1 flex min-w-fit items-center justify-center text-white">
                    <Button
                      type="button"
                      className="w-full rounded-r-lg rounded-tl-lg bg-red-950 px-5 text-left font-bold text-white"
                      variant="primary"
                      onClick={() => navigate(PATHS.REGISTER)}
                    >
                      Đăng ký ngay
                    </Button>
                  </div>
                </div>
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
                  Viettel M2M IoT 2023{' '}
                  <i className="mt-1 pl-4 text-base text-[(219,255,0,1)]">
                    {'>>'}
                  </i>
                </a>
              </div>
            </div>
            <div className="mt-[4.5rem] flex max-w-full items-center justify-center text-white">
              <h2 className="text-[56px] font-bold">
                Dịch vụ Sim Data truyền tải dữ liệu
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
                  type="button"
                  className="w-full rounded-r-lg rounded-tl-lg bg-red-950 bg-opacity-50 px-8 text-left  font-bold text-white hover:bg-white  hover:text-slate-950"
                  variant="primary"
                >
                  Sản phẩm
                </Button>
              </div>
              <div className="mx-1 flex min-w-fit items-center justify-center text-white">
                <Button
                  type="button"
                  className="w-full rounded-r-lg rounded-tl-lg bg-red-950 bg-opacity-50 px-8 text-left font-bold text-white  hover:bg-white hover:text-slate-950 "
                  variant="primary"
                >
                  Platform IoT
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative top-[-74px] z-50" ref={introRef}>
        <SectionIntro></SectionIntro>
      </div>
      <div>
        <SectionSolution></SectionSolution>
      </div>
      <div className="h-[150px]" ref={PackOfDataRef}></div>
      {/* h-[823px] bg-slate-200*/}
      <div ref={ProductRef}>
        <SectionProduct></SectionProduct>
      </div>

      <div ref={OrderRef}>
        <SectionOrder></SectionOrder>
      </div>

      <div ref={Order1Ref}>
        <SectionOrder1></SectionOrder1>
      </div>
      <div>
        <SectionClient></SectionClient>
      </div>
      <div ref={FAQRef}>
        <QandA></QandA>
      </div>
      {/* <div>
        <SectionNews></SectionNews>
      </div> */}
      <div>
        <SectionFooter></SectionFooter>
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
            ></GroupSlideTop>
          </button>
        )}
      </div>
    </>
  )
}
