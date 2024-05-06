import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselDot,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/Carousel'
import Pic1 from '@/assets/images/landingpage/Pict_9s.png'
import Pic2 from '@/assets/images/landingpage/Pict_7s.png'
import Pic3 from '@/assets/images/landingpage/Pict_8s.png'
import Pic4 from '@/assets/images/landingpage/Pict_13s.png'
import Pic5 from '@/assets/images/landingpage/Pict_15s.png'
import Pic6 from '@/assets/images/landingpage/Pict_11s.png'
import Pic7 from '@/assets/images/landingpage/Pict_6s.png'
import Autoplay from 'embla-carousel-autoplay'

export function SectionProduct() {
  const { t } = useTranslation()

  const slides = [
    {
      src: Pic1,
      alt: '9',
      title_h1: t('landingpage:section_product.slide.slide_1.title_1'),
      title_h2: t('landingpage:section_product.slide.slide_1.title_2'),
      launching: t('landingpage:section_product.lauching'),
      href: 'https://viettel.vn/MyKID',
    },
    {
      src: Pic2,
      alt: '17',
      title_h1: t('landingpage:section_product.slide.slide_2.title_1'),
      title_h2: t('landingpage:section_product.slide.slide_2.title_2'),
      launching: t('landingpage:section_product.lauching'),
      href: 'https://smartmotor.vn/',
    },
    {
      src: Pic3,
      alt: '12',
      title_h1: t('landingpage:section_product.slide.slide_3.title_1'),
      title_h2: t('landingpage:section_product.slide.slide_3.title_2'),
      launching: t('landingpage:section_product.lauching'),
      href: 'https://viettel.vn/vcar',
    },
    {
      src: Pic4,
      alt: '13',
      title_h1: t('landingpage:section_product.slide.slide_4.title_1'),
      title_h2: t('landingpage:section_product.slide.slide_4.title_2'),
      launching: t('landingpage:section_product.developing'),
      href: '#',
    },
    {
      src: Pic5,
      alt: '15',
      title_h1: t('landingpage:section_product.slide.slide_5.title_1'),
      title_h2: t('landingpage:section_product.slide.slide_5.title_2'),
      launching: t('landingpage:section_product.lauching'),
      href: '#',
    },
    {
      src: Pic6,
      alt: '14',
      title_h1: t('landingpage:section_product.slide.slide_6.title_1'),
      title_h2: t('landingpage:section_product.slide.slide_6.title_2'),
      launching: t('landingpage:section_product.lauching'),
      href: '#',
    },
    {
      src: Pic7,
      alt: '16',
      title_h1: t('landingpage:section_product.slide.slide_7.title_1'),
      title_h2: t('landingpage:section_product.slide.slide_7.title_2'),
      launching: t('landingpage:section_product.lauching'),
      href: 'https://viettel.vn/vtag',
    },
  ]

  return (
    <>
      <div className="mt-[80px]">
        <div>
          <p className="py-2 pb-8 text-center text-[28px] font-bold text-[#EA0033]">
            {t('landingpage:section_product.iot')}
          </p>
          <div className="flex justify-center">
            <h3 className="px-[50px] text-center font-semibold leading-[43px] xs2:w-[360px] xs2:text-[28px] xs:w-[400px] xl:w-[588px] xl:text-[35px]">
              {t('landingpage:section_product.variety')}
            </h3>
          </div>
        </div>
        <div className="flex w-full justify-center ">
          <div className="pt-[50px] xs2:w-[270px] xs:w-[267px] sm:w-[270px] md:w-[570px] lg:w-[870px] xl:w-[1200px]">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
            >
              <CarouselContent className="">
                {slides.map((item, index) => (
                  <CarouselItem key={index} className=" basis-1/4 ">
                    <div className="rounded-lg shadow-md">
                      <div className="h-fit w-[200px]">
                        <img src={item.src} alt={item.alt} />
                      </div>
                      <div className="text-body-h2 pb-[10px] pt-[20px] text-center font-bold">
                        {item.title_h1}
                      </div>
                      <div className="text-center text-base">
                        {item.title_h2}
                      </div>
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
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselDot />
            </Carousel>
          </div>
        </div>
      </div>
    </>
  )
}
