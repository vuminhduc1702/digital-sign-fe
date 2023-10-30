import React from 'react'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Carousel from 'react-multi-carousel'
import { StateCallBack } from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import { Button } from '~/components/Button'

export function SectionProduct() {
  const slides = [
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/Pict_9.jpg',
      alt: '9',
      title_h1: 'Đồng hồ thông minh',
      title_h2: 'MyKID',
      launching: 'Xem chi tiết',
      href: 'https://viettel.vn/MyKID',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/Pict_7.jpg',
      alt: '17',
      title_h1: 'Quản lý tài sản',
      title_h2: 'IoT V-Tracking: Ô tô',
      launching: 'Xem chi tiết',
      href: 'https://smartmotor.vn/',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/Pict_8.jpg',
      alt: '12',
      title_h1: 'Ô tô thông minh',
      title_h2: 'vTag',
      launching: 'Xem chi tiết',
      href: 'https://viettel.vn/vcar',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/Pict_13.jpg',
      alt: '13',
      title_h1: 'Sức khỏe cá nhân',
      title_h2: 'VHealth',
      launching: 'Đang phát triển',
      href: '#',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/Pict_15.jpg',
      alt: '15',
      title_h1: 'Office thông minh',
      title_h2: 'Camera Al',
      launching: 'Xem chi tiết',
      href: '#',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/Pict_11.jpg',
      alt: '14',
      title_h1: 'Căn hộ thông minh',
      title_h2: 'Home Camera',
      launching: 'Xem chi tiết',
      href: '#',
    },
    {
      src: 'https://innoway.vn/assets/images/landingPageTelco/Pict_6.jpg',
      alt: '16',
      title_h1: 'Định vị thông minh',
      title_h2: 'vTag',
      launching: 'Xem chi tiết',
      href: 'https://viettel.vn/vtag',
    },
  ]

  const { t } = useTranslation()
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  }

  return (
    <>
      <div className="">
        <div className="">
          <p className="py-2 pb-8 text-center text-[28px] font-bold text-[#EA0033]">
            {t('landingpage:section_product.iot')}
          </p>
          <div className="flex justify-center">
            <h3 className="w-[588px] px-[50px] text-center text-[35px] leading-[43px]">
              {t('landingpage:section_product.variety')}
            </h3>
          </div>
        </div>
        <div className="flex w-full justify-center">
          <div className="w-[1200px] pt-[50px]">
            <Carousel
              className=""
              containerClass="carousel-container p-[0px]"
              responsive={responsive}
              transitionDuration={300}
              infinite
              itemClass="w-fit flex justify-center"
              autoPlay
              autoPlaySpeed={3000}
            >
              {slides.map((item, idx) => (
                <div className="rounded-lg shadow-md" key={idx}>
                  <div className="h-fit w-[200px]">
                    <img src={item.src} alt={item.alt} />
                  </div>
                  <div className="text-body-h2 pb-[10px] pt-[20px] text-center font-bold">
                    {item.title_h1}
                  </div>
                  <div className="text-center text-base">{item.title_h2}</div>
                  <div className="flex justify-center pb-[30px] pt-[40px]">
                    <a href={item.href} target="_blank" rel="noreferrer">
                      <Button
                        type="button"
                        className="rounded-r-lg rounded-tl-lg border-[#EA0033] bg-white text-[#EA0033] hover:-translate-y-px hover:opacity-100 hover:shadow-xl"
                        variant="primary"
                      >
                        {item.launching}
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </>
  )
}
