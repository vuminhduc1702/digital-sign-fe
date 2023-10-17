import { useNavigate } from 'react-router-dom'
import { useUser, logoutFn } from '~/lib/auth'
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

import bannerLandingPage from '~/assets/images/landingpage/banner-landingpage.png'
import { GroupSlideTop } from '~/components/SVGIcons'
import { Button } from '~/components/Button'

import { useEffect, useRef, useState, RefObject } from 'react'
import { PATHS } from '~/routes/PATHS'
import storage from '~/utils/storage'

export function LandingPage() {
  const navigate = useNavigate()

  const user = useUser()
  // const user = useUserInfo()
  // console.log(user.data)

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
          className="h-full max-w-full"
          style={{
            backgroundImage: `url(${bannerLandingPage})`,
          }}
        >
          <div className="">
            <div className="h-full max-w-full px-4 py-2">
              <div className="min-w-fit">
                <div className="mx-[12rem] flex h-20 min-w-max justify-start">
                  <div className="flex h-full w-1/6 items-center justify-center">
                    <a href="/" className="text-5xl font-bold text-white">
                      viettel
                    </a>
                  </div>
                  <div className="flex h-full w-4/6">
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
                  {user.data ? (
                    <div className="flex h-full w-1/6 justify-start">
                      <div
                        className="flex min-w-fit items-center justify-center text-white"
                        onClick={() => {
                          // logoutFn()
                          console.log(user.data)
                        }}
                      >
                        <div className="">
                          <a href="#" className="">
                            <img
                              className="h-10 w-10 rounded-full p-1 ring-2 ring-gray-300 dark:ring-gray-500"
                              src="https://cdn.24h.com.vn/upload/3-2020/images/2020-08-05/hot-girl-bi-boc-me-nhan-sac-2-1596620332-726-width660height672.jpg"
                              alt="avatar"
                            />
                          </a>
                        </div>
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
                    <div className="flex h-full w-1/6 justify-start ">
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
                          className="w-full rounded-r-lg rounded-tl-lg bg-red-950 px-5 text-left font-bold  text-white"
                          variant="primary"
                          onClick={() => navigate(PATHS.REGISTER)}
                        >
                          Đăng ký ngay
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-[1rem] flex h-8 max-w-full items-center justify-center">
                <div className="rounded-r-lg rounded-tl-lg border-[1.75px] border-solid border-[#DBFF00] px-5 py-2">
                  <a
                    href="http://www.vietteliot2023.com"
                    className="flex text-center text-2xl font-bold text-[#DBFF00]"
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
                    M2M là công nghệ cho phép các thiết bị có thể trao đổi với
                    các hệ thống thông qua kết nối mạng. Dịch vụ data M2M: Là
                    dịch vụ trong đó sim data được sử dụng để truyền tải dữ
                    liệu.
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
      </div>
      <div className="relative top-[-74px] z-50" ref={introRef}>
        <SectionIntro></SectionIntro>
      </div>
      <div>
        <SectionSolution></SectionSolution>
      </div>
      <div className="h-[823px] bg-slate-200" ref={PackOfDataRef}></div>
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
      <div>
        <SectionNews></SectionNews>
      </div>
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
